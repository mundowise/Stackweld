/**
 * Infrastructure as Code Generator — Produces deployment files for VPS, AWS, and GCP targets.
 * No disk I/O — returns structured data for writing.
 */

// ─── Types ────────────────────────────────────────────

export type DeployTarget = "vps" | "aws" | "gcp";

export interface InfraOutput {
  target: DeployTarget;
  files: Array<{ path: string; content: string }>;
  instructions: string[];
}

interface InfraTechnology {
  id: string;
  name: string;
  category: string;
  dockerImage?: string;
  defaultPort?: number;
}

type RuntimeKind = "node" | "python" | "go" | "rust";

// ─── Runtime Detection ────────────────────────────────

const RUNTIME_HINTS: Record<string, RuntimeKind> = {
  nodejs: "node",
  node: "node",
  nextjs: "node",
  react: "node",
  vue: "node",
  angular: "node",
  express: "node",
  fastify: "node",
  nestjs: "node",
  nuxt: "node",
  svelte: "node",
  sveltekit: "node",
  remix: "node",
  astro: "node",
  typescript: "node",
  bun: "node",
  python: "python",
  fastapi: "python",
  django: "python",
  flask: "python",
  go: "go",
  gin: "go",
  echo: "go",
  fiber: "go",
  rust: "rust",
  actix: "rust",
  axum: "rust",
  rocket: "rust",
};

function detectRuntime(technologies: InfraTechnology[]): RuntimeKind {
  for (const tech of technologies) {
    const hint = RUNTIME_HINTS[tech.id.toLowerCase()];
    if (hint) return hint;
  }
  return "node";
}

function detectAppPort(technologies: InfraTechnology[]): number {
  for (const tech of technologies) {
    if (tech.category === "frontend" || tech.category === "backend") {
      if (tech.defaultPort) return tech.defaultPort;
    }
  }
  return 3000;
}

function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

// ─── Dockerfile Generators ────────────────────────────

function generateDockerfile(runtime: RuntimeKind, appPort: number): string {
  switch (runtime) {
    case "node":
      return `# Multi-stage build for Node.js
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml* yarn.lock* ./
RUN corepack enable 2>/dev/null; \\
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \\
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \\
    else npm ci; fi

COPY . .
RUN if [ -f pnpm-lock.yaml ]; then pnpm build; \\
    elif [ -f yarn.lock ]; then yarn build; \\
    else npm run build; fi

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 app && adduser --system --uid 1001 app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next 2>/dev/null || true
COPY --from=builder /app/public ./public 2>/dev/null || true

USER app
EXPOSE ${appPort}

CMD ["node", "dist/index.js"]
`;

    case "python":
      return `# Multi-stage build for Python
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements*.txt pyproject.toml* ./
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt 2>/dev/null || \\
    pip install --no-cache-dir --prefix=/install . 2>/dev/null || true

COPY . .

FROM python:3.12-slim AS runner

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN addgroup --system --gid 1001 app && adduser --system --uid 1001 app

COPY --from=builder /install /usr/local
COPY --from=builder /app .

USER app
EXPOSE ${appPort}

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${appPort}"]
`;

    case "go":
      return `# Multi-stage build for Go
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server .

FROM alpine:3.19 AS runner

RUN apk --no-cache add ca-certificates
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
COPY --from=builder /app/server .

USER app
EXPOSE ${appPort}

CMD ["./server"]
`;

    case "rust":
      return `# Multi-stage build for Rust
FROM rust:1.77-slim AS builder

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

COPY . .
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app
COPY --from=builder /app/target/release/app .

USER app
EXPOSE ${appPort}

CMD ["./app"]
`;
  }
}

// ─── VPS Target ───────────────────────────────────────

