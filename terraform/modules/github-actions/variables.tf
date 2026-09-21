variable "aws_region" {
  type = string
}

variable "project" {
  type = string
}

variable "github_repository" {
  type        = string
  description = "GitHub owner/repository allowed to publish the product-service image."
}
