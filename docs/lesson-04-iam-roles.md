# Lesson 4 — IAM roles and separation of duties

## Stop: do not use the root user for project work

The initial CLI verification identified the AWS root principal. Use it only to
secure the account and establish a non-root workforce identity. Root must have
MFA enabled and must not have access keys.

For this course, enable **IAM Identity Center** in the AWS console, create a
named administrator user protected by MFA, and assign it to the AWS account
with an administrator permission set for the short-lived bootstrap phase. This
identity replaces root access. We will narrow deployment permissions once the
Terraform resources are defined.

## Configure a named AWS CLI profile

After IAM Identity Center is set up, configure its profile. The wizard needs
the access portal start URL, the Identity Center region, AWS account, and
permission set shown in the console:

```powershell
aws configure sso --profile devops-shop
aws sso login --profile devops-shop
aws sts get-caller-identity --profile devops-shop --output json
```

The resulting ARN should be an assumed role (commonly an `AWSReservedSSO...`
role), not `arn:aws:iam::<account-id>:root`.

Use this profile explicitly while learning:

```powershell
aws ec2 describe-regions --profile devops-shop --output table
```

Do not enter access keys into project files, `.env` files, GitHub secrets, or
Terraform variables.

## Project identity map

```text
Developer ── IAM Identity Center ──> devops-shop profile
                                      │
                                      └── assumes Terraform deployment role

GitHub Actions ── GitHub OIDC JWT ──> GitHubActionsDeploy role
EC2 host       ── instance metadata ─> Ec2ProjectHost role
EKS pod        ── EKS Pod Identity ──> ApplicationService role
EKS control plane                   ─> EKS cluster role
EKS worker nodes                     ─> EKS node role
```

Each workload receives temporary credentials from its assigned role. Neither
containers nor source code contain AWS access keys.

## Roles we will create later, with their purpose

| Role | Principal allowed to assume it | Purpose |
| --- | --- | --- |
| `DevOpsShopTerraform` | designated human deployment identity | create and update only the course infrastructure |
| `DevOpsShopGitHubActions` | the configured GitHub repository OIDC provider | build/publish images and update deployment state |
| `DevOpsShopEc2Host` | a specific EC2 instance profile | Systems Manager access and explicitly required AWS calls |
| `DevOpsShopApp` | a named EKS Pod Identity association | access only the app's AWS services, if needed |
| EKS cluster/node roles | EKS control plane and managed node groups | required cluster operation permissions |

We will define those roles as Terraform-managed infrastructure, not create
click-ops copies in the console. Their trust policies are as important as their
permission policies: a role is secure only when both are scoped correctly.

## Ready check

Before Lesson 5, run this and confirm that the ARN is not the root principal:

```powershell
aws sts get-caller-identity --profile devops-shop --output json
```
