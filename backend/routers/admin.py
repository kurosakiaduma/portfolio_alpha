from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Header, Request
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import asyncio
import logging
import os
import time
import httpx
from pathlib import Path
from slugify import slugify
from models.skill import Skill
from models.certification import Certification
from models.project import Project
from models.music import MusicEntry
from models.blog import BlogEntry as BlogEntryModel
from core.auth import authenticate_user, create_access_token, verify_token
from db.mongo import (
    get_skill_documents,
    get_certification_documents,
    get_project_documents,
    get_music_documents,
    get_blog_documents,
    get_document_by_slug,
    insert_document,
    update_document,
    delete_document,
    get_document_by_id
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["admin"])

# ---------------------------------------------------------
# IP-BASED RATE LIMITER (in-memory)
# ---------------------------------------------------------
# Tracks failed login attempts per IP.
# Structure: { ip: {"count": int, "window_start": float, "locked_until": float} }
_login_attempts: Dict[str, Dict[str, float]] = {}

MAX_ATTEMPTS = 5          # max failures before lockout
WINDOW_SECONDS = 600      # 10-minute sliding window
LOCKOUT_SECONDS = 900     # 15-minute lockout


def _check_rate_limit(ip: str) -> None:
    """Raise 429 if the IP is locked out. Resets window when expired."""
    now = time.time()
    entry = _login_attempts.get(ip)

    if entry:
        # Still within lockout period
        if entry.get("locked_until", 0) > now:
            retry_after = int(entry["locked_until"] - now)
            raise HTTPException(
                status_code=429,
                detail="Too many failed login attempts. Try again later.",
                headers={"Retry-After": str(retry_after)},
            )
        # Window expired — reset
        if now - entry["window_start"] > WINDOW_SECONDS:
            _login_attempts.pop(ip, None)


def _record_failure(ip: str) -> None:
    """Record a failed login attempt and apply lockout if threshold is reached."""
    now = time.time()
    entry = _login_attempts.setdefault(ip, {"count": 0, "window_start": now, "locked_until": 0})

    # Reset window if it has expired
    if now - entry["window_start"] > WINDOW_SECONDS:
        entry["count"] = 0
        entry["window_start"] = now

    entry["count"] += 1
    if entry["count"] >= MAX_ATTEMPTS:
        entry["locked_until"] = now + LOCKOUT_SECONDS
        logger.warning("IP %s locked out for %d seconds after %d failures", ip, LOCKOUT_SECONDS, entry["count"])


def _clear_attempts(ip: str) -> None:
    """Clear rate-limit state for an IP after a successful login."""
    _login_attempts.pop(ip, None)


# ---------------------------------------------------------
# AUTH MODELS
# ---------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]


class VerifyResponse(BaseModel):
    user: Dict[str, Any]


# ---------------------------------------------------------
# AUTH DEPENDENCIES
# ---------------------------------------------------------

