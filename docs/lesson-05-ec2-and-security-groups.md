# Lesson 5 — EC2 and security groups through the AWS Console

## Outcome

Create one short-lived Amazon Linux 2023 EC2 Docker host in `us-east-1`. It
will be managed through AWS Systems Manager (SSM), so it needs no SSH key pair
and no inbound port 22 rule. This is a virtual-machine learning lab; Terraform
will later create the dedicated VPC used by EKS.

> This instance can incur AWS charges. Create the AWS Budget alert from Lesson
> 3 first, and terminate the instance as soon as the lab is complete.

## 1. Confirm the AWS Region

1. Sign in to the AWS Management Console.
2. In the top-right region selector, choose **US East (N. Virginia)** —
   `us-east-1`.

Use the same region in every console page in this lesson.

## 2. Create the EC2 Systems Manager role

This is an EC2 workload role, not an IAM user. It lets the instance's SSM Agent
authenticate using temporary credentials.

1. Open **IAM** → **Roles** → **Create role**.
2. Select **AWS service** as the trusted entity type.
3. Select the **EC2** use case, then choose **Next**.
4. In permissions, search for and select **AmazonSSMManagedInstanceCore**.
5. Choose **Next**, name the role `DevOpsShopEc2Host`, then choose
   **Create role**.

Do not add `AdministratorAccess`, access keys, or any application permissions.
AWS creates the required instance profile from this role for the EC2 launch
form.

## 3. Create a narrow security group

1. Open **EC2** → **Network & Security** → **Security Groups** →
   **Create security group**.
2. Set **Security group name** to `devops-shop-ec2`.
3. Use a descriptive value such as `DevOps Shop EC2 lab; HTTP only from my IP`.
4. For **VPC**, choose the default VPC.
5. Under **Inbound rules**, add one rule:

   | Type | Protocol | Port range | Source |
   | --- | --- | --- |
   | Custom TCP | TCP | 8080 | My IP |

6. Do **not** add SSH, RDP, PostgreSQL, or `0.0.0.0/0` inbound rules.
7. Leave the default outbound rule in place; it allows package downloads,
   container image pulls, and Systems Manager connectivity.
8. Choose **Create security group**.

`My IP` automatically limits the rule to your current public address. If your
network changes, update this one rule rather than opening it to the internet.

## 4. Launch the EC2 instance

1. In **EC2** → **Instances**, choose **Launch instances**.
2. Name it `devops-shop-docker-host`.
3. Under **Application and OS Images**, select **Amazon Linux 2023 AMI**.
4. Choose instance type **t3.micro**. It is intentionally small, but it is not
   a promise of free usage—check the current price in your AWS account.
5. Under **Key pair (login)**, select **Proceed without a key pair**. SSM,
   rather than SSH, is our connection method.
6. Expand **Network settings** and choose **Edit**:
   - Select the default VPC.
   - Select any default/public subnet.
   - Set **Auto-assign public IP** to **Enable** for this short lab.
   - Under firewall, select **Select existing security group** and choose
     `devops-shop-ec2`.
7. Expand **Advanced details**:
   - Set **IAM instance profile** to `DevOpsShopEc2Host`.
   - Under **Metadata accessible**, leave it enabled.
   - Set **IMDSv2** / **Metadata version** to require **V2 only**. Do not allow
     IMDSv1.
8. Leave the default 8 GiB `gp3` root volume, then choose **Launch instance**.

On the EC2 **Instances** page, wait for both **Instance state: Running** and
**Status check: 2/2 checks passed**.

## 5. Verify SSH-free Systems Manager access

SSM registration can take a few minutes after launch.

1. Open **Systems Manager** → **Fleet Manager** → **Managed nodes**.
2. Confirm `devops-shop-docker-host` appears as a managed node.
3. Select it, choose **Node actions** → **Start terminal session**.
4. Run:

   ```bash
   whoami
   cat /etc/os-release
   ```

You are now connected without port 22, a public SSH key, or a bastion host.
The next lesson installs Docker through this session.

## 6. Verify the security boundary

In **EC2** → **Security Groups** → `devops-shop-ec2` → **Inbound rules**,
confirm that the only inbound rule is TCP 8080 from **your IP**. The frontend
will use that port after Docker Compose is deployed.

## 7. Clean up when the EC2 lab ends

1. In **EC2** → **Instances**, select `devops-shop-docker-host`.
2. Choose **Instance state** → **Terminate instance**, then confirm. Stopping
   an instance avoids compute charges but leaves storage behind; terminating it
   is the correct lab cleanup.
3. After it is terminated, delete `devops-shop-ec2` from **Security Groups**.
4. Keep `DevOpsShopEc2Host` only if you will repeat this EC2 lesson. Otherwise
   delete it in **IAM** → **Roles** after confirming no instance needs it.
