variable "aws_region" {
  type        = string
  description = "AWS region (match GitHub secret AWS_REGION)."
}

variable "project_name" {
  type        = string
  description = "Short name prefix for resources."
  default     = "devops-ecom"
}

variable "database_url_secret_arn" {
  type        = string
  description = "Secrets Manager ARN for DATABASE_URL (MongoDB connection string)."
  default     = ""
  sensitive   = true
}

variable "jwt_secret_arn" {
  type        = string
  description = "Secrets Manager ARN for JWT_SECRET."
  default     = ""
  sensitive   = true
}

variable "cloudinary_cloud_name_arn" {
  type        = string
  description = "Secrets Manager ARN for CLOUDINARY_CLOUD_NAME (optional)."
  default     = ""
  sensitive   = true
}

variable "cloudinary_api_key_arn" {
  type        = string
  description = "Secrets Manager ARN for CLOUDINARY_API_KEY (optional)."
  default     = ""
  sensitive   = true
}

variable "cloudinary_api_secret_arn" {
  type        = string
  description = "Secrets Manager ARN for CLOUDINARY_API_SECRET (optional)."
  default     = ""
  sensitive   = true
}

variable "fargate_cpu" {
  type        = number
  description = "Fargate task CPU units (256 = 0.25 vCPU)."
  default     = 512
}

variable "fargate_memory" {
  type        = number
  description = "Fargate task memory (MiB)."
  default     = 1024
}
