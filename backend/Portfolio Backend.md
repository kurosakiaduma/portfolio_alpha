# Portfolio Backend — Notes

Design notes and implementation reference. For setup and API docs see `README.md`.

---

## Data Flow

Frontend fetches from `/api/*` (proxied in dev, direct in prod via `PUBLIC_API_URL`).
Admin CMS at `/alter` authenticates via `/api/admin/login`, stores JWT in localStorage, and calls `/api/admin/*` for CRUD.

---

## MongoDB Schema Notes

**projects**
```json
{
  "slug": "my-project",
  "title": "My Project",
  "description": "Full description",
  "short_description": "One-liner for cards",
  "tech": ["Python", "FastAPI"],
  "year": 2024,
  "featured": true,
  "cover_image": "https://...",
  "github_url": "https://github.com/...",
  "live_url": "https://..."
}
```

**music**
```json
{
  "title": "Track Name",
  "artist": "Artist",
  "artwork_url": "https://...",
  "audio_url": "https://...",
  "source_url": "https://...",
  "source_platform": "SoundCloud",
  "playable": true
}
```

**certifications / skills**

Both use `display_order` for grid positioning. Certifications have `skill_type` (`"degree"` | `"certificate"`) and `grid_size` (`"1x1"` | `"2x1"`). The degree entry renders as a `2x2` flip card.

---

## Indexes

```python
await db.projects.create_index("slug", unique=True)
await db.certifications.create_index([("title", 1), ("issuer", 1)], unique=True)
await db.admin_users.create_index("email", unique=True)
```

---

## Music

Currently backed by manually seeded entries in the `music` collection. Last.fm / iTunes integration is planned for live now-playing data.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB` | Database name (default: `portfolio`) |
| `JWT_SECRET` | Secret for signing tokens |
| `PUBLIC_SITE_URL` | Frontend origin for CORS |
| `PORT` | Server port (default: `8000`) |
| `LOG_LEVEL` | Logging level (default: `INFO`) |