function generateVpsFiles(
  technologies: InfraTechnology[],
  projectName: string,
  runtime: RuntimeKind,
  appPort: number,
): Array<{ path: string; content: string }> {
  const slug = sanitizeName(projectName);
  const files: Array<{ path: string; content: string }> = [];

  // Dockerfile
  files.push({
    path: "Dockerfile",
    content: generateDockerfile(runtime, appPort),
  });

  // docker-compose.prod.yml
  const composeServices: string[] = [];

  composeServices.push(`  app:
    build: .
    container_name: ${slug}-app
    restart: unless-stopped
    ports:
      - "\${APP_PORT:-${appPort}}:${appPort}"
    env_file:
      - .env.production
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - ${slug}-net`);

  // Add database services
  for (const tech of technologies) {
    if (tech.dockerImage && tech.category === "database") {
      const svcName = tech.id.replace(/[^a-z0-9]/g, "");
      const port = tech.defaultPort || 5432;
      composeServices.push(`  ${svcName}:
    image: ${tech.dockerImage}
    container_name: ${slug}-${svcName}
    restart: unless-stopped
    ports:
      - "\${${tech.id.toUpperCase()}_PORT:-${port}}:${port}"
    volumes:
      - ${svcName}-data:/var/lib/${svcName === "postgresql" ? "postgresql/data" : svcName}
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - ${slug}-net`);
    }
  }

  const volumeEntries = technologies
    .filter((t) => t.dockerImage && t.category === "database")
    .map((t) => `  ${t.id.replace(/[^a-z0-9]/g, "")}-data:`)
    .join("\n");

  const composeContent = `version: "3.9"

services:
${composeServices.join("\n\n")}

${volumeEntries ? `volumes:\n${volumeEntries}\n` : ""}
networks:
  ${slug}-net:
    driver: bridge
`;

  files.push({
    path: "docker-compose.prod.yml",
    content: composeContent,
  });

  // nginx.conf
  files.push({
    path: "nginx.conf",
    content: `upstream app_backend {
    server 127.0.0.1:${appPort};
}

server {
    listen 80;
    server_name \${DOMAIN};

    location / {
        proxy_pass http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://app_backend/health;
        access_log off;
    }

    # Static assets caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://app_backend;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
`,
  });

  // deploy.sh
  files.push({
    path: "deploy.sh",
    content: `#!/usr/bin/env bash
set -euo pipefail

# ── ${projectName} — VPS Deploy Script ──

REMOTE_USER="\${DEPLOY_USER:-deploy}"
REMOTE_HOST="\${DEPLOY_HOST:?Set DEPLOY_HOST}"
REMOTE_DIR="\${DEPLOY_DIR:-/opt/${slug}}"

echo "=> Syncing files to $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"
rsync -avz --exclude node_modules --exclude .git --exclude .env \\
  . "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"

echo "=> Building and starting containers"
ssh "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
  cd \${REMOTE_DIR}
  docker compose -f docker-compose.prod.yml pull
  docker compose -f docker-compose.prod.yml build --no-cache
  docker compose -f docker-compose.prod.yml up -d
  docker compose -f docker-compose.prod.yml ps
EOF

echo "=> Deploy complete"
`,
  });

  // .env.production.example
  const envLines = [
    `# ${projectName} — Production Environment`,
    `# Copy to .env.production and fill in real values`,
    "",
    `APP_PORT=${appPort}`,
    "NODE_ENV=production",
  ];

  for (const tech of technologies) {
    if (tech.category === "database") {
      const upper = tech.id.toUpperCase().replace(/-/g, "_");
      envLines.push("");
      envLines.push(`# ${tech.name}`);
      envLines.push(`${upper}_HOST=localhost`);
      envLines.push(`${upper}_PORT=${tech.defaultPort || 5432}`);
      envLines.push(`${upper}_USER=app`);
      envLines.push(`${upper}_PASSWORD=changeme`);
      envLines.push(`${upper}_DB=${slug}`);
    }
  }

  files.push({
    path: ".env.production.example",
    content: `${envLines.join("\n")}\n`,
  });

  return files;
}

// ─── AWS Target ───────────────────────────────────────

function generateAwsFiles(
  _technologies: InfraTechnology[],
  projectName: string,
  runtime: RuntimeKind,
  appPort: number,
): Array<{ path: string; content: string }> {
  const slug = sanitizeName(projectName);
  const files: Array<{ path: string; content: string }> = [];

  // Dockerfile (same base)
  files.push({
    path: "Dockerfile",
    content: generateDockerfile(runtime, appPort),
  });

  // ECS Task Definition
  files.push({
    path: "aws/task-definition.json",
    content: `${JSON.stringify(
      {
        family: slug,
        networkMode: "awsvpc",
        requiresCompatibilities: ["FARGATE"],
        cpu: "256",
        memory: "512",
        executionRoleArn: `arn:aws:iam::\${AWS_ACCOUNT_ID}:role/${slug}-execution-role`,
        taskRoleArn: `arn:aws:iam::\${AWS_ACCOUNT_ID}:role/${slug}-task-role`,
        containerDefinitions: [
          {
            name: slug,
            image: `\${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com/${slug}:latest`,
            portMappings: [
              {
                containerPort: appPort,
                protocol: "tcp",
              },
            ],
            essential: true,
            logConfiguration: {
              logDriver: "awslogs",
              options: {
                "awslogs-group": `/ecs/${slug}`,
                "awslogs-region": `\${AWS_REGION}`,
                "awslogs-stream-prefix": "ecs",
              },
            },
            healthCheck: {
              command: ["CMD-SHELL", `curl -f http://localhost:${appPort}/health || exit 1`],
              interval: 30,
              timeout: 5,
              retries: 3,
              startPeriod: 60,
            },
          },
        ],
      },
      null,
      2,
    )}\n`,
  });

  // CloudFormation template
  files.push({
    path: "aws/cloudformation.yml",
    content: `AWSTemplateFormatVersion: "2010-09-09"
