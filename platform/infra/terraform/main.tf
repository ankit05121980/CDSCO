###############################################################################
# Athena Platform — AWS reference infrastructure (illustrative module wiring).
#
# Provisions the managed dependencies the platform expects in production:
#   - VPC (multi-AZ) via the official AWS VPC module
#   - EKS cluster for the API/Web workloads
#   - RDS PostgreSQL (Multi-AZ) for relational data
#   - ElastiCache Redis for caching / sessions / conversation memory
#   - S3 bucket for document/object storage
#
# Equivalent stacks for Azure (AKS + Azure DB + Cache) and GCP (GKE + Cloud SQL
# + Memorystore) follow the same module structure.
###############################################################################

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # backend "s3" { ... }  # configure remote state per environment
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = "athena"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name = "athena-${var.environment}"
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = local.name
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway = true
  single_nat_gateway = var.environment != "prod"
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = local.name
  cluster_version = var.kubernetes_version
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets

  eks_managed_node_groups = {
    default = {
      min_size       = var.node_min
      max_size       = var.node_max
      desired_size   = var.node_desired
      instance_types = var.node_instance_types
    }
  }
}

module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier        = local.name
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  multi_az          = var.environment == "prod"

  db_name  = "athena"
  username = "athena"
  port     = 5432

  vpc_security_group_ids = [aws_security_group.db.id]
  subnet_ids             = module.vpc.private_subnets
  storage_encrypted      = true
  deletion_protection    = var.environment == "prod"
}

resource "aws_security_group" "db" {
  name_prefix = "${local.name}-db-"
  vpc_id      = module.vpc.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${local.name}-redis"
  description          = "Athena cache / sessions"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "prod" ? 2 : 1
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${local.name}-redis"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_s3_bucket" "documents" {
  bucket = "${local.name}-documents"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket                  = aws_s3_bucket.documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
