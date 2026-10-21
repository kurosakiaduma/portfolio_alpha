# Progress Report

## Summary of work completed so far

### 1. Frontend containerization
- Updated `frontend/Dockerfile` to use `corepack` and `pnpm install --frozen-lockfile`.
- Switched build commands to `pnpm run build`.
- Ensured the frontend image is built with the repo's `pnpm-lock.yaml` dependency graph.

### 2. Backend containerization
- Added `backend/Dockerfile` with a multi-stage Python 3.13 Slim build.
- Installed build dependencies in the builder stage and copied only runtime artifacts into the final image.
- Configured the backend image to start with `uvicorn backend.main:app --host 0.0.0.0 --port 8000`.
- Added `backend/.dockerignore` to keep build context clean.
- Updated `backend/requirements.txt` to use `-e .` for the local editable package dependency.

### 3. Deployment compose and Azure-ready configuration
- Added `docker-compose.azure.yml` for local testing / Azure multi-container reference.
- Added `version: '3.9'` and a shared `portfolio-network`.
- Added `ollama` service with persistent volume `ollama_data`.
- Added backend dependency on `ollama`.
- Updated backend service env vars to use `OLLAMA_BASE`, `MODEL`, `ADMIN_TOKEN`, and `ALLOWED_ORIGINS`.
- Added port exposure via environment variables: `FRONTEND_PORT` and `BACKEND_PORT`.

### 4. Environment configuration
- Added top-level `.env.example` with Azure/App Service environment references.
- Added `.env.example` keys for `OLLAMA_BASE`, `MODEL`, `ADMIN_TOKEN`, and `ALLOWED_ORIGINS`.
- Added `backend/local.env` with proper key=value formatting.
- Ensured backend local env includes `PORT`, `PUBLIC_SITE_URL`, `OLLAMA_BASE`, and `ADMIN_TOKEN`.

### 5. Ollama integration and startup support
- Added `ollama-entrypoint.sh` to start `ollama serve` and pull `mistral:7b-instruct` if missing.
- Mounted Azure-style persistent storage for Ollama at `/root/.ollama`.
- Configured Ollama to be internal-only in a multi-container setup.

### 6. Backend auth and admin access
- Added `backend/services/auth.py` with `verify_admin_token()`.
- Added support for both JWT Bearer auth and internal `X-Admin-Token` header auth.
- Updated `backend/routers/chat.py` to keep chat routes and add an internal `/metrics/llm` proxy endpoint.
- Updated `backend/services/llm.py` to default `MODEL` to `mistral:7b-instruct` and use `OLLAMA_BASE` from env.

### 7. CORS and observability updates
- Updated `backend/main.py` to build CORS origins from `PUBLIC_SITE_URL`, localhost, and `ALLOWED_ORIGINS`.
- Added structured environment-driven origin configuration for safer production and internal access.

## Files created or modified

- `frontend/Dockerfile`
- `backend/Dockerfile`
- `backend/.dockerignore`
- `docker-compose.azure.yml`
- `.env.example`
- `backend/local.env`
- `ollama-entrypoint.sh`
- `backend/services/auth.py`
- `backend/services/llm.py`
- `backend/routers/chat.py`
- `backend/main.py`
- `backend/requirements.txt`

## Notes / next steps — Local Validation

Before moving to Azure, validate the complete Docker Compose topology locally:

```bash
docker compose -f docker-compose.azure.yml up --build
```

### Validation checklist

- [ ] `docker compose build` completes without error for all three services
- [ ] Ollama container reaches "ready" state (watch logs for model pull completion)
- [ ] Backend container starts after Ollama is healthy
- [ ] `curl http://localhost:8000/api/health` returns 200
- [ ] `curl -X POST http://localhost:8000/api/chat/client` with test message streams response
- [ ] `curl http://localhost:8000/api/metrics/llm` returns Ollama Prometheus metrics (with `X-Admin-Token` header)
- [ ] Frontend loads in browser at `http://localhost:3000` and chat widget communicates with backend
- [ ] Browser console shows no CORS errors

## Next Phase — Azure Deployment

Once local validation passes, the following Azure deployment tasks are ready:

### 1. Azure Container Registry (ACR) setup
- Create an ACR instance in your Azure subscription
- Authenticate Docker CLI with ACR
- Build and push images: `portfolio-frontend`, `portfolio-backend`, `ollama` (or use pre-built `ollama/ollama:latest`)

### 2. Azure Container Apps environment
- Create a Container Apps environment with Log Analytics workspace
- Deploy three container apps:
  - `portfolio-frontend` — ingress enabled, public HTTPS
  - `portfolio-backend` — ingress enabled for frontend only (or internal)
  - `portfolio-ollama` — no ingress (internal only)
- Configure environment variables from Azure Key Vault or Container Apps secrets
- Set up inter-container networking (same environment = internal DNS)

### 3. MongoDB migration
- Create Azure Cosmos DB (MongoDB API) or use Azure VM + MongoDB
- Run `mongodump` and `mongorestore` to migrate existing data
- Update `MONGO_URI` in backend environment

### 4. Observability
- Enable Application Insights for the Container Apps environment
- Add OpenTelemetry instrumentation to FastAPI (optional but recommended)
- Configure Azure Monitor alerts for:
  - High latency (p95 > 15s)
  - Ollama container restarts
  - Error rate spike (5xx > 5%)

### 5. Custom domain and TLS
- Add a custom domain to the frontend Container App
- Use Azure-managed TLS certificate or bring your own
- Update frontend `PUBLIC_API_URL` to point to backend public endpoint

### 6. Testing in Azure
- Verify container startup and inter-service communication
- Test chat endpoints with same validation checklist
- Monitor logs in Application Insights for startup issues
- Test with production-like load

## Architecture summary

The portfolio now has a three-tier containerized architecture optimized for Azure:

```
┌─────────────────────────────────────────────┐
│           Azure Container Apps              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Frontend    │  │  Backend     │       │
│  │  (Astro)     │→ │  (FastAPI)   │       │
│  │              │  │              │       │
│  │ Public HTTPS │  │ Internal     │       │
│  └──────────────┘  └──────┬───────┘       │
│                           │               │
│                    ┌──────▼───────┐       │
│                    │  Ollama      │       │
│                    │  (7B model)  │       │
│                    │  Internal    │       │
│                    └──────────────┘       │
│                                             │
└─────────────────────────────────────────────┘
         ↓
    ┌─────────────────┐
    │ Cosmos DB       │
    │ (MongoDB API)   │
    └─────────────────┘
```

- **Frontend**: Static Astro build served via Nginx, public HTTPS ingress
- **Backend**: FastAPI with JWT auth, CORS configured, internal ingress for health
- **Ollama**: CPU-only (4 vCPU / 8 GB recommended), internal-only, persistent model storage
- **Database**: Azure Cosmos DB for MongoDB API or self-managed MongoDB
- **Observability**: Application Insights, Log Analytics, structured logging
