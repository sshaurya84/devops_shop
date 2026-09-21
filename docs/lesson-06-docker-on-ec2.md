# Lesson 6 — Install Docker on the EC2 host

## Prerequisite

Complete Lesson 5 first. In **Systems Manager** → **Fleet Manager** →
**Managed nodes**, the `devops-shop-docker-host` instance must be visible and
you must be able to open **Node actions** → **Start terminal session**.

All commands in this lesson run inside that browser terminal on the Amazon
Linux 2023 instance—not in local PowerShell.

## 1. Install and start Docker

```bash
sudo yum update -y
sudo yum install -y docker git
sudo systemctl enable --now docker
sudo systemctl status docker --no-pager
```

`enabled` makes Docker start after an EC2 reboot; `--now` starts it immediately.

## 2. Allow the current SSM session user to use Docker

The Systems Manager terminal may run as `ssm-user` rather than `ec2-user`, so
derive the correct user instead of hard-coding one:

```bash
CURRENT_USER="$(whoami)"
sudo usermod -aG docker "$CURRENT_USER"
exit
```

Close the terminal session. Start a **new** Session Manager terminal and run:

```bash
docker version
docker run --rm hello-world
```

If Docker reports a permission error, confirm the group was set correctly:

```bash
id
getent group docker
```

Then close and reopen the terminal once more. Do not solve normal Docker use by
making every Docker command `sudo`.

## 3. Install Docker Compose v2

Amazon Linux 2023 provides Docker and `curl-minimal`, but may not include the
Compose CLI plugin. Do not install the full `curl` package: it conflicts with
the AMI's existing `curl-minimal` package.
Install Docker's official Compose plugin for all users of this lab host:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m) -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version
```

The command selects the current machine architecture automatically. It installs
the plugin globally; use `docker compose` (with a space), not legacy
`docker-compose`.

## 4. Verify host readiness

Run these commands in the new Session Manager terminal:

```bash
docker info
docker compose version
df -h /
free -h
```

You should see a running Docker server, a Compose v2 version, and enough free
disk/memory for the small course stack. `t3.micro` is intentionally constrained;
this is suitable for learning, not production traffic.

## What comes next

Docker is now installed, but the host does not yet have the application source
or images. The next lesson will place the project on the host, start
`docker compose up --build -d`, and verify the frontend through port 8080.
