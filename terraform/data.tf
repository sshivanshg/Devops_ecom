data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

# Default-VPC subnets that are the primary subnet per AZ (one per AZ). Using all subnets
# sorted by id can pick two subnets in the same AZ and breaks ALB: "cannot be attached to
# multiple subnets in the same Availability Zone".
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}
