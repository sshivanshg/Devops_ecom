# Viva Preparation: DevOps E‑commerce Pipeline (Rubric‑Aligned)

This document prepares you for oral examination (viva) questions tied to the **course rubric** and this repository’s **AWS + GitHub Actions + Terraform + ECS** implementation. Use it as a checklist: read each question, answer aloud, then compare with the sample answer.

**Repository anchors**

- Pipeline: [`.github/workflows/aws-pipeline.yml`](../.github/workflows/aws-pipeline.yml)
- Terraform (main stack): [`terraform/`](../terraform/)
- Terraform state bootstrap: [`terraform/bootstrap/`](../terraform/bootstrap/)
- Secrets / setup notes: [`terraform/BOOTSTRAP_AND_SECRETS.txt`](../terraform/BOOTSTRAP_AND_SECRETS.txt)
- Dockerfile: [`Dockerfile`](../Dockerfile)
- Server health: `GET /api/health` in [`server/src/app.js`](../server/src/app.js)

---

## Table of contents

1. [Project and architecture](#1-project-and-architecture)
2. [GitHub Actions and secrets (rubric)](#2-github-actions-and-secrets-rubric)
3. [Phase 1 — Testing and reports](#3-phase-1--testing-and-reports)
4. [Phase 2 — Terraform and S3 (rubric)](#4-phase-2--terraform-and-s3-rubric)
5. [Terraform state: bootstrap vs main module](#5-terraform-state-bootstrap-vs-main-module)
6. [Phase 3 — Docker (rubric)](#6-phase-3--docker-rubric)
7. [Phase 3 — ECR, ECS Fargate, verification](#7-phase-3--ecr-ecs-fargate-verification)
8. [Workflow design: order, PR vs main](#8-workflow-design-order-pr-vs-main)
9. [ECS vs EKS (alternate rubric path)](#9-ecs-vs-eks-alternate-rubric-path)
10. [Security, secrets, and MongoDB](#10-security-secrets-and-mongodb)
11. [Troubleshooting and “what if” scenarios](#11-troubleshooting-and-what-if-scenarios)
12. [Short rapid‑fire bank](#12-short-rapidfire-bank)

---

## 1. Project and architecture

### Q1.1 — What does this project deploy, in one sentence?

**Answer:** A **monorepo** with a **React (Vite) frontend** and **Express (Node) backend** packaged into **one Docker image** that runs on **AWS ECS Fargate** behind an **Application Load Balancer**, with infrastructure defined in **Terraform** and CI/CD in **GitHub Actions**.

### Q1.2 — Why one container instead of separate frontend and backend containers?

**Answer:** The Dockerfile builds the SPA into static files and copies them into the server’s `public` folder so **Express serves the UI and `/api` on the same origin**. That simplifies CORS, TLS at the ALB, and the number of services to manage for a coursework pipeline. Trade‑off: you cannot scale UI and API independently.

### Q1.3 — Draw the request path from the internet to your app.

**Answer (spoken + mental diagram):** Internet → **ALB:80** → target group (HTTP to task **:5001**) → **Fargate task** (container listens on **5001**). Health checks hit the task; the workflow verifies **`/api/health`** on the ALB DNS name.

### Q1.4 — Where does MongoDB run in production vs in tests?

**Answer:** **Production (ECS):** MongoDB is expected as a managed service (e.g. **Atlas**) reachable from the task network; `DATABASE_URL` comes from **AWS Secrets Manager** into the task definition. **Tests:** integration tests use **MongoDB Memory Server** so CI does not need a real cluster.

---

## 2. GitHub Actions and secrets (rubric)

### Q2.1 — List the rubric AWS secrets and what each is for.

**Answer:**

| Secret (rubric / repo) | Purpose |
|------------------------|--------|
| `AWS_ACCESS_KEY_ID` | Access key for Terraform, ECR, ECS APIs in CI |
| `AWS_SECRET_ACCESS_KEY` | Secret key paired with the access key |
| `AWS_SESSION_TOKEN` | Required by rubric for **temporary** credentials (STS/assumed role). Long‑lived IAM users may use a placeholder or empty per instructor policy |
| `AWS_REGION` | Region for AWS SDK/CLI and Terraform backend |

**Additional secrets this repo uses (not always on the rubric sheet but required for a green pipeline):** `TF_STATE_BUCKET`, `TF_STATE_KEY` (optional default in workflow), `TF_STATE_DYNAMODB_TABLE`, and app secret ARNs (`DATABASE_URL_SECRET_ARN`, `JWT_SECRET_ARN`, optional Cloudinary ARNs).

### Q2.2 — Why must secrets live in GitHub Secrets and not in the repository?

**Answer:** The repo is often **public** or shared; committing keys is a **credential leak**. GitHub injects secrets at runtime into the workflow environment; they are **masked in logs** (with limitations) and never need to appear in source.

### Q2.3 — What is the risk of printing a secret in a workflow step?

**Answer:** Logs can expose values; forks/PRs from untrusted contributors may try to **exfiltrate** secrets via malicious workflows. Best practice: never `echo` secrets; pass them only to tools that need them (`configure-aws-credentials`, `terraform` via `TF_VAR_*`).

### Q2.4 — Why do we map `DATABASE_URL_SECRET_ARN` to `TF_VAR_database_url_secret_arn`?

**Answer:** Terraform reads variables prefixed with **`TF_VAR_`** from the environment automatically. The workflow sets `TF_VAR_database_url_secret_arn` so the root module variable `database_url_secret_arn` is populated **without** putting the actual connection string in GitHub—only the **ARN** of the secret in AWS.

---

## 3. Phase 1 — Testing and reports

### Q3.1 — What tests run in CI and where are they defined?

**Answer:** **Client:** Vitest tests under `client/src/**/*.{test,spec}.{js,jsx}` (Playwright e2e excluded). **Server:** Jest tests under `server/tests/**/*.test.js`, including **integration** tests (`auth.integration.test.js`) using **MongoDB Memory Server**. Lint runs on the client.

### Q3.2 — What is a “test report” in the rubric sense, and where is it in this project?

**Answer:** Machine‑readable output for graders/CI dashboards—here **JUnit XML**: `server/reports/junit-server.xml` (Jest + `jest-junit`) and `client/reports/junit-client.xml` (Vitest `junit` reporter). The workflow copies them into **`combined-reports/`** and uploads artifact **`test-reports`**.

### Q3.3 — What is the difference between unit and integration tests?

**Answer:** **Unit** tests isolate a small unit (e.g. a route handler with mocks). **Integration** tests exercise **multiple real components** together—here HTTP + **real Mongo driver** against an **in‑memory** Mongo instance—to catch wiring and schema issues.

### Q3.4 — Why use `npm ci` instead of `npm install` in CI?

**Answer:** `npm ci` installs **exactly** from `package-lock.json`, giving **reproducible** builds and faster, clean installs—important so “passes on my laptop” matches CI.

---

## 4. Phase 2 — Terraform and S3 (rubric)

### Q4.1 — What does `terraform init` do?

**Answer:** Downloads **providers** (e.g. AWS), configures the **backend** (here **S3 + DynamoDB lock**), and prepares the working directory. Without init, `plan`/`apply` cannot run.

### Q4.2 — What does `terraform validate` check?

**Answer:** **Syntax and internal consistency** of configuration (types, required arguments, references)—**not** whether AWS credentials work or whether apply would succeed against real APIs.

### Q4.3 — What is the difference between `terraform plan` and `terraform apply`?

**Answer:** **`plan`** shows the proposed create/update/destroy set **without** changing infrastructure. **`apply`** executes the plan (or an equivalent) and **mutates** real resources.

### Q4.4 — Rubric: list the S3 bucket requirements and where they are implemented.

**Answer:** In [`terraform/s3.tf`](../terraform/s3.tf) for the **artifacts** bucket (name includes `random_id` for **global uniqueness**):

1. **Unique bucket name** — `${project_name}-artifacts-${random_id.hex}`
2. **Versioning** — `aws_s3_bucket_versioning` → `Enabled`
3. **Encryption** — `aws_s3_bucket_server_side_encryption_configuration` → SSE‑S3 (`AES256`)
4. **Block public access** — `aws_s3_bucket_public_access_block` with all four flags **true**

### Q4.5 — Is the rubric S3 bucket the same as the Terraform state bucket?

**Answer:** **Not necessarily.** In this repo, **bootstrap** creates a **dedicated state bucket + DynamoDB lock** (`terraform/bootstrap/`). The **main** module creates a **separate** **artifacts** bucket matching the rubric. Both follow similar security patterns; separating state avoids chicken‑and‑egg (state cannot live in a bucket Terraform creates in the same first apply without extra steps).

### Q4.6 — What AWS resources does the main Terraform module create besides S3?

**Answer (high level):** **ECR** repository, **CloudWatch** log group, **IAM** roles (ECS task execution + task role, Secrets Manager read policy when ARNs set), **default VPC** subnets data, **ALB** + target group + listener, **ECS cluster**, **task definition**, **Fargate service** with public IP for image pull.

### Q4.7 — Why use `random_id` for the bucket name?

**Answer:** S3 bucket names are **globally unique** across all AWS accounts. A random suffix avoids collisions with other students or existing buckets.

---

## 5. Terraform state: bootstrap vs main module

### Q5.1 — Why do we need remote state at all?

**Answer:** So every CI run (and every teammate) shares **one source of truth** about resource IDs. Local `terraform.tfstate` on a laptop is **not** suitable for teams or GitHub Actions runners (ephemeral disks).

### Q5.2 — What does the DynamoDB table do for Terraform?

**Answer:** **State locking**: only one `apply` at a time can hold the lock, preventing **corrupted** or conflicting state when two pipelines run together.

### Q5.3 — Walk through bootstrap once vs main many times.

**Answer:** **Bootstrap (rare):** `cd terraform/bootstrap && terraform init && terraform apply` — creates state bucket + lock table; copy outputs to GitHub secrets. **Main (often):** `cd terraform && terraform init -backend-config=...` then `plan`/`apply` — creates app infrastructure and stores state in that remote backend.

### Q5.4 — What error appears if `TF_STATE_BUCKET` or `TF_STATE_KEY` is empty in CI?

**Answer:** Terraform backend init can fail with **invalid / empty value** for S3 backend configuration. This repo adds a **verification step** and defaults **`TF_STATE_KEY`** if the secret is missing.

---

## 6. Phase 3 — Docker (rubric)

### Q6.1 — What is a multi‑stage build and why use it here?

**Answer:** Multiple **`FROM`** stages: stage one **builds** the Vite client (`npm ci`, `npm run build`); stage two **production** only copies **`dist`** plus server code and runs **`npm ci --omit=dev`**. Smaller final image, no devDependencies or source maps in production, clearer separation of build vs runtime.

### Q6.2 — Why run the container as a non‑root user?

**Answer:** If the app is compromised, the attacker gets **limited** OS privileges—harder to install malware or read host‑sensitive paths. Many compliance baselines expect non‑root. Here: `chown -R node:node /app` and **`USER node`**.

### Q6.3 — What does the HEALTHCHECK do?

**Answer:** Docker periodically runs a **node** one‑liner that HTTP GETs **`http://127.0.0.1:$PORT/api/health`** and exits non‑zero if not HTTP 200—so orchestrators/supervisors can mark unhealthy containers.

### Q6.4 — What port does the app listen on in the container?

**Answer:** **`5001`** (`ENV PORT=5001`); ALB target group forwards to that container port.

### Q6.5 — What is `.dockerignore` used for?

**Answer:** Excludes files from the **build context** so `docker build` is faster and accidental secrets (`node_modules`, `.git`, local env files) are less likely to be copied into the image.

---

## 7. Phase 3 — ECR, ECS Fargate, verification

### Q7.1 — What is ECR?

**Answer:** **Elastic Container Registry**—managed Docker registry in AWS. CI logs in with IAM, **tags** the image with `${repo}:${github.sha}` and `:latest`, **pushes** layers to ECR.

### Q7.2 — What is ECS Fargate vs EC2 launch type?

**Answer:** **Fargate** runs tasks on **AWS‑managed** capacity—you specify CPU/memory only. **EC2** launch type means you manage the **instance fleet** and AMI. Fargate is simpler for coursework and demos.

### Q7.3 — How does a new deployment reach running tasks?

**Answer (this repo):** Describe the current **task definition family**, **`jq`** updates the **image** URI and removes the placeholder **`command`**, **`register-task-definition`**, then **`update-service`** with **`--force-new-deployment`**. Wait **`services-stable`**, then **`curl`** the ALB **`/api/health`**.

### Q7.4 — What is an ECS task definition vs service?

**Answer:** **Task definition** is the **blueprint** (image, CPU, memory, env, secrets, port mappings). **Service** maintains **desired count** of tasks, ties them to the load balancer, and rolls out new task definition **revisions**.

### Q7.5 — What is the difference between the task execution role and the task role?

**Answer:** **Execution role** is used by the **ECS agent** to pull images from ECR, write logs, and **read Secrets Manager** values referenced in `secrets`. **Task role** is assumed **inside** your app for AWS API calls (S3, DynamoDB, etc.)—this project uses a minimal task role; the app mostly talks to Mongo and Cloudinary over the internet.

### Q7.6 — Why does the ALB target group health check use `/` in Terraform while the viva rubric mentioned `/api/health`?

**Answer:** The **placeholder** task serves HTTP 200 on any path; the **real** app also serves **`/`** (SPA). The **workflow verification** step explicitly curls **`/api/health`** to prove the **API** is up after the real image is deployed.

### Q7.7 — What does `aws ecs wait services-stable` do?

**Answer:** Blocks until ECS considers the service **stable** (deployments settled, tasks healthy enough per service settings)—reduces race conditions before `curl` verification.

---

## 8. Workflow design: order, PR vs main

### Q8.1 — State the rubric workflow order for this project.

**Answer:** **Push/PR** → **run tests** (and upload reports) → **Terraform** (`init`, `validate`, `plan`; **`apply` on `main` only**) → **Docker build & push to ECR** → **deploy/update ECS** → **verify** (`curl` health).

### Q8.2 — Why run tests before Terraform?

**Answer:** **Fail fast** and **save money**—no point provisioning AWS if the codebase is broken. Also aligns with “quality gate before release.”

### Q8.3 — Why does `terraform apply` run only on `main` (and `workflow_dispatch`), not on every PR?

**Answer:** **PRs** are for review; applying infra from every PR branch can create **duplicate** stacks, cost, and security risk. **Plan** on PR still validates Terraform **without** mutating shared environments (this workflow always runs `plan` after `validate`).

### Q8.4 — What is `needs:` between jobs?

**Answer:** **Directed acyclic graph** dependencies—`terraform` **needs** `test` to succeed; `docker-ecs` **needs** `terraform` and only runs on **main** after apply outputs exist.

### Q8.5 — How does the Docker job get ECR URL and cluster names?

**Answer:** Terraform writes **`terraform-outputs.json`** as an **artifact** after apply; `docker-ecs` **downloads** it and uses **`jq`** to read `ecr_repository_url`, `ecs_cluster_name`, `ecs_service_name`, `task_definition_family`, `alb_dns_name`.

---

## 9. ECS vs EKS (alternate rubric path)

### Q9.1 — Rubric offers ECS or EKS—why did this project choose ECS?

**Answer:** **Single** container monolith maps naturally to **one ECS service**; less operational surface than **Kubernetes** (no control plane tuning, fewer YAML objects). EKS is better when you need **portable K8s**, complex service meshes, or many microservices.

### Q9.2 — If the rubric required EKS instead, what would you add?

**Answer:** **Cluster access** (`aws eks update-kubeconfig` or IAM Roles for Service Accounts), **Kubernetes manifests** or Helm: **Deployment** with **≥2 replicas**, **resource requests/limits**, **liveness and readiness probes**, **Service** (LoadBalancer or Ingress), resources in a **non‑default namespace**. CI would **`kubectl apply`** and wait for rollout.

### Q9.3 — Name ECS equivalents of Deployment replicas and probes.

**Answer:** **Desired count** on the ECS service (horizontal scale); **health** is primarily **load balancer health checks** and container **Docker HEALTHCHECK**; there is no built‑in “readiness probe” separate from LB health in the same way as Kubernetes—patterns use **target group deregistration delay** and **minimum healthy percent** during deployments.

---

## 10. Security, secrets, and MongoDB

### Q10.1 — Where is `DATABASE_URL` stored for ECS, and how does it reach the container?

**Answer:** Stored in **AWS Secrets Manager**; Terraform passes the **secret ARN** into the task definition **`secrets`** map; the **execution role** is allowed **`secretsmanager:GetSecretValue`** on those ARNs. At task start, ECS **injects** the value as an environment variable.

### Q10.2 — Why not put the Mongo URI in GitHub Secrets as plain text for Terraform?

**Answer:** You *could* pass plain env via Terraform variables, but **Secrets Manager** supports **rotation**, **auditing**, and **IAM‑scoped** access. ARNs in GitHub are less sensitive than the URI itself.

### Q10.3 — What must MongoDB Atlas allow for ECS tasks to connect?

**Answer:** Outbound from tasks to Atlas (TLS). Atlas **IP access list** must allow the tasks’ **egress IPs**—for Fargate with **public IP**, that often means **NAT/static egress** in production; for coursework, **0.0.0.0/0** is common but **not** production‑grade.

### Q10.4 — What is CORS and why does `FRONTEND_URL` matter?

**Answer:** Browsers enforce **Same‑Origin Policy**; **`FRONTEND_URL`** is used in Express CORS `allowedOrigins` so the SPA loaded from the **ALB** origin can call **`/api`** on the same host when served together—or you configure the exact deployed UI URL.

---

## 11. Troubleshooting and “what if” scenarios

### Q11.1 — Terraform init: “The value cannot be empty or all whitespace” for backend `s3`.

**Answer:** One of **`bucket` / `key` / `region` / `dynamodb_table`** was empty—usually missing **`TF_STATE_BUCKET`** or typo in secret names. Ensure secrets are set; **`TF_STATE_KEY`** may default in workflow.

### Q11.2 — `terraform plan` shows unexpected destroys.

**Answer:** Often **state drift** (someone changed resources in console) or **provider upgrade** changing defaults. Run `plan` carefully; fix with `terraform refresh` / import / correcting code; avoid blind `apply`.

### Q11.3 — ECS tasks keep stopping—where do you look first?

**Answer:** **ECS service events**, **CloudWatch logs** for the task (`/ecs/...` log group), **target group unhealthy** reasons, and **task stopped reason** (image pull, OOM, app crash on Mongo connect).

### Q11.4 — `curl /api/health` fails after deploy.

**Answer:** Check **security groups** (ALB → task :5001), **public IP** for ECR pull, **Mongo URI** and Atlas allowlist, **JWT/Cloudinary** if app exits on missing config, and that the **new task definition** removed the placeholder **command** so the real **`CMD`** runs.

### Q11.5 — Why might fork PRs fail to use secrets?

**Answer:** GitHub **does not pass** writable secrets to workflows from **fork** PRs by default (prevents secret theft). Plans from forks may lack AWS access—expected.

---

## 12. Short rapid‑fire bank

| Question | One‑line answer |
|----------|-----------------|
| What is IaC? | Infrastructure as Code—define cloud resources in files (Terraform) instead of only clicking the console. |
| What is idempotence? | Running apply twice converges to the **same** desired state without duplicate resources (where possible). |
| What is immutable infrastructure? | Replace servers/containers with **new images** instead of patching running VMs in place. |
| What is a container image tag? | Label for an image digest; **`latest` is mutable**, SHA tags are **immutable** references. |
| What is an ALB target group? | Group of registered **targets** (here task IPs) the load balancer forwards to with health checks. |
| What does `jq` do in the pipeline? | Parses **`terraform-outputs.json`** and rewrites **task definition JSON** for `aws ecs register-task-definition`. |
| What is GitHub Actions `workflow_dispatch`? | Manual trigger of a workflow from the Actions UI. |
| What is `TF_IN_AUTOMATION`? | Hint for Terraform to reduce interactive prompts in CI. |
| Difference between artifact and secret? | **Artifacts** are files produced by jobs (reports, tf outputs); **secrets** are sensitive strings. |
| Why multi‑AZ subnets for ALB? | AWS requires **≥2 AZs** for a standard internet‑facing application load balancer. |

---

## How to use this in the viva

1. **Memorize the workflow order** and be able to **point to file names** in the repo.  
2. For **Terraform**, be ready to open **`s3.tf`** and explain **each** rubric S3 requirement line by line.  
3. For **Docker**, explain **stages**, **`USER node`**, and **HEALTHCHECK** without reading notes.  
4. For **ECS**, explain **execution role vs task role**, **task definition vs service**, and **one** failure you debugged (or simulate from §11).  
5. If asked **EKS**, use §9 confidently even if this repo is ECS‑only.

Good luck.
