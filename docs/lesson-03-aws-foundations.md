# Lesson 3 — AWS foundations

This project will eventually create billable AWS resources. Complete these
account-safety steps before running Terraform or creating an EKS cluster.

## 1. Secure the account

- Enable MFA for the root user and do not use the root user for daily work.
- Do not create root access keys.
- In the AWS Billing console, create a monthly budget and enable actual-cost
  alerts. A small EKS learning environment is not free.
- Use temporary CLI credentials. This CLI version supports `aws login`; it is
  preferred over putting long-lived access keys into `~/.aws/credentials`.

## 2. Authenticate the AWS CLI

The command opens a browser window. Complete sign-in and MFA there:

```powershell
aws login
aws sts get-caller-identity --output json
```

If the account uses IAM Identity Center instead, create/use its named profile:

```powershell
aws configure sso --profile devops-shop
aws sso login --profile devops-shop
aws sts get-caller-identity --profile devops-shop --output json
```

Use exactly one authentication approach; never commit credentials to this
repository or paste them into chat.

## 3. Choose and configure a region

Choose a region close to you and supported by your organization. `us-east-1`
is a reasonable course default when no organization policy requires another
region.

```powershell
# Substitute the selected region. Add --profile devops-shop if you used SSO.
aws configure set region us-east-1
aws configure set output json
aws configure list
```

## 4. Identity design for this project

```text
You (CLI) ── temporary sign-in credentials ──> Terraform deployment permissions
GitHub Actions ── OIDC federation ───────────> CI deployment role       (later)
EC2 instance ── instance profile ────────────> EC2 workload role       (later)
EKS workload ── Pod Identity / IAM role ─────> application AWS access  (later)
```

We will keep people and workloads separate. The next IAM lesson creates
specific roles and policies only after the account and region are confirmed.

## 5. Non-destructive verification

```powershell
aws sts get-caller-identity
aws ec2 describe-regions --query "Regions[].RegionName" --output table
```
