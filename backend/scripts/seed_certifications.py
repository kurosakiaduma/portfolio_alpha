"""Seed sample certification documents into MongoDB."""
from dotenv import load_dotenv
from typing import List, Dict

from db.mongo import get_db

load_dotenv()

CERTIFICATIONS: List[Dict] = [
    {
        "title": "AWS Certified Cloud Practitioner",
        "issuer": "Amazon Web Services",
        "year": 2025,
        "icon": "AWS.svg",
        "grid_size": "2x1",
        "is_academic": True,
        "display_order": 1,
        "icon_type": "brand",
        "skill_type": "certificate",
    },
    {
        "title": "Certified Kubernetes Application Developer",
        "issuer": "Cloud Native Computing Foundation",
        "year": 2024,
        "icon": "Kubernetes.svg",
        "grid_size": "2x1",
        "is_academic": True,
        "display_order": 2,
        "icon_type": "brand",
        "skill_type": "certificate",
    },
    {
        "title": "FastAPI Professional Developer",
        "issuer": "API Academy",
        "year": 2024,
        "icon": "FastAPI.svg",
        "grid_size": "2x1",
        "is_academic": True,
        "display_order": 3,
        "icon_type": "brand",
        "skill_type": "certificate",
    },
    {
        "title": "GitHub Actions Specialist",
        "issuer": "GitHub",
        "year": 2024,
        "icon": "GitHub Actions.svg",
        "grid_size": "2x1",
        "is_academic": True,
        "display_order": 4,
        "icon_type": "brand",
        "skill_type": "certificate",
    },
]


async def seed_certifications() -> None:
    db = get_db()
    print("Seeding certifications into MongoDB...")
    await db.certifications.delete_many({})
    result = await db.certifications.insert_many(CERTIFICATIONS)
    print(f"Inserted {len(result.inserted_ids)} certification documents.")


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed_certifications())
