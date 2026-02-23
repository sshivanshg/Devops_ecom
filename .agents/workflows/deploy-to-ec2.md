---
description: How to deploy the simple HTML page to EC2 using GitHub Actions
---

1. **Prerequisites**:
   - Ensure your EC2 instance is running and has Nginx installed (`sudo apt update && sudo apt install nginx -y`).
   - Ensure the security group allows SSH (Port 22).

2. **GitHub Secrets Configuration**:
   Go to your GitHub Repository > Settings > Secrets and variables > Actions, and add the following:
   - `EC2_HOST`: The Public IP address of your EC2 instance.
   - `EC2_USERNAME`: Usually `ubuntu` (for Ubuntu) or `ec2-user` (for Amazon Linux).
   - `EC2_SSH_KEY`: The content of your `.pem` private key file (starts with `-----BEGIN RSA PRIVATE KEY-----`).

3. **Triggering Deployment**:
   - Push your changes to the `main` branch.
   - The workflow `.github/workflows/deploy-demo.yml` will automatically trigger when it detects changes in the `demo/` folder.
   - Alternatively, you can run it manually from the "Actions" tab in GitHub.

4. **Verification**:
   - Visit `http://<YOUR_EC2_PUBLIC_IP>/` in your browser to see the deployed page.
