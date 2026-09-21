# Kubernetes manifests

`base/` is the version-controlled application definition. Images use immutable
ECR Git tags. Do not store real passwords there.

Before deployment, copy `secret.local.yaml.example` to `secret.local.yaml`, set
a strong database password, and apply it locally. The local secret file is
ignored by Git.

The PostgreSQL PVC requests the `gp3` StorageClass. Terraform installs the
Amazon EBS CSI driver and its least-privilege EKS Pod Identity role; the
StorageClass is included in this Kustomize base.
