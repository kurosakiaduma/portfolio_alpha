from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Header
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel
import asyncio
import base64
import logging
import os
from pathlib import Path
from urllib.parse import urlparse
import httpx
from models.skill import Skill
from models.certification import Certification
from models.music import MusicEntry
from models.blog import BlogEntry
from core.auth import authenticate_user, create_access_token, verify_token
from db.mongo import (
    get_skill_documents,
    get_certification_documents,
    insert_document,
    update_document,
    delete_document,
    get_project_documents,
    get_music_documents,
    get_blog_documents,
    get_contact_message_documents,
    
)
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
router = APIRouter(tags=["admin"])


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
        logger.warning("Invalid authorization header format from: %s", authorization)
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = parts[1]
    payload = verify_token(token)
    if not payload:
        logger.warning("Token verification failed for token: %s", token)
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
async def admin_login(request: LoginRequest):
    """
    Admin login endpoint.
    Accepts email and password, returns JWT token and user info.
    """
    logger.info(f"Login attempt from: {request.email}")
    
    user = await authenticate_user(request.email, request.password)
    if not user:
        logger.warning(f"Failed login for: {request.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
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
async def admin_verify(authorization: Optional[str] = Header(None)):
    """
    Verify JWT token and return current user info.
    Accepts Bearer token in Authorization header.
    """
    user = await get_current_admin(authorization)
    return VerifyResponse(user=user)


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


GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


def _parse_github_owner_repo(github_url: str) -> Optional[Tuple[str, str]]:
    """Parse a GitHub repository owner and name from a repository URL."""
    if not github_url:
        return None

    url = github_url.strip()
    if url.startswith("git@github.com:"):
        url = url[len("git@github.com:") :]
    if url.endswith(".git"):
        url = url[: -len(".git")]

    parsed = urlparse(url)
    host = parsed.netloc.lower().replace("www.", "")
    raw_path = parsed.path.strip("/")

    if not host:
        raw_path = url.strip("/")
        if raw_path.startswith("github.com/"):
            raw_path = raw_path[len("github.com/") :]
    else:
        if host != "github.com":
            return None

    path_parts = raw_path.split("/")
    if len(path_parts) < 2:
        return None

    return path_parts[0], path_parts[1]


async def _fetch_docs_readme(client: httpx.AsyncClient, owner: str, repo: str, headers: Dict[str, str]) -> str:
    """Attempt to fetch the first Markdown file under /docs when README is unavailable."""
    try:
        docs_resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/contents/docs",
            headers=headers,
        )
        if docs_resp.status_code != 200:
            return ""

        items = docs_resp.json()
        if not isinstance(items, list):
            return ""

        for item in items:
            if item.get("type") != "file":
                continue
            name = item.get("name", "")
            if not name.lower().endswith(".md"):
                continue

            download_url = item.get("download_url")
            if not download_url:
                continue

            file_resp = await client.get(download_url)
            if file_resp.status_code == 200:
                return file_resp.text

        return ""
    except Exception as exc:
        logger.exception(
            "Failed to fetch docs README for %s/%s: %s",
            owner,
            repo,
            exc,
        )
        return ""


async def _fetch_readme_summary(owner: str, repo: str, project_id: str) -> None:
    """Fetch a GitHub README and store the first 1500 chars in the project document."""
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            summary = ""
            readme_resp = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/readme",
                headers=headers,
            )
            if readme_resp.status_code == 200:
                payload = readme_resp.json()
                content = payload.get("content", "")
                encoding = payload.get("encoding", "").lower()
                if encoding == "base64" and content:
                    try:
                        decoded = base64.b64decode(content).decode("utf-8", errors="replace")
                    except Exception as decode_exc:
                        logger.exception(
                            "Failed to decode README for %s/%s: %s",
                            owner,
                            repo,
                            decode_exc,
                        )
                        decoded = ""
                    summary = decoded

            if not summary:
                summary = await _fetch_docs_readme(client, owner, repo, headers)

            if not summary:
                logger.info(
                    "No README or docs markdown found for %s/%s; skipping summary update.",
                    owner,
                    repo,
                )
                return

            trimmed = summary.strip()
            if len(trimmed) > 1500:
                trimmed = trimmed[:1500]

            await update_document(
                "projects",
                project_id,
                {"readme_summary": trimmed},
            )
            logger.info(
                "Updated project %s with GitHub README summary for %s/%s.",
                project_id,
                owner,
                repo,
            )
    except Exception as exc:
        logger.exception(
            "Background README summary fetch failed for %s/%s: %s",
            owner,
            repo,
            exc,
        )


# ---------------------------------------------------------
# DASHBOARD STATS ENDPOINT 
# ---------------------------------------------------------
@router.get("/stats", response_model=Dict[str, int])
async def admin_dashboard_stats(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """
    Get dashboard statistics for admin panel.
    Returns counts of skills and certifications.
    """
    skill_count = len(await get_skill_documents())
    cert_count = len(await get_certification_documents())
    project_count = len(await get_project_documents())
    music_count = len(await get_music_documents())
    blog_count = len(await get_blog_documents())
    
    return {
        "skills": skill_count,
        "certifications": cert_count,
        "projects": project_count,
        "music": music_count,
        "blogs": blog_count,
    }



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

@router.get("/projects", response_model=List[Dict[str, Any]])
async def admin_list_projects(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all projects with their _id for the admin table."""
    docs = await get_project_documents()
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


@router.post("/projects", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_project(project: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_admin)):
    new_id = await insert_document("projects", project)

    owner_repo = _parse_github_owner_repo(project.get("github_url", "") or "")
    if owner_repo:
        owner, repo = owner_repo
        asyncio.create_task(_fetch_readme_summary(owner, repo, new_id))
        logger.info(
            "Scheduled README summary fetch for project %s (%s/%s).",
            new_id,
            owner,
            repo,
        )

    return {"id": new_id, **project}


@router.put("/projects/{project_id}", response_model=Dict[str, Any])
async def admin_update_project(project_id: str, project: Dict[str, Any], current_user: Dict[str, Any] = Depends(get_current_admin)):
    success = await update_document("projects", project_id, project)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")

    owner_repo = _parse_github_owner_repo(project.get("github_url", "") or "")
    if owner_repo:
        owner, repo = owner_repo
        asyncio.create_task(_fetch_readme_summary(owner, repo, project_id))
        logger.info(
            "Scheduled README summary fetch for project %s (%s/%s).",
            project_id,
            owner,
            repo,
        )

    return {"id": project_id, **project}


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_project(project_id: str, current_user: Dict[str, Any] = Depends(get_current_admin)):
    success = await delete_document("projects", project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None


# ---------------------------------------------------------
# MUSIC CRUD
# ---------------------------------------------------------

@router.get("/music", response_model=List[Dict[str, Any]])
async def admin_list_music(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all music entries with their _id for the admin table."""
    docs = await get_music_documents()
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


@router.post("/music", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_music(music: MusicEntry, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Create a new music entry."""
    music_dict = music.model_dump(mode="json")
    new_id = await insert_document("music", music_dict)
    return {"id": new_id, **music_dict}


@router.put("/music/{music_id}", response_model=Dict[str, Any])
async def admin_update_music(music_id: str, music: MusicEntry, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Update an existing music entry."""
    music_dict = music.model_dump(mode="json")
    success = await update_document("music", music_id, music_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Music entry not found")
    return {"id": music_id, **music_dict}


@router.delete("/music/{music_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_music(music_id: str, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Delete a music entry."""
    success = await delete_document("music", music_id)
    if not success:
        raise HTTPException(status_code=404, detail="Music entry not found")
    return None


# ---------------------------------------------------------
# BLOGS CRUD
# ---------------------------------------------------------

@router.get("/blogs", response_model=List[Dict[str, Any]])
async def admin_list_blogs(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all blog entries with their _id for the admin table."""
    docs = await get_blog_documents()
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs


@router.post("/blogs", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def admin_create_blog(blog: BlogEntry, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Create a new blog entry."""
    blog_dict = blog.model_dump(mode="json")
    new_id = await insert_document("blogs", blog_dict)
    return {"id": new_id, **blog_dict}


@router.put("/blogs/{blog_id}", response_model=Dict[str, Any])
async def admin_update_blog(blog_id: str, blog: BlogEntry, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Update an existing blog entry."""
    blog_dict = blog.model_dump(mode="json")
    success = await update_document("blogs", blog_id, blog_dict)
    if not success:
        raise HTTPException(status_code=404, detail="Blog entry not found")
    return {"id": blog_id, **blog_dict}


@router.delete("/blogs/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_blog(blog_id: str, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Delete a blog entry."""
    success = await delete_document("blogs", blog_id)
    if not success:
        raise HTTPException(status_code=404, detail="Blog entry not found")
    return None

# ---------------------------------------------------------
# MESSAGES CRUD
# ---------------------------------------------------------

class ReplyRequest(BaseModel):
    reply_text: str

@router.get("/messages", response_model=List[Dict[str, Any]])
async def admin_list_messages(current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Get all contact messages sorted by submitted_at desc."""
    docs = await get_contact_message_documents(sort=[("submitted_at", -1)])
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs

@router.put("/messages/{message_id}/reply", response_model=Dict[str, Any])
async def admin_reply_message(message_id: str, request: ReplyRequest, current_user: Dict[str, Any] = Depends(get_current_admin)):
    """Reply to a contact message."""
    update_data = {
        "reply_text": request.reply_text,
        "replied_at": datetime.now(timezone.utc)
    }
    success = await update_document("contact_messages", message_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Fetch updated document to return
    from db.mongo import get_document_by_id
    updated_doc = await get_document_by_id("contact_messages", message_id)
    if updated_doc:
        updated_doc["id"] = str(updated_doc.pop("_id"))
        return updated_doc
    return {"id": message_id, **update_data}

