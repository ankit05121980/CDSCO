variable "region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type        = string
  description = "dev | qa | uat | prod"
  default     = "dev"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnets" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  type    = list(string)
  default = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "kubernetes_version" {
  type    = string
  default = "1.30"
}

variable "node_instance_types" {
  type    = list(string)
  default = ["m6i.large"]
}

variable "node_min" {
  type    = number
  default = 3
}

variable "node_max" {
  type    = number
  default = 20
}

variable "node_desired" {
  type    = number
  default = 3
}

variable "db_instance_class" {
  type    = string
  default = "db.m6g.large"
}

variable "db_allocated_storage" {
  type    = number
  default = 100
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.medium"
}
