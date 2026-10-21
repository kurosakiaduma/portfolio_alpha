"""
Seed script to create or update the initial admin user in MongoDB.

Usage:
    python scripts/seed_admin.py --email admin@example.com --password <secret>

The script hashes the password with bcrypt and upserts the document into
the `admin_users` collection. Safe to run multiple times — it will update
the existing record rather than create a duplicate.
"""

import argparse
import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

# Allow running from the backend/ directory or the project root
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

from core.auth import hash_password
from db.mongo import insert_admin_user


async def seed(email: str, password: str, name: str) -> None:
    password_hash = hash_password(password)
    doc = {
        "email": email,
        "password_hash": password_hash,
        "name": name,
        "created_at": datetime.utcnow(),
    }
    admin_id = await insert_admin_user(doc)
    print(f"Admin user upserted — id: {admin_id}, email: {email}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the initial admin user into MongoDB.")
    parser.add_argument("--email", required=True, help="Admin email address")
    parser.add_argument("--password", required=True, help="Admin plaintext password (will be hashed)")
    parser.add_argument("--name", default="Admin", help="Admin display name (default: Admin)")
    args = parser.parse_args()

    asyncio.run(seed(args.email, args.password, args.name))


if __name__ == "__main__":
    main()
