# Lesson 23 — Prometheus and Grafana observability

This installs a durable Prometheus and Grafana stack in the current
`us-east-1` EKS cluster and scrapes application metrics from product-service.
It is intentionally the first, regional observability layer. A later
multi-region step will use Thanos, Mimir, or AMP to aggregate metrics from all
three clusters.

## What changed in the application

`product-service` now exposes an internal `/metrics` endpoint. It includes
Node.js runtime metrics and this application metric:

```text
product_service_http_request_duration_seconds
```

The metric labels are method, route template, and status code. Raw paths are
not used as labels, which avoids unbounded Prometheus time-series cardinality.
The public ALB ingress does not route this endpoint to the API; Prometheus
scrapes the ClusterIP Service over port `http`.

## 1. Commit and let CI publish the instrumented API image

Commit the application, Kubernetes, and observability files. The existing
product-service GitHub Action builds a new immutable ECR image and updates the
development GitOps image tag. Wait for Argo CD to roll out the new image before
creating the ServiceMonitor.

## 2. Create Grafana's admin Secret

Choose a strong password and save it in your password manager. Do not add this
Secret to Git.

```powershell
& 'C:\Users\sshau\.local\bin\kubectl.exe' create namespace monitoring --dry-run=client -o yaml | & 'C:\Users\sshau\.local\bin\kubectl.exe' apply -f -

& 'C:\Users\sshau\.local\bin\kubectl.exe' -n monitoring create secret generic grafana-admin-credentials `
  --from-literal=admin-user=admin `
  --from-literal=admin-password='REPLACE_WITH_A_STRONG_PASSWORD'
```

If the secret already exists and you need to rotate it, update it deliberately
with `kubectl create secret ... --dry-run=client -o yaml | kubectl apply -f -`.

## 3. Install kube-prometheus-stack

The checked-in values create a 20 Gi gp3 Prometheus PVC with 7-day retention
and a 10 Gi Grafana PVC. Alertmanager is disabled for now; metrics and
dashboards come first.

```powershell
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack `
  --namespace monitoring `
  --version 91.4.1 `
  --values observability/kube-prometheus-stack-values.yaml

& 'C:\Users\sshau\.local\bin\kubectl.exe' get pods -n monitoring -w
```

Wait until the Prometheus, Grafana, operator, and exporter Pods are Running.
If Pods are Pending, inspect scheduling and capacity first:

```powershell
& 'C:\Users\sshau\.local\bin\kubectl.exe' get pods -n monitoring
& 'C:\Users\sshau\.local\bin\kubectl.exe' describe pod POD_NAME -n monitoring
```

## 4. Put ServiceMonitor configuration under Argo CD

The Helm chart installs the `ServiceMonitor` CRD. Only after step 3 succeeds,
apply the GitOps Application:

```powershell
& 'C:\Users\sshau\.local\bin\kubectl.exe' apply -f argocd/applications/devops-shop-observability.yaml
& 'C:\Users\sshau\.local\bin\kubectl.exe' get servicemonitor -n devops-shop
```

Prometheus is configured to select ServiceMonitors from all namespaces. The
product-service monitor selects only the Service labelled `app: product-service`
and scrapes port `http` every 30 seconds.

## 5. Verify Prometheus and Grafana

Port-forward these services in separate PowerShell terminals:

```powershell
& 'C:\Users\sshau\.local\bin\kubectl.exe' -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090
& 'C:\Users\sshau\.local\bin\kubectl.exe' -n monitoring port-forward svc/kube-prometheus-stack-grafana 3000:80
```

Open `http://localhost:9090/targets`. The `product-service` target should be
UP. In Grafana, open `http://localhost:3000`, log in with the Secret values,
and use Prometheus as the data source.

Useful initial PromQL queries:

```promql
sum(rate(product_service_http_request_duration_seconds_count[5m])) by (route, status_code)

histogram_quantile(0.95, sum(rate(product_service_http_request_duration_seconds_bucket[5m])) by (le, route))

up{namespace="devops-shop"}
```

## Multi-region note

Install this same regional stack in each EKS cluster. Do not share a
Prometheus PVC between regions. Later, configure remote-write or object-storage
blocks to a global metrics layer such as Thanos, Grafana Mimir, or Amazon
Managed Service for Prometheus so one Grafana view can query all regions.
