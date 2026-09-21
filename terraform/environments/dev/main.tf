provider "aws" { region = var.aws_region }

module "platform" {
  source = "../../modules/platform"

  aws_region                  = var.aws_region
  project                     = var.project
  kubernetes_version          = var.kubernetes_version
  cluster_public_access_cidrs = var.cluster_public_access_cidrs

  vpc_id             = var.existing_vpc_id
  public_subnet_ids  = var.public_subnet_ids
  private_subnet_ids = var.private_subnet_ids
}
