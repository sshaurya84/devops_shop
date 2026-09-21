variable "aws_region" { type = string }
variable "project" { type = string }
variable "kubernetes_version" { type = string }
variable "cluster_public_access_cidrs" { type = list(string) }
variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}
