"""MCP tools for the chatbot with external API integrations."""
import httpx
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

load_dotenv()

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api")

# External API credentials
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
PINTEREST_ACCESS_TOKEN = os.getenv("PINTEREST_ACCESS_TOKEN")
INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
SOUNDCLOUD_CLIENT_ID = os.getenv("SOUNDCLOUD_CLIENT_ID")
SOUNDCLOUD_USER_ID = os.getenv("SOUNDCLOUD_USER_ID")

# Email configuration
SMTP_HOST: str = os.getenv("SMTP_HOST", '')
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str = os.getenv("SMTP_USER", '')
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", '')
CONTACT_EMAIL: str = os.getenv("CONTACT_EMAIL", '')

# ============================================================================
# CORE PORTFOLIO TOOLS (with viewport navigation)
# ============================================================================

async def get_bio() -> Dict[str, Any]:
    """Get the portfolio owner's professional biography and background."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/bio")
        response.raise_for_status()
        bio_data = response.json()
    
    return {
        "data": bio_data,
        "action": {
            "type": "navigate",
            "target": "about",
            "smooth": True
        }
    }

async def list_skills(category: Optional[str] = None) -> Dict[str, Any]:
    """List technical skills with SVG badges."""
    params = {}
    if category:
        params["category"] = category
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/skills", params=params)
        response.raise_for_status()
        skills_data = response.json()
    
    # Enrich with badge URLs
    for skill in skills_data:
        color = skill.get("color", "blue").replace("#", "")
        skill["badge_url"] = f"https://img.shields.io/badge/{skill['name']}-{color}"
    
    return {
        "data": skills_data,
        "action": {
            "type": "navigate",
            "target": "skills",
            "smooth": True,
            "highlight": category
        }
    }

async def list_certifications() -> Dict[str, Any]:
    """List professional certifications with badge visuals."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/certifications")
        response.raise_for_status()
        certs_data = response.json()
    
    return {
        "data": certs_data,
        "action": {
            "type": "navigate",
            "target": "skills",
            "section": "certifications",
            "smooth": True
        }
    }

# ============================================================================
# PROJECT & GITHUB INTEGRATION TOOLS
# ============================================================================

async def list_projects(limit: int = 10, featured: Optional[bool] = None) -> Dict[str, Any]:
    """List portfolio projects (CMS-managed, GitHub-synced)."""
    params = {"limit": limit}
    if featured is not None:
        params["featured"] = featured
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/projects", params=params)
        response.raise_for_status()
        projects_data = response.json()
    
    return {
        "data": projects_data,
        "action": {
            "type": "navigate",
            "target": "projects",
            "smooth": True
        }
    }

async def get_github_repos(username: str = "kurosakiaduma", limit: int = 10) -> Dict[str, Any]:
    """Fetch GitHub repositories (filtered by CMS whitelist)."""
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/users/{username}/repos",
            params={"sort": "updated", "per_page": limit, "type": "owner"},
            headers=headers
        )
        response.raise_for_status()
        repos = response.json()
    
    whitelisted = await get_whitelisted_repo_names()
    filtered_repos = [r for r in repos if r["name"] in whitelisted]
    
    return {
        "data": filtered_repos,
        "action": {
            "type": "navigate",
            "target": "projects",
            "smooth": True
        }
    }

async def get_whitelisted_repo_names() -> List[str]:
    """Fetch whitelisted repo names from CMS/database."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/projects")
        response.raise_for_status()
        projects = response.json()
        return [p.get("github_repo") for p in projects if p.get("github_repo")]

async def get_project_details(slug: str) -> Dict[str, Any]:
    """Get detailed information about a specific project."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/projects/{slug}")
        response.raise_for_status()
        project_data = response.json()
    
    return {
        "data": project_data,
        "action": {
            "type": "navigate",
            "target": "projects",
            "smooth": True,
            "modal": {"open": True, "project_slug": slug}
        }
    }

# ============================================================================
# GALLERY & SOCIAL MEDIA INTEGRATION TOOLS
# ============================================================================

async def get_gallery_items(source: str = "all", limit: int = 20) -> Dict[str, Any]:
    """Get gallery items from Pinterest and Instagram (CMS-filtered)."""
    items = []
    
    if source in ["all", "pinterest"]:
        pinterest_items = await fetch_pinterest_boards()
        items.extend(pinterest_items)
    
    if source in ["all", "instagram"]:
        instagram_items = await fetch_instagram_media()
        items.extend(instagram_items)
    
    whitelisted = await get_whitelisted_media_ids()
    filtered_items = [i for i in items if i["id"] in whitelisted]
    
    return {
        "data": filtered_items[:limit],
        "action": {
            "type": "navigate",
            "target": "gallery",
            "smooth": True
        }
    }

