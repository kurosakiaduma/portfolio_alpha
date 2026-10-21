# Azure Migration Guide

This repository currently contains a Docker-based frontend deployment in `frontend/`, but no backend Docker configuration yet. This guide reviews the current deployment artifacts, highlights any gaps for stable Azure migration, and gives a concrete migration path for both the frontend and backend services plus MongoDB data.

## 1. Current repo deployment artifacts

### 1.1 Frontend

- `frontend/docker-compose.yml`
  - Single service: `portfolio-frontend`
  - Builds from `frontend/`
  - Exposes host port `3000` to container port `80`
  - Mounts `./logs:/var/log/nginx`
  - Uses `restart: unless-stopped`

- `frontend/Dockerfile`
  - Multi-stage build: Node 18 Alpine builder + Nginx runtime
  - Installs dependencies with `npm ci --only=production`
  - Builds with `npm run build`
  - Copies `dist` into Nginx static root
  - Serves via `nginx.conf`

- `frontend/nginx.conf`
  - Static asset caching and gzip enabled
  - SPA fallback via `try_files ... @fallback`
  - `/api/` returns 404 in the static container
  - Example reverse proxy server block is provided for production proxying to `http://localhost:3000`

- `frontend/DEPLOYMENT_GUIDE.md`
  - Hosted deployment guide for self-managed Linux + Nginx + certbot
  - Not Azure-native, but useful for manual reference

- `frontend/deploy-seo.sh` and `frontend/tjaduma.conf`
  - Host-based Nginx deployment helper and rate-limit config
  - Best suited for a VM/container host, not App Service directly

### 1.2 Backend

- `backend/main.py` is a FastAPI app with `/api` routes and `/api/admin/*`
- There is no backend `Dockerfile` or `docker-compose.yml` in the repo
- Backend dependencies are declared in `backend/requirements.txt`
- Backend config is environment-driven via `.env`
- `backend/README.md` recommends Fly.io/Render and MongoDB Atlas

### 1.3 Other YAML files

- No Azure DevOps or GitHub Actions YAML files are present in the repo
- No Kubernetes manifests or Helm charts are present
- The only relevant YAML-style deployment file is `frontend/docker-compose.yml`

## 2. Key gaps for Azure migration

### 2.1 Frontend Docker build issue

The current `frontend/Dockerfile` uses:

```dockerfile
RUN npm ci --only=production
```

but the repo uses `pnpm-lock.yaml` and does not include `package-lock.json`. For reliable Azure builds, either:

- merge a generated `package-lock.json` into frontend,
- or update the Dockerfile to use `pnpm` and `corepack`:

```dockerfile
RUN corepack enable && pnpm install --frozen-lockfile
```

This is an important stability issue before moving to Azure.

### 2.2 Missing backend container config

For Azure migration, the backend also needs containerization. A sample backend Dockerfile is recommended, because the repo currently has only a Python FastAPI app and no container build definition.

### 2.3 Current frontend nginx config is static-site focused

The `frontend/nginx.conf` is fine for serving the built Astro app, but it currently returns `404` for `/api/*` and includes a placeholder proxy block listening on port `8080`.

For Azure, you should choose one of these patterns:

1. Serve frontend and backend as separate containerized apps and call the backend over a public/internal URL.
2. Keep the frontend container as a static app and use an Azure-managed frontend service.
3. If using one nginx container plus backend service, update nginx to proxy `/api` to the backend container.

## 3. Recommended Azure architecture

### 3.1 Option A — Azure App Service (recommended for simplicity)

- Frontend: Azure App Service for Containers with the frontend image
- Backend: Azure App Service for Containers with the backend image
- Database: Azure Cosmos DB for MongoDB API or Azure VM / managed MongoDB
- Use Azure App Service environment variables for `MONGO_URI`, `JWT_SECRET`, `PUBLIC_SITE_URL`, and backend-specific settings
- Use Azure Key Vault for secrets if available

Advantages:
- Easy managed hosting
- Built-in TLS and scaling
- Works well with two separate container apps

