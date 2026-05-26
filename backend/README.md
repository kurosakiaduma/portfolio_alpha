# Portfolio API

[![FastAPI](https://img.shields.io/badge/FastAPI-009485?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Motor](https://img.shields.io/badge/Motor-async_driver-47A248)](https://motor.readthedocs.io/)
[![Uvicorn](https://img.shields.io/badge/Uvicorn-ASGI-121212)](https://www.uvicorn.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-docs-6BA539?logo=swagger&logoColor=white)](/docs)

REST API serving portfolio content for the Astro frontend. Handles projects, music, blog, skills, certifications, gallery, and admin CRUD.

---

## Structure

```
backend/
    main.py
    core/
        auth.py         JWT auth utilities
        config.py
    db/
        mongo.py        Motor client and collection helpers
    models/             Pydantic models
    routers/            Route handlers (one file per resource)
    agents/             AI crew integrations
    mcp/                MCP tooling
    knowledge/          Knowledge base assets
    scripts/            Seed and index creation scripts
    tests/
```

---

## Setup

Requires Python 3.13+ and a running MongoDB instance (local or Atlas).

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Copy `local.env` to `.env` and fill in your values:

```
MONGO_URI=mongodb://localhost:27017
MONGO_DB=portfolio
JWT_SECRET=change-this-in-production
PUBLIC_SITE_URL=http://localhost:4321
PORT=6543
```

Start the server:

```bash
uvicorn main:app --reload --port 6543
```

---

## API

All routes are prefixed with `/api`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/bio` | Profile data |
| GET | `/api/projects` | All projects (featured desc, year desc) |
| GET | `/api/projects/{slug}` | Single project |
| GET | `/api/music` | Music entries |
| GET | `/api/music/recent` | Recent tracks |
| GET | `/api/music/now` | Now playing |
| GET | `/api/blog` | Blog entries |
| GET | `/api/skills` | Skills |
| GET | `/api/certifications` | Certifications and degree |
| GET | `/api/gallery` | Gallery items |
| * | `/api/admin/*` | Admin CRUD (JWT required) |

Interactive docs at `/docs` (Swagger) and `/redoc`.

---

## Auth

Admin routes use JWT. Tokens are issued via the login endpoint and validated on every admin request. Passwords are hashed with bcrypt.

The `admin_users` collection in MongoDB stores admin accounts. Use the seed script to create the initial user:

```bash
python scripts/seed_admin.py
```

---

## MongoDB Collections

- `projects` — slug (unique index), title, description, tech[], year, featured, github_url, live_url, cover_image
- `music` — title, artist, artwork_url, audio_url, source_url, source_platform, playable
- `blog_entries` — slug, title, content, published_at, tags[]
- `skills` — name, icon, category, display_order
- `certifications` — title, issuer, year, icon, skill_type, grid_size, display_order
- `gallery` — title, url, thumbnailUrl, year, tags[]
- `admin_users` — email (unique), password_hash, name

---

## Deployment

Fly.io or Render work well. Set all env vars from `.env` as secrets. Point `MONGO_URI` at MongoDB Atlas for production.

CORS is configured from `PUBLIC_SITE_URL` — make sure it matches your frontend domain.
