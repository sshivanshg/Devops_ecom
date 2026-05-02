output "artifact_bucket_id" {
  value       = aws_s3_bucket.artifacts.id
  description = "Rubric S3 bucket (versioning, encryption, public access blocked)."
}

output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "ECR repository URL for docker push."
}

output "ecr_repository_name" {
  value = aws_ecr_repository.app.name
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.app.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "task_definition_family" {
  value       = aws_ecs_task_definition.app.family
  description = "Task definition family for CI task-definition updates."
}

output "alb_dns_name" {
  value       = aws_lb.app.dns_name
  description = "ALB DNS name for smoke tests."
}

output "alb_url" {
  value = "http://${aws_lb.app.dns_name}"
}
