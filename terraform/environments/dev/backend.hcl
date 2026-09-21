# Copy this file to backend.hcl and replace the bucket value. Never place AWS
# credentials in either file; the AWS CLI temporary session supplies them.
bucket       = "devops-shop-tf-state"
key          = "dev/terraform.tfstate"
region       = "us-east-1"
encrypt      = true
use_lockfile = true
