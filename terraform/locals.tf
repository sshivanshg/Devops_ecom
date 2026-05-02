locals {
  name_prefix = var.project_name

  execution_secrets = concat(
    var.database_url_secret_arn != "" ? [{ name = "DATABASE_URL", valueFrom = var.database_url_secret_arn }] : [],
    var.jwt_secret_arn != "" ? [{ name = "JWT_SECRET", valueFrom = var.jwt_secret_arn }] : [],
    var.cloudinary_cloud_name_arn != "" ? [{ name = "CLOUDINARY_CLOUD_NAME", valueFrom = var.cloudinary_cloud_name_arn }] : [],
    var.cloudinary_api_key_arn != "" ? [{ name = "CLOUDINARY_API_KEY", valueFrom = var.cloudinary_api_key_arn }] : [],
    var.cloudinary_api_secret_arn != "" ? [{ name = "CLOUDINARY_API_SECRET", valueFrom = var.cloudinary_api_secret_arn }] : [],
  )

  secretsmanager_resource_arns = compact([
    var.database_url_secret_arn,
    var.jwt_secret_arn,
    var.cloudinary_cloud_name_arn,
    var.cloudinary_api_key_arn,
    var.cloudinary_api_secret_arn,
  ])

  frontend_url = "http://${aws_lb.app.dns_name}"

  log_configuration = {
    logDriver = "awslogs"
    options = {
      "awslogs-group"         = aws_cloudwatch_log_group.app.name
      "awslogs-region"        = var.aws_region
      "awslogs-stream-prefix" = "ecs"
    }
  }

  container_definitions = jsonencode([
    {
      name  = "app"
      image = "public.ecr.aws/docker/library/node:20-bookworm-slim"
      command = [
        "node",
        "-e",
        "require('http').createServer((q,s)=>{s.statusCode=200;s.end('ok');}).listen(5001,'0.0.0.0');"
      ]
      essential = true
      portMappings = [
        {
          containerPort = 5001
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "PORT", value = "5001" },
        { name = "NODE_ENV", value = "production" },
        { name = "FRONTEND_URL", value = local.frontend_url },
      ]
      secrets          = local.execution_secrets
      logConfiguration = local.log_configuration
    }
  ])
}