async def get_current_admin(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Dependency to verify admin JWT token from Authorization header.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = parts[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return {
        "id": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("name"),
        "is_admin": payload.get("is_admin", False),
    }


# ---------------------------------------------------------
# AUTH ENDPOINTS
# ---------------------------------------------------------

@router.post("/login", response_model=LoginResponse)
async def admin_login(request: Request, login_request: LoginRequest):
    """
    Admin login endpoint with IP-based rate limiting.
    Accepts email and password, returns JWT token and user info.
    """
    ip = request.client.host if request.client else "unknown"
    _check_rate_limit(ip)

    logger.info("Login attempt from IP %s for email: %s", ip, login_request.email)

    user = await authenticate_user(login_request.email, login_request.password)
    if not user:
        _record_failure(ip)
        logger.warning("Failed login for: %s", login_request.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    _clear_attempts(ip)
    token = create_access_token(user["id"], user["email"], user["name"])

    return LoginResponse(
        token=token,
        user={
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "is_admin": user["is_admin"],
        }
    )


@router.get("/verify", response_model=VerifyResponse)
async def admin_verify(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """
    Verify JWT token and return current user info.
    Accepts Bearer token in Authorization header.
    """
    return VerifyResponse(user=current_user)


# ---------------------------------------------------------
# FILE UPLOAD
# ---------------------------------------------------------

class UploadResponse(BaseModel):
    filename: str
    url: str


@router.post("/upload-icon", response_model=UploadResponse)
async def admin_upload_icon(
    file: UploadFile = File(...),
    icon_type: str = "skills",
    current_user: Dict[str, Any] = Depends(get_current_admin)
):
    """
    Upload an icon file (SVG) for skills or certifications.
    
    Parameters:
        file: SVG file to upload
        icon_type: Directory name ('skills' or 'certifications')
        authorization: Bearer token for authentication
    """
    # Verified by dependency `get_current_admin`
    
    # Validate file type
    if not file.filename or not file.filename.endswith('.svg'):
        raise HTTPException(status_code=400, detail="Only SVG files are allowed")
    
    # Validate icon type
    if icon_type not in ['skills', 'certifications']:
        raise HTTPException(status_code=400, detail="Invalid icon type. Must be 'skills' or 'certifications'")
    
    try:
        # Construct path to frontend public icons directory
        project_root = Path(__file__).parent.parent.parent
        icon_dir = project_root / "frontend" / "public" / "icons" / icon_type
        icon_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file
        file_path = icon_dir / file.filename
        content = await file.read()
        
        with open(file_path, 'wb') as f:
            f.write(content)
        
        logger.info(f"Icon uploaded: {icon_type}/{file.filename}")
        
        return UploadResponse(
            filename=file.filename,
            url=f"/icons/{icon_type}/{file.filename}"
        )
    except Exception as e:
        logger.error(f"Icon upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload icon")


# ---------------------------------------------------------
# SKILLS CRUD
# ---------------------------------------------------------

@router.get("/skills", response_model=List[Dict[str, Any]])
async def admin_list_skills(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all skills with their _id for the admin table."""
    docs = await get_skill_documents()
    # Convert _id ObjectId to string id
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


@router.post("/skills", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_skill(skill: Skill, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Create a new skill."""
    skill_dict = skill.model_dump()
    new_id = await insert_document("skills", skill_dict)
    return {"id": new_id, **skill_dict}


@router.put("/skills/{skill_id}", response_model=Dict[str, Any])
async def admin_update_skill(skill_id: str, skill: Skill, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Update an existing skill."""
    skill_dict = skill.model_dump()
    success = await update_document("skills", skill_id, skill_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"id": skill_id, **skill_dict}


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_skill(skill_id: str, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Delete a skill."""
    success = await delete_document("skills", skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    return None


# ---------------------------------------------------------
# CERTIFICATIONS CRUD (admin)
# ---------------------------------------------------------


@router.get("/certifications", response_model=List[Dict[str, Any]])
async def admin_list_certifications(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all certifications with their _id for the admin table."""
    docs = await get_certification_documents()
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


@router.post("/certifications", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_certification(cert: Certification, current_user: Dict[str, Any] = Depends(get_current_admin)):
    cert_dict = cert.model_dump()
    new_id = await insert_document("certifications", cert_dict)
    return {"id": new_id, **cert_dict}


@router.put("/certifications/{cert_id}", response_model=Dict[str, Any])
async def admin_update_certification(cert_id: str, cert: Certification, current_user: Dict[str, Any] = Depends(get_current_admin)):
    cert_dict = cert.model_dump()
    success = await update_document("certifications", cert_id, cert_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Certification not found")
    return {"id": cert_id, **cert_dict}


@router.delete("/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_certification(cert_id: str, current_user: Dict[str, Any] = Depends(get_current_admin)):
    success = await delete_document("certifications", cert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Certification not found")
    return None


# ---------------------------------------------------------
# PROJECTS CRUD
# ---------------------------------------------------------

class GitHubFetchRequest(BaseModel):
    repo_url: Optional[str] = None
    username: Optional[str] = None
    repo: Optional[str] = None


async def _unique_slug(base_slug: str) -> str:
    """Return a slug that doesn't collide with existing project slugs."""
    existing = await get_document_by_slug("projects", base_slug)
    if not existing:
        return base_slug
    counter = 2
    while True:
        candidate = f"{base_slug}-{counter}"
        existing = await get_document_by_slug("projects", candidate)
        if not existing:
            return candidate
        counter += 1


@router.get("/projects", response_model=List[Dict[str, Any]])
async def admin_list_projects(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all projects for the admin table."""
    docs = await get_project_documents(sort=[("featured", -1), ("year", -1)])
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


@router.post("/projects/github-fetch", response_model=Dict[str, Any])
async def admin_github_fetch(
    body: GitHubFetchRequest,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Fetch project metadata from the GitHub API and return pre-populated fields."""
    if body.repo_url:
        path = body.repo_url.rstrip("/").removeprefix("https://github.com/").removeprefix("http://github.com/")
        parts = path.split("/")
        if len(parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid repo_url format")
        owner, repo_name = parts[0], parts[1]
    elif body.username and body.repo:
        owner, repo_name = body.username, body.repo
    else:
        raise HTTPException(status_code=400, detail="Provide repo_url or username+repo")

    github_token = os.getenv("GITHUB_TOKEN")
    gh_headers = {"Accept": "application/vnd.github+json"}
    if github_token:
        gh_headers["Authorization"] = f"Bearer {github_token}"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo_name}",
                headers=gh_headers,
            )
    except Exception as exc:
        logger.error("GitHub API request failed: %s", exc)
        raise HTTPException(status_code=502, detail="Failed to reach GitHub API")

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="GitHub repository not found")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"GitHub API returned {resp.status_code}")

    data = resp.json()
    return {
        "title": data.get("name", ""),
        "description": data.get("description") or "",
        "short_description": (data.get("description") or "")[:120],
        "github_url": data.get("html_url", ""),
        "tech": [data["language"]] if data.get("language") else [],
        "source": "github",
    }


@router.post("/projects", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_project(project: Project, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Create a new project, generating a unique slug from the title."""
    project_dict = project.model_dump(exclude={"id"})
    base_slug = slugify(project.title)
    project_dict["slug"] = await _unique_slug(base_slug)
    new_id = await insert_document("projects", project_dict)
    return {"id": new_id, **project_dict}


@router.put("/projects/{project_id}", response_model=Dict[str, Any])
async def admin_update_project(
    project_id: str,
    project: Project,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Update an existing project."""
    project_dict = project.model_dump(exclude={"id"})
    success = await update_document("projects", project_id, project_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": project_id, **project_dict}


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_project(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Delete a project."""
    success = await delete_document("projects", project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None


# ---------------------------------------------------------
# MUSIC CRUD
# ---------------------------------------------------------

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".flac", ".m4a"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.post("/upload-image", response_model=UploadResponse)
async def admin_upload_image(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """
    Upload a project image file (JPEG, PNG, WebP, GIF).
    Saves to frontend/public/images/projects/ and returns the relative URL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format. Allowed: JPEG, PNG, WebP, GIF",
        )

    try:
        project_root = Path(__file__).parent.parent.parent
        images_dir = project_root / "frontend" / "public" / "images" / "projects"
        images_dir.mkdir(parents=True, exist_ok=True)

        file_path = images_dir / file.filename
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info("Project image uploaded: %s", file.filename)
        return UploadResponse(filename=file.filename, url=f"/images/projects/{file.filename}")
    except Exception as exc:
        logger.error("Image upload failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to upload image")


@router.get("/music", response_model=List[Dict[str, Any]])
async def admin_list_music(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all music entries for the admin table."""
    docs = await get_music_documents(sort=[("display_order", 1)])
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


@router.post("/music", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_music(
    entry: MusicEntry,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Create a new music entry."""
    entry_dict = entry.model_dump(exclude={"id"})
    new_id = await insert_document("music", entry_dict)
    return {"id": new_id, **entry_dict}


@router.put("/music/{entry_id}", response_model=Dict[str, Any])
async def admin_update_music(
    entry_id: str,
    entry: MusicEntry,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Update an existing music entry."""
    entry_dict = entry.model_dump(exclude={"id"})
    success = await update_document("music", entry_id, entry_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Music entry not found")
    return {"id": entry_id, **entry_dict}


@router.delete("/music/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_music(
    entry_id: str,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Delete a music entry."""
    success = await delete_document("music", entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Music entry not found")
    return None


@router.post("/music/upload-audio", response_model=UploadResponse)
async def admin_upload_audio(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """
    Upload an audio file for a music entry.
    Saves to frontend/public/audio/ and returns the relative URL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Allowed: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}",
        )

    try:
        project_root = Path(__file__).parent.parent.parent
        audio_dir = project_root / "frontend" / "public" / "audio"
        audio_dir.mkdir(parents=True, exist_ok=True)

        file_path = audio_dir / file.filename
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info("Audio uploaded: %s", file.filename)
        return UploadResponse(filename=file.filename, url=f"/audio/{file.filename}")
    except Exception as exc:
        logger.error("Audio upload failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to upload audio file")


# ---------------------------------------------------------
# STATS
# ---------------------------------------------------------

class StatsResponse(BaseModel):
    skills: int
    certifications: int
    projects: int
    music: int
    blog: int


@router.get("/stats", response_model=StatsResponse)
async def admin_stats(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Return document counts for all content collections in a single request."""
    from db.mongo import get_db
    db = get_db()
    try:
        skills, certifications, projects, music, blog = await asyncio.gather(
            db.skills.count_documents({}),
            db.certifications.count_documents({}),
            db.projects.count_documents({}),
            db.music.count_documents({}),
            db.blog_entries.count_documents({}),
        )
    except Exception as exc:
        logger.error("Failed to fetch stats: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to fetch stats")
    return StatsResponse(
        skills=skills,
        certifications=certifications,
        projects=projects,
        music=music,
        blog=blog,
    )


# ---------------------------------------------------------
# BLOG CRUD
# ---------------------------------------------------------


def _serialize_blog_doc(doc: dict) -> dict:
    """Convert a raw MongoDB blog document to a JSON-serialisable dict."""
    doc["id"] = str(doc.pop("_id"))
    if "url" in doc and not isinstance(doc["url"], str):
        doc["url"] = str(doc["url"])
    if "published_date" in doc and hasattr(doc["published_date"], "isoformat"):
        doc["published_date"] = doc["published_date"].isoformat()
    return doc


@router.get("/blog", response_model=List[Dict[str, Any]])
async def admin_list_blog(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all blog entries for the admin table."""
    docs = await get_blog_documents(sort=[("published_date", -1)])
    return [_serialize_blog_doc(doc) for doc in docs]


@router.post("/blog", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_blog(
    entry: BlogEntryModel,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Create a new blog entry."""
    entry_dict = entry.model_dump(exclude={"id"})
    # Serialise HttpUrl and date to plain strings for MongoDB storage
    entry_dict["url"] = str(entry_dict["url"])
    if hasattr(entry_dict.get("published_date"), "isoformat"):
        entry_dict["published_date"] = entry_dict["published_date"].isoformat()
    new_id = await insert_document("blog_entries", entry_dict)
    return {"id": new_id, **entry_dict}


@router.put("/blog/{entry_id}", response_model=Dict[str, Any])
async def admin_update_blog(
    entry_id: str,
    entry: BlogEntryModel,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Update an existing blog entry."""
    entry_dict = entry.model_dump(exclude={"id"})
    entry_dict["url"] = str(entry_dict["url"])
    if hasattr(entry_dict.get("published_date"), "isoformat"):
        entry_dict["published_date"] = entry_dict["published_date"].isoformat()
    success = await update_document("blog_entries", entry_id, entry_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Blog entry not found")
    return {"id": entry_id, **entry_dict}


@router.delete("/blog/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_blog(
    entry_id: str,
    current_user: Dict[str, Any] = Depends(get_current_admin),
):
    """Delete a blog entry."""
    success = await delete_document("blog_entries", entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Blog entry not found")
    return None