Description: "${projectName} — ECS Fargate deployment"

Parameters:
  VpcId:
    Type: AWS::EC2::VPC::Id
  SubnetIds:
    Type: List<AWS::EC2::Subnet::Id>
  ContainerImage:
    Type: String
  AppPort:
    Type: Number
    Default: ${appPort}

Resources:
  Cluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: ${slug}-cluster
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT

  LogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /ecs/${slug}
      RetentionInDays: 30

  SecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: ${slug} ECS tasks
      VpcId: !Ref VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: !Ref AppPort
          ToPort: !Ref AppPort
          SourceSecurityGroupId: !Ref ALBSecurityGroup

  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: ${slug} ALB
      VpcId: !Ref VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  ALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: ${slug}-alb
      Scheme: internet-facing
      Subnets: !Ref SubnetIds
      SecurityGroups:
        - !Ref ALBSecurityGroup

  TargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: ${slug}-tg
      Port: !Ref AppPort
      Protocol: HTTP
      VpcId: !Ref VpcId
      TargetType: ip
      HealthCheckPath: /health
      HealthCheckIntervalSeconds: 30

  Listener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ALB
      Port: 80
      Protocol: HTTP
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref TargetGroup

  TaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: ${slug}
      Cpu: "256"
      Memory: "512"
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      ExecutionRoleArn: !Sub "arn:aws:iam::\${AWS::AccountId}:role/${slug}-execution-role"
      ContainerDefinitions:
        - Name: ${slug}
          Image: !Ref ContainerImage
          PortMappings:
            - ContainerPort: !Ref AppPort
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: !Ref LogGroup
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs

  Service:
    Type: AWS::ECS::Service
    DependsOn: Listener
    Properties:
      ServiceName: ${slug}-service
      Cluster: !Ref Cluster
      TaskDefinition: !Ref TaskDefinition
      DesiredCount: 1
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          AssignPublicIp: ENABLED
          Subnets: !Ref SubnetIds
          SecurityGroups:
            - !Ref SecurityGroup
      LoadBalancers:
        - ContainerName: ${slug}
          ContainerPort: !Ref AppPort
          TargetGroupArn: !Ref TargetGroup

Outputs:
  ALBDnsName:
    Description: ALB DNS name
    Value: !GetAtt ALB.DNSName
  ClusterArn:
    Description: ECS Cluster ARN
    Value: !GetAtt Cluster.Arn
`,
  });

  // Deploy script
  files.push({
    path: "deploy-aws.sh",
    content: `#!/usr/bin/env bash
set -euo pipefail

# ── ${projectName} — AWS ECS Deploy Script ──

