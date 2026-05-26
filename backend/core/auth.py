"""
JWT authentication utilities for admin routes.
Handles token generation, validation, and admin user verification via MongoDB.
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

import bcrypt
import jwt

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str, name: str = "Admin") -> str:
    """Create a JWT access token for an admin user."""
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "is_admin": True,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    logger.info("Generated access token for user: %s", email)
    return token


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify a JWT token and return its payload, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        logger.debug("Token verified for user: %s", payload.get("email"))
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as exc:
        logger.warning("Invalid token: %s", exc)
        return None


async def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate an admin user against the MongoDB admin_users collection.

    Returns a user dict on success, None on failure.
    """
    from db.mongo import get_admin_user_by_email  # local import to avoid circular deps

    doc = await get_admin_user_by_email(email)
    if not doc:
        logger.warning("No admin user found for email: %s", email)
        return None

    if not verify_password(password, doc.get("password_hash", "")):
        logger.warning("Password mismatch for email: %s", email)
        return None

    logger.info("Admin user authenticated: %s", email)
    return {
        "id": str(doc["_id"]),
        "email": doc["email"],
        "name": doc.get("name", "Admin"),
        "is_admin": True,
    }
