# Known Issues

Review date: 2026-10-21
Scope: working tree committed in the `b29df1c..HEAD` series.

These are pre-existing issues found while reviewing the uncommitted changes. They were intentionally **not** fixed during the commit pass so the commits reflect the original work. Items are ordered by risk.

---

## Critical

### 1. Backend secrets can be baked into the Docker image

- `backend/Dockerfile` copies the full build context with `COPY . .`.
- `backend/.dockerignore` does **not** exclude `.env` or `local.env`, both of which exist in `backend/`.
- It also excludes `__init__.py`, which can break Python package imports in the image.

**Impact:** environment secrets may end up in image layers, and the built image may fail to import local packages.

**Suggested fix:**
- Add `.env`, `.env.*`, and `local.env` to `backend/.dockerignore`.
- Remove the `__init__.py` exclusion.
- Rebuild and verify with `docker history` / `docker run ... ls -la`.

### 2. Frontend image build depends on an ignored lockfile

- `frontend/Dockerfile` copies `pnpm-lock.yaml` and runs `pnpm install --frozen-lockfile`.
- `frontend/pnpm-lock.yaml` exists locally but is ignored by `.gitignore:37` and is not tracked.

**Impact:** a clean clone or CI build fails at `COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./`.

**Suggested fix:** commit `pnpm-lock.yaml` (remove it from `.gitignore` or use `git add -f`), or switch the image back to the tracked `package-lock.json`.

### 3. Admin media and GitHub import endpoints were removed but the client still calls them

The admin router no longer defines:

- `POST /api/admin/upload-image`
- `POST /api/admin/upload-audio`
- `POST /api/admin/projects/github-fetch`

The frontend still calls them in `frontend/src/lib/adminApi.ts`:

- `adminFetchFromGitHub` → `/projects/github-fetch` (line ~131)
- `adminUploadAudio` → `/upload-audio` (line ~171)
- `adminUploadImage` → `/upload-image` (line ~221)

These are used by `CoverImageInput`, `AdminImageGallery`, `MusicForm`, and `ProjectForm`.

**Impact:** image/audio uploads and GitHub project import return 404 in the admin UI.

**Suggested fix:** restore the endpoints or remove/replace the corresponding UI actions.

---

## High

### 4. `load_dotenv()` runs after routers are imported

`backend/main.py` imports `routers` before calling `load_dotenv()`:

```python
from routers import skills, certifications, projects, music, blog, contact_messages, chatbot
...
load_dotenv()
```

`routers.admin` imports `core.auth`, which now raises `EnvironmentError` when `JWT_SECRET` is missing. If the app is started with a `.env` file but no exported environment variables, import fails before dotenv is loaded.

**Suggested fix:** move `load_dotenv()` above all `routers` imports (or load it in `core/auth.py` before reading `JWT_SECRET`).

### 5. Project slug auto-generation was removed

- The previous `_unique_slug()` helper and `slugify` import were removed from `backend/routers/admin.py`.
- Project create/update now accept raw `Dict[str, Any]`.
- `ProjectForm` still labels the slug input as “auto-generated if empty”, but nothing generates it anymore.

**Impact:** creating a project with an empty slug stores an empty/missing slug, producing broken `/projects/<slug>` links.

**Suggested fix:** restore server-side slug generation and uniqueness, or make the field required and validate it in the API.

### 6. Frontend compose port does not match the image

- `frontend/Dockerfile` exposes `4321` and sets `PORT=4321`.
- `docker-compose.azure.yml` maps `${FRONTEND_PORT:-3000}:80`.

**Impact:** the frontend container is unreachable through the published port.

**Suggested fix:** map `${FRONTEND_PORT:-3000}:4321` (and confirm the Node server binds to `0.0.0.0`).

### 7. Project detail route conflicts with SSR output

- `frontend/astro.config.mjs` uses `output: 'server'` with `@astrojs/node`.
- `frontend/src/pages/projects/[slug].astro` still uses `getStaticPaths()` and fetches at build time.

**Impact:** the route can fail or be ignored depending on Astro’s prerender behavior.