### 3.2 Option B — Azure Container Apps / ACI

- Build both frontend and backend images into Azure Container Registry (ACR)
- Deploy frontend and backend as separate Container Apps
- Use revision-based deployment for safe rollouts
- Use HTTPS ingress and custom domains

This is a stable production path if you want container-level separation without managing full Kubernetes.

### 3.3 Option C — Azure Kubernetes Service (AKS)

- If you need higher operational control, use AKS
- Requires Kubernetes manifests or Helm charts
- Not currently present in this repo

Only use AKS if you already need more than basic App Service / Container Apps.

## 4. Sample backend Dockerfile

A recommended backend container build for Azure:

```dockerfile
# backend/Dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

If you prefer a smaller image, you can use `python:3.13-slim` plus pip install and `uvicorn`.

## 5. Sample Azure-compose blueprint

If you want a single deployment manifest for local testing and Azure Container Apps, a root compose file can be helpful. Example:

```yaml
version: '3.9'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: portfolio-frontend:latest
    ports:
      - '3000:80'
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: portfolio-backend:latest
    ports:
      - '8000:8000'
    environment:
      - MONGO_URI=${MONGO_URI}
      - MONGO_DB=${MONGO_DB}
      - JWT_SECRET=${JWT_SECRET}
      - PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
      - PORT=8000

networks:
  portfolio-network:
    driver: bridge
```

For Azure App Service multi-container deployment, use a dedicated compose file like `docker-compose.azure.yml` and point App Service to it.

## 6. MongoDB migration guidance

Since you are migrating MongoDB data, the safe path is:

1. Dump the current data from the existing MongoDB source:

```bash
mongodump --uri="${SOURCE_MONGO_URI}" --archive=portfolio-backup.archive --gzip
```

2. Restore into the target Azure MongoDB service:

```bash
mongorestore --uri="${TARGET_MONGO_URI}" --archive=portfolio-backup.archive --gzip
```

### If using Azure Cosmos DB for MongoDB API

- Make sure the target Cosmos DB is configured for the correct MongoDB API version
- Confirm compatibility for MongoDB features used in the app
- Set `MONGO_URI` in the backend to the Cosmos connection string
- Verify that indexes and unique constraints are preserved

If an exact dump/restore path is not available, use `mongoexport`/`mongoimport` for individual collections.

## 7. Environment and stability checklist

### Required backend env vars

- `MONGO_URI`
- `MONGO_DB`
- `JWT_SECRET`
- `PUBLIC_SITE_URL`
- `PORT` (default `8000`)

### Required frontend env vars

- `PUBLIC_API_URL` should point to the backend app URL

### Stability recommendations

- Use a managed MongoDB service for production (`Azure Cosmos DB` or Atlas)
- Keep secrets out of source control and use Azure Key Vault or App Service secrets
- Add health probes:
  - frontend: `/health` or static readiness
  - backend: `/api/health`
- Enable logging and monitoring in Azure App Service / Container Apps
- Use a custom domain and TLS cert on the Azure app

## 8. What to do next

1. Fix the frontend Dockerfile to use the repo package manager (`pnpm`) or add `package-lock.json`
2. Add a backend Dockerfile and/or root Azure compose manifest
3. Choose an Azure deployment target: App Service, Container Apps, or AKS
4. Set up MongoDB migration to Azure and update `MONGO_URI`
5. Configure production env vars and CORS via `PUBLIC_SITE_URL`

## 9. Notes on current repo files

- `frontend/DEPLOYMENT_GUIDE.md` is a strong reference for Nginx and manual deployment, but it is not Azure-first.
- `frontend/nginx.conf` is useful if you use a containerized Nginx frontend, but if you choose Azure Static Web Apps the nginx layer may be redundant.
- `frontend/tjaduma.conf` and `frontend/deploy-seo.sh` are host-level scripts/configs for self-managed VM deployment, not Azure App Service.
- The repo does not currently include any Azure pipeline YAML or Kubernetes manifests.
