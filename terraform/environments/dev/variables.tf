variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "project" {
  type    = string
  default = "devops-shop"
}
variable "kubernetes_version" {
  type    = string
  default = "1.36"
}
variable "cluster_public_access_cidrs" {
  type        = list(string)
  description = "Trusted CIDRs allowed to reach the EKS API public endpoint. Replace before apply."
  default     = ["0.0.0.0/0"]
}
variable "existing_vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "github_repository" {
  type    = string
  default = "sshaurya84/devops_shop"
}