**Suggested fix:** add `export const prerender = true` and provide a build-time API, or convert the page to a server-rendered route that reads `Astro.params` and handles 404s at request time.

### 8. Authentication logging and rate limiting regressed

- `backend/routers/admin.py` logs the full JWT on verification failure (`logger.warning("Token verification failed for token: %s", token)`).
- The IP-based login rate limiter was removed from `admin_login`.

**Impact:** tokens can leak into logs, and admin login has no brute-force throttle.

**Suggested fix:** log only a token fingerprint or user identifier, and restore rate limiting (in-memory or shared store such as Redis).

### 9. Duplicate public contact routes

Both files define `POST /contact`:

- `backend/routers/contact.py` — has a 5-per-hour IP rate limit
- `backend/routers/contact_messages.py` — no rate limit

`backend/main.py` registers only `contact_messages`, so the rate-limited implementation is dead code and the live endpoint is unthrottled.

**Suggested fix:** keep one implementation (preferably the rate-limited one), delete the other, and register it once.

---

## Medium

### 10. CSS selector typo

`frontend/src/styles/global.css:431` contains:

```css
..filter-pill.active {
```

The double dot makes the selector invalid, so the active filter pill styling does not apply.

**Suggested fix:** change it to `.filter-pill.active`.

### 11. `.gitignore` is not tracked

The first line of `.gitignore` is `.gitignore`, so the file ignores itself. It is not present in a fresh clone.

**Impact:** build outputs, dependencies, local env files, and plan documents are no longer ignored for other checkouts.

**Suggested fix:** remove the self-entry and commit `.gitignore`.

### 12. Backend music test is stale

`backend/tests/test_music.py:14` expects `MusicEntry(playable=True, audio_url=None)` to raise `ValidationError`. The model now supports YouTube playback without an audio URL, so the test fails (2/3 pass).

**Suggested fix:** update the test to assert the current YouTube behavior, and keep a separate test for invalid combinations if needed.

### 13. Azure manifest contains subscription and resource identifiers

`ollama-app.yaml` includes Azure subscription IDs, resource group names, environment IDs, and public outbound IPs. These are not credentials, but they are deployment-specific metadata.

**Suggested fix:** sanitize identifiers before publishing the repository, or keep the file out of source control.

### 14. Empty backend scaffolding

The following files are committed as 0-byte placeholders:

- `backend/agents/crew.py`
- `backend/agents/main.py`
- `backend/agents/config/agents.yaml`
- `backend/agents/config/tasks.yaml`
- `backend/scripts/create_indexes.py`

`backend/agents/__init__.py` is present as a package marker, but the package has no implementation. `backend/scripts/create_indexes.py` creates no indexes.

**Suggested fix:** implement or remove the scaffolding before relying on it.

### 15. Inconsistent timestamp handling

- `backend/models/contact_message.py` uses `datetime.utcnow` (naive, deprecated in newer Python).
- Auth/admin models use a fixed `UTC+3` offset.
- Admin message replies use `datetime.now(timezone.utc)`.

**Impact:** timestamps mix naive and aware values and different offsets, which complicates sorting and display.

**Suggested fix:** standardize on timezone-aware UTC (`datetime.now(timezone.utc)`) at the storage boundary and format per locale in the UI.

---

## Low

### 16. Leftover implementation commentary in an admin component

`frontend/src/components/admin/components/EntryPreviewModal.tsx` contains working notes such as:

- `// Formatting helpers removed since real cards are used.`
- `// Design says: ... Let's check ...`

These are harmless but should be removed before the component is considered finished.

### 17. Static sitemap may drift from generated routes

`frontend/public/sitemap.xml` is a hand-maintained file while `@astrojs/sitemap` is now configured. With SSR output and new project detail pages, the static sitemap will not include dynamically generated routes.

**Suggested fix:** rely on the integration’s generated sitemap, or generate the static file as part of deployment.

---

## Validation performed

- `frontend`: `vitest --run` → 2 files, 13 tests passed.
- `backend/tests/test_projects.py` → 5/5 passed.
- `backend/tests/test_music.py` → 2/3 passed (see issue 12).
- A full frontend build and Docker image build were **not** run during the commit pass.
