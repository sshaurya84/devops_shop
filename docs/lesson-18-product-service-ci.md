# Lesson 18: CI for product-service

The workflow in `.github/workflows/product-service-ci.yaml` runs when changes
to `apps/product-service` reach `main`.

```text
push to main
  -> npm ci and API /health smoke test
  -> GitHub OIDC assumes a short-lived AWS role
  -> Docker build and immutable ECR push
  -> Git commit updates the dev overlay image tag
  -> Argo CD detects that Git commit
```

## Provision the GitHub OIDC role

Terraform creates the account-level GitHub OIDC identity provider and a
repository-specific role in the dedicated `terraform/modules/github-actions`
module. The role is restricted to this repository's `main` branch. Review the
plan carefully.

```powershell
aws login
terraform -chdir=terraform/environments/dev apply
terraform -chdir=terraform/environments/dev output github_actions_role_arn
```

The expected ARN is:

```text
arn:aws:iam::029633610454:role/devops-shop-github-actions
```

## Push and observe CI

Commit and push the workflow, Terraform configuration, and course notes:

```powershell
git add .github terraform docs/lesson-18-product-service-ci.md argocd/applications/devops-shop-dev.yaml
git commit -m "Add product service CI with GitHub OIDC"
git push origin main
```

Open the repository's **Actions** tab and select **Product service CI**. A
successful workflow pushes an image tagged with the first 12 characters of the
commit SHA, then creates a GitOps commit that Argo CD will detect.

## Security properties

- No `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` is stored in GitHub.
- The role trust policy only accepts tokens for
  `sshaurya84/devops_shop` on `refs/heads/main`.
- The role can push only to the `devops-shop/product-service` ECR repository.
