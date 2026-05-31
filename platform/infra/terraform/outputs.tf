output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "db_endpoint" {
  value     = module.db.db_instance_endpoint
  sensitive = true
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "documents_bucket" {
  value = aws_s3_bucket.documents.bucket
}
