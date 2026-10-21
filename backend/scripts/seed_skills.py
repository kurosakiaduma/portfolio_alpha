"""Seed sample skill documents into MongoDB."""
from dotenv import load_dotenv
from typing import List, Dict

from db.mongo import get_db

load_dotenv()

SKILLS: List[Dict] = [
    {
        "name": "Python",
        "icon": "python.svg",
        "category": "Backend",
        "description": "API development, automation, and data processing.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 1,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "FastAPI",
        "icon": "FastAPI.svg",
        "category": "Backend",
        "description": "High-performance Python APIs with async support.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 2,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "Docker",
        "icon": "Docker.svg",
        "category": "DevOps",
        "description": "Containerization and reproducible deployment workflows.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 3,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "Kubernetes",
        "icon": "Kubernetes.svg",
        "category": "DevOps",
        "description": "Cloud-native orchestration for containers and services.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 4,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "React",
        "icon": "react.svg",
        "category": "Frontend",
        "description": "Component-driven UI with modern web experience.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 5,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "TypeScript",
        "icon": "TypeScript.svg",
        "category": "Frontend",
        "description": "Type-safe frontend development and robust codebases.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 6,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "Tailwind CSS",
        "icon": "Tailwind CSS.svg",
        "category": "Frontend",
        "description": "Utility-first styling with responsive design control.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 7,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "AWS",
        "icon": "AWS.svg",
        "category": "Cloud",
        "description": "Cloud infrastructure, serverless, and managed services.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 8,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "GitHub",
        "icon": "GitHub.svg",
        "category": "DevOps",
        "description": "Source control, CI orchestration, and repository workflows.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 9,
        "icon_type": "brand",
        "skill_type": "skill",
    },
    {
        "name": "Astro",
        "icon": "Astro.svg",
        "category": "Frontend",
        "description": "Static site generation with island architecture.",
        "grid_size": "1x1",
        "is_academic": False,
        "display_order": 10,
        "icon_type": "brand",
        "skill_type": "skill",
    },
]


async def seed_skills() -> None:
    db = get_db()
    print("Seeding skills into MongoDB...")
    await db.skills.delete_many({})
    result = await db.skills.insert_many(SKILLS)
    print(f"Inserted {len(result.inserted_ids)} skill documents.")


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed_skills())
