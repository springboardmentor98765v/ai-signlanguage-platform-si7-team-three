# Cloud Deployment Guide

Covers the PDF Infrastructure Layer's "Cloud Platform (AWS/Azure)",
"Load Balancer", and "Auto Scaling" items. These steps are written so
you (or whoever owns cloud infra on the team) can follow them exactly -
none of this has been executed against a real AWS/Azure account from
this repo, since that requires your own credentials and billing.

## Option A: AWS ECS Fargate (recommended - no servers to manage)

### 1. Push the image to ECR
```bash
aws ecr create-repository --repository-name sign-language-platform-backend
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com

docker build -t sign-language-platform-backend .
docker tag sign-language-platform-backend:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/sign-language-platform-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/sign-language-platform-backend:latest
```

### 2. Set up a Postgres database (RDS)
```bash
aws rds create-db-instance \
  --db-instance-identifier slp-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username slp_user \
  --master-user-password CHANGE_ME \
  --allocated-storage 20
```

### 3. Store the JWT secret in Secrets Manager
```bash
aws secretsmanager create-secret \
  --name slp-secret-key \
  --secret-string "$(openssl rand -hex 32)"
```

### 4. Register the task definition
Edit `deploy/ecs-task-definition.json` - replace `<ACCOUNT_ID>`, `<REGION>`,
and `<RDS_ENDPOINT>` with real values, then:
```bash
aws ecs register-task-definition --cli-input-json file://deploy/ecs-task-definition.json
```

### 5. Create the ECS service behind a load balancer
- Create an Application Load Balancer (ALB) with a target group on port 8000
- Create an ECS cluster (Fargate)
- Create an ECS service using the task definition above, attached to the ALB target group
- Enable auto scaling on the service (target tracking, e.g. 60% CPU) to satisfy the PDF's "Auto Scaling" requirement

This gives you: Load Balancer -> Auto Scaling ECS tasks -> RDS Postgres,
matching the PDF's Infrastructure Layer diagram directly.

## Option B: Azure App Service (simpler, good for a student project demo)

```bash
az group create --name slp-rg --location eastus

az acr create --resource-group slp-rg --name slpregistry --sku Basic
az acr build --registry slpregistry --image sign-language-platform-backend:latest .

az appservice plan create --name slp-plan --resource-group slp-rg --is-linux --sku B1

az webapp create \
  --resource-group slp-rg \
  --plan slp-plan \
  --name sign-language-platform \
  --deployment-container-image-name slpregistry.azurecr.io/sign-language-platform-backend:latest

az webapp config appsettings set \
  --resource-group slp-rg \
  --name sign-language-platform \
  --settings DATABASE_URL="postgresql://..." SLP_SECRET_KEY="$(openssl rand -hex 32)"
```

Azure App Service includes basic auto-scaling and load balancing out of
the box on higher tiers (B1+ supports manual scale-out; P-tier plans
support autoscale rules).

## Which one should you actually use for the project submission?

For a student/academic project, **Azure App Service (Option B)** or
even just running the Docker Compose stack (`docker compose up`) on a
single VM is usually enough to demonstrate the architecture works -
full ECS + RDS + ALB + autoscaling (Option A) is genuinely
production-grade but costs more and takes longer to set up correctly.
Use Option A if the assignment specifically asks for production cloud
architecture; use Option B or plain Docker Compose otherwise.