AWS_REGION="\${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REPO="\${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com/${slug}"
CLUSTER="${slug}-cluster"
SERVICE="${slug}-service"

echo "=> Authenticating with ECR"
aws ecr get-login-password --region "$AWS_REGION" | \\
  docker login --username AWS --password-stdin "$ECR_REPO"

echo "=> Building Docker image"
docker build -t "${slug}:latest" .

echo "=> Tagging and pushing to ECR"
docker tag "${slug}:latest" "$ECR_REPO:latest"
docker push "$ECR_REPO:latest"

echo "=> Updating ECS service (force new deployment)"
aws ecs update-service \\
  --cluster "$CLUSTER" \\
  --service "$SERVICE" \\
  --force-new-deployment \\
  --region "$AWS_REGION"

echo "=> Waiting for service to stabilize..."
aws ecs wait services-stable \\
  --cluster "$CLUSTER" \\
  --services "$SERVICE" \\
  --region "$AWS_REGION"

echo "=> Deploy complete"
`,
  });

  return files;
}

// ─── GCP Target ───────────────────────────────────────

function generateGcpFiles(
  _technologies: InfraTechnology[],
  projectName: string,
  runtime: RuntimeKind,
  appPort: number,
): Array<{ path: string; content: string }> {
  const slug = sanitizeName(projectName);
  const files: Array<{ path: string; content: string }> = [];

  // Dockerfile (same base)
  files.push({
    path: "Dockerfile",
    content: generateDockerfile(runtime, appPort),
  });

  // Cloud Build config
  files.push({
    path: "gcp/cloudbuild.yaml",
    content: `steps:
  - name: "gcr.io/cloud-builders/docker"
    args:
      - "build"
      - "-t"
      - "gcr.io/$PROJECT_ID/${slug}:$SHORT_SHA"
      - "-t"
      - "gcr.io/$PROJECT_ID/${slug}:latest"
      - "."

  - name: "gcr.io/cloud-builders/docker"
    args:
      - "push"
      - "gcr.io/$PROJECT_ID/${slug}:$SHORT_SHA"

  - name: "gcr.io/cloud-builders/docker"
    args:
      - "push"
      - "gcr.io/$PROJECT_ID/${slug}:latest"

  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: "gcloud"
    args:
      - "run"
      - "deploy"
      - "${slug}"
      - "--image"
      - "gcr.io/$PROJECT_ID/${slug}:$SHORT_SHA"
      - "--region"
      - "\${_REGION}"
      - "--platform"
      - "managed"

substitutions:
  _REGION: "us-central1"

images:
  - "gcr.io/$PROJECT_ID/${slug}:$SHORT_SHA"
  - "gcr.io/$PROJECT_ID/${slug}:latest"
`,
  });

  // Cloud Run service definition
  files.push({
    path: "gcp/service.yaml",
    content: `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ${slug}
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "0"
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/cpu-throttling: "true"
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      containers:
        - image: gcr.io/PROJECT_ID/${slug}:latest
          ports:
            - containerPort: ${appPort}
          resources:
            limits:
              cpu: "1"
              memory: 512Mi
          startupProbe:
            httpGet:
              path: /health
              port: ${appPort}
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health
              port: ${appPort}
            periodSeconds: 15
`,
  });

  // Deploy script
  files.push({
    path: "deploy-gcp.sh",
    content: `#!/usr/bin/env bash
set -euo pipefail

# ── ${projectName} — GCP Cloud Run Deploy Script ──

GCP_PROJECT="\${GCP_PROJECT:?Set GCP_PROJECT}"
GCP_REGION="\${GCP_REGION:-us-central1}"
IMAGE="gcr.io/$GCP_PROJECT/${slug}"

echo "=> Building Docker image"
docker build -t "$IMAGE:latest" .

echo "=> Pushing to GCR"
docker push "$IMAGE:latest"

echo "=> Deploying to Cloud Run"
gcloud run deploy ${slug} \\
  --image "$IMAGE:latest" \\
  --platform managed \\
  --region "$GCP_REGION" \\
  --project "$GCP_PROJECT" \\
  --allow-unauthenticated \\
  --port ${appPort} \\
  --memory 512Mi \\
  --cpu 1 \\
  --min-instances 0 \\
  --max-instances 10

echo "=> Deploy complete"
gcloud run services describe ${slug} \\
  --platform managed \\
  --region "$GCP_REGION" \\
  --project "$GCP_PROJECT" \\
  --format "value(status.url)"
`,
  });

  return files;
}

// ─── Main Function ────────────────────────────────────

export function generateInfra(
  technologies: InfraTechnology[],
  projectName: string,
  target: DeployTarget,
): InfraOutput {
  const runtime = detectRuntime(technologies);
  const appPort = detectAppPort(technologies);

  let files: Array<{ path: string; content: string }>;
  let instructions: string[];

  switch (target) {
    case "vps":
      files = generateVpsFiles(technologies, projectName, runtime, appPort);
      instructions = [
        `Set DEPLOY_HOST and DEPLOY_USER in your environment`,
        `Copy .env.production.example to .env.production and fill in real values`,
        `Run: chmod +x deploy.sh`,
        `Run: ./deploy.sh`,
        `Configure nginx on your VPS using the generated nginx.conf`,
        `Set up SSL with: certbot --nginx -d yourdomain.com`,
      ];
      break;

    case "aws":
      files = generateAwsFiles(technologies, projectName, runtime, appPort);
      instructions = [
        `Create an ECR repository: aws ecr create-repository --repository-name ${sanitizeName(projectName)}`,
        `Create IAM roles: ${sanitizeName(projectName)}-execution-role and ${sanitizeName(projectName)}-task-role`,
        `Deploy infrastructure: aws cloudformation deploy --template-file aws/cloudformation.yml --stack-name ${sanitizeName(projectName)} --parameter-overrides VpcId=vpc-xxx SubnetIds=subnet-xxx ContainerImage=xxx`,
        `Run: chmod +x deploy-aws.sh`,
        `Run: ./deploy-aws.sh`,
      ];
      break;

    case "gcp":
      files = generateGcpFiles(technologies, projectName, runtime, appPort);
      instructions = [
        `Set GCP_PROJECT environment variable`,
        `Enable Cloud Run API: gcloud services enable run.googleapis.com`,
        `Enable Container Registry: gcloud services enable containerregistry.googleapis.com`,
        `Run: chmod +x deploy-gcp.sh`,
        `Run: ./deploy-gcp.sh`,
        `(Optional) Set up Cloud Build trigger: gcloud builds triggers create github --repo-name=your-repo --branch-pattern=main --build-config=gcp/cloudbuild.yaml`,
      ];
      break;
  }

  return { target, files, instructions };
}
