terraform {
  required_version = ">= 1.15.0, < 1.17.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # The S3 settings are supplied at terraform init time from backend.hcl.
  # Keeping bucket names out of this file makes the module reusable and avoids
  # committing account-specific backend values.
  backend "s3" {}
}