async def fetch_pinterest_boards() -> List[Dict[str, Any]]:
    """Fetch pins from specific Pinterest boards."""
    if not PINTEREST_ACCESS_TOKEN:
        return []
    
    # Implementation for Pinterest API v5
    # Returns list of pins with metadata
    return []

async def fetch_instagram_media() -> List[Dict[str, Any]]:
    """Fetch media from Instagram (CMS-approved only)."""
    if not INSTAGRAM_ACCESS_TOKEN:
        return []
    
    # Implementation for Instagram Basic Display API
    # Returns list of media with metadata
    return []

async def get_whitelisted_media_ids() -> List[str]:
    """Fetch whitelisted media IDs from CMS/database."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/gallery")
        response.raise_for_status()
        gallery_items = response.json()
        return [item.get("external_id") for item in gallery_items if item.get("external_id")]

# ============================================================================
# MUSIC & SOUNDCLOUD INTEGRATION TOOLS
# ============================================================================

async def get_soundcloud_tracks(limit: int = 10) -> Dict[str, Any]:
    """Fetch tracks from SoundCloud profile."""
    if not SOUNDCLOUD_CLIENT_ID or not SOUNDCLOUD_USER_ID:
        return {"error": "SoundCloud not configured", "data": []}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.soundcloud.com/users/{SOUNDCLOUD_USER_ID}/tracks",
            params={
                "client_id": SOUNDCLOUD_CLIENT_ID,
                "limit": limit,
                "linked_partitioning": 1
            }
        )
        response.raise_for_status()
        tracks_data = response.json()
    
    return {
        "data": tracks_data.get("collection", []),
        "action": {
            "type": "navigate",
            "target": "music",
            "smooth": True
        }
    }

async def play_music_track(track_id: Optional[str] = None, playlist: Optional[str] = None) -> Dict[str, Any]:
    """Control music playback in MusicIsland."""
    if track_id:
        track = await get_soundcloud_track_by_id(track_id)
    elif playlist:
        tracks = await get_soundcloud_playlist_tracks(playlist)
        track = tracks[0] if tracks else None
    else:
        tracks = await get_soundcloud_tracks(limit=1)
        track = tracks["data"][0] if tracks["data"] else None
    
    if not track:
        return {"error": "No track found"}
    
    return {
        "data": track,
        "action": {
            "type": "navigate",
            "target": "music",
            "smooth": True,
            "playback": {
                "command": "play",
                "track_id": track["id"],
                "track_url": track["permalink_url"]
            }
        }
    }

async def get_soundcloud_track_by_id(track_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a specific SoundCloud track by ID."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.soundcloud.com/tracks/{track_id}",
            params={"client_id": SOUNDCLOUD_CLIENT_ID}
        )
        if response.status_code == 200:
            return response.json()
    return None

async def get_soundcloud_playlist_tracks(playlist_name: str) -> List[Dict[str, Any]]:
    """Fetch tracks from a SoundCloud playlist."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.soundcloud.com/users/{SOUNDCLOUD_USER_ID}/playlists",
            params={"client_id": SOUNDCLOUD_CLIENT_ID}
        )
        if response.status_code == 200:
            playlists = response.json()
            for playlist in playlists:
                if playlist_name.lower() in playlist.get("title", "").lower():
                    return playlist.get("tracks", [])
    return []

# ============================================================================
# VIEWPORT NAVIGATION TOOLS
# ============================================================================

async def navigate_to_section(section: str, smooth: bool = True) -> Dict[str, Any]:
    """Navigate viewport to a specific section/island."""
    valid_sections = ["hero", "about", "projects", "skills", "gallery", "music", "footer"]
    
    if section not in valid_sections:
        return {"error": f"Invalid section. Choose from: {', '.join(valid_sections)}"}
    
    return {
        "data": {"section": section},
        "action": {
            "type": "navigate",
            "target": section,
            "smooth": smooth,
            "update_nav": True
        }
    }

