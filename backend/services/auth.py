import os
import urllib.parse
from typing import Optional, Dict, Any

from fastapi import Header, HTTPException

from core.auth import verify_token

# ADMIN_TOKEN may be stored URL-encoded in Key Vault; decode it here so
# comparisons succeed whether the secret was encoded prior to storage.
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")
if ADMIN_TOKEN:
    ADMIN_TOKEN = urllib.parse.unquote(ADMIN_TOKEN)


def _admin_token_auth(token: str) -> Dict[str, Any]:
    # Decode incoming token header before comparison to tolerate URI-encoded values
    token_decoded = urllib.parse.unquote(token)
    if ADMIN_TOKEN and token_decoded == ADMIN_TOKEN:
        return {"id": "admin-token", "email": "internal@portfolio", "name": "Admin", "is_admin": True}
    raise HTTPException(status_code=401, detail="Invalid admin token")


async def verify_admin_token(
    authorization: Optional[str] = Header(None),
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token"),
) -> Dict[str, Any]:
    """Verify an admin JWT bearer token or an internal admin token header."""
    if x_admin_token:
        return _admin_token_auth(x_admin_token)

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    payload = verify_token(parts[1])
    if not payload or not payload.get("is_admin"):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {
        "id": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("name"),
        "is_admin": payload.get("is_admin", False),
    }
