"""Seed runner for backend mock data.

Usage:
  python backend/scripts/seed.py skills
  python backend/scripts/seed.py certifications
  python backend/scripts/seed.py all
"""
import sys
import asyncio

from scripts.seed_skills import seed_skills
from scripts.seed_certifications import seed_certifications


async def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python backend/scripts/seed.py [skills|certifications|all]")
        sys.exit(1)

    command = sys.argv[1].lower()
    if command == "skills":
        await seed_skills()
    elif command == "certifications":
        await seed_certifications()
    elif command == "all":
        await seed_skills()
        await seed_certifications()
    else:
        print("Unknown command. Use 'skills', 'certifications', or 'all'.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
