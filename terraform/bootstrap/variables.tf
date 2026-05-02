variable "region" {
  type        = string
  description = "AWS region for the state bucket and lock table."
  default     = "ap-south-1"
}

variable "name_prefix" {
  type        = string
  description = "Short prefix for globally unique resource names."
  default     = "devops-ecom"
}