async def get_contact_info() -> Dict[str, Any]:
    """Get contact information and social media links."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/bio")
        response.raise_for_status()
        bio_data = response.json()
    
    contact = {
        "email": bio_data.get("email", ""),
        "github": bio_data.get("social", {}).get("github", ""),
        "linkedin": bio_data.get("social", {}).get("linkedin", ""),
        "x": bio_data.get("social", {}).get("x", ""),
    }
    
    return {
        "data": contact,
        "action": {
            "type": "navigate",
            "target": "footer",
            "smooth": True
        }
    }



async def send_contact_request(
    name: str,
    email: str,
    message: str,
    subject: str = "Portfolio Contact Request"
) -> dict:
    """
    Send a contact request email from chatbot conversation.
    
    Args:
        name: Visitor's name
        email: Visitor's email address
        message: The full message/request
        subject: Email subject line
    
    Returns:
        dict: Confirmation with success status
    """
    try:
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"[Portfolio Chatbot] {subject}"
        msg['From'] = SMTP_USER
        msg['To'] = CONTACT_EMAIL
        msg['Reply-To'] = email
        
        # HTML email body
        html_body = f"""
        <html>
            <body style="font-family: monospace; background-color: #0a0a0a; color: #00d4ff; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; border: 2px solid #00d4ff; padding: 20px;">
                    <h2 style="color: #ff006e; text-shadow: 0 0 10px rgba(255,0,110,0.6);">
                        🤖 New Contact Request from Portfolio Chatbot
                    </h2>
                    
                    <div style="margin: 20px 0; padding: 15px; background: rgba(0,212,255,0.1); border-left: 3px solid #00d4ff;">
                        <p><strong style="color: #00ff88;">From:</strong> {name}</p>
                        <p><strong style="color: #00ff88;">Email:</strong> <a href="mailto:{email}" style="color: #00d4ff;">{email}</a></p>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 15px; background: rgba(255,0,110,0.1); border-left: 3px solid #ff006e;">
                        <p><strong style="color: #ffbe0b;">Message:</strong></p>
                        <p style="white-space: pre-wrap; line-height: 1.6;">{message}</p>
                    </div>
                    
                    <hr style="border: 1px solid #333; margin: 20px 0;">
                    
                    <p style="font-size: 12px; color: #666;">
                        Sent via Portfolio Chatbot • {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Plain text fallback
        text_body = f"""
        New Contact Request from Portfolio Chatbot
        ==========================================
        
        From: {name}
        Email: {email}
        
        Message:
        {message}
        
        ---
        Sent via Portfolio Chatbot
        {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        """
        
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        async with aiosmtplib.SMTP(hostname=SMTP_HOST, port=SMTP_PORT) as smtp:
            await smtp.login(SMTP_USER, SMTP_PASSWORD)
            await smtp.send_message(msg)
        
        return {
            "data": {
                "success": True,
                "message": "Your message has been sent successfully! I'll get back to you soon."
            },
            "action": {
                "type": "navigate",
                "target": "contact",
                "smooth": True
            }
        }
        
    except Exception as e:
        return {
            "data": {
                "success": False,
                "error": f"Failed to send message: {str(e)}",
                "fallback": f"Please email me directly at {CONTACT_EMAIL}"
            }
        }

# ============================================================================
# TOOL REGISTRATION
# ============================================================================

def register_tools() -> List[Dict[str, Any]]:
    """Register all available tools for the MCP agent."""
    return [
        {
            "name": "get_bio",
            "function": get_bio,
            "description": "Get the portfolio owner's professional biography. Navigates to About section.",
            "category": "portfolio"
        },
        {
            "name": "list_skills",
            "function": list_skills,
            "description": "List technical skills with SVG badges. Navigates to SkillsIsland.",
            "category": "portfolio"
        },
        {
            "name": "list_certifications",
            "function": list_certifications,
            "description": "List professional certifications. Navigates to certifications section.",
            "category": "portfolio"
        },
        {
            "name": "list_projects",
            "function": list_projects,
            "description": "List portfolio projects (CMS-managed, GitHub-synced). Navigates to ProjectsIsland.",
            "category": "projects"
        },
        {
            "name": "get_github_repos",
            "function": get_github_repos,
            "description": "Fetch live GitHub repositories (CMS-filtered). Shows latest code work.",
            "category": "projects"
        },
        {
            "name": "get_project_details",
            "function": get_project_details,
            "description": "Get detailed information about a specific project. Opens project modal.",
            "category": "projects"
        },
        {
            "name": "get_gallery_items",
            "function": get_gallery_items,
            "description": "Get gallery items from Pinterest and Instagram (CMS-filtered). Navigates to GalleryIsland.",
            "category": "gallery"
        },
        {
            "name": "get_soundcloud_tracks",
            "function": get_soundcloud_tracks,
            "description": "Fetch tracks from SoundCloud profile. Navigates to MusicIsland.",
            "category": "music"
        },
        {
            "name": "play_music_track",
            "function": play_music_track,
            "description": "Control music playback in MusicIsland. Can play specific tracks or playlists.",
            "category": "music"
        },
        {
            "name": "navigate_to_section",
            "function": navigate_to_section,
            "description": "Navigate viewport to a specific section/island with smooth scrolling.",
            "category": "navigation"
        },
        {
            "name": "get_contact_info",
            "function": get_contact_info,
            "description": "Get contact information and social media links. Navigates to Contact section.",
            "category": "contact"
        },
        {
            "name": "send_contact_request",
            "function": send_contact_request,
            "description": "Send a contact request email directly from chatbot. Requires name, email, and message.",
            "category": "contact"
        }
    ]