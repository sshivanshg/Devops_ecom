output "tfstate_bucket_name" {
  value       = aws_s3_bucket.tfstate.bucket
  description = "Set GitHub secret TF_STATE_BUCKET to this value."
}

output "tfstate_lock_table_name" {
  value       = aws_dynamodb_table.tf_lock.name
  description = "Set GitHub secret TF_STATE_DYNAMODB_TABLE to this value."
}
