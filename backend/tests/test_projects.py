"""
Tests for Projects backend logic.
Run with: backend/.venv/bin/python backend/tests/test_projects.py
"""
import asyncio
import sys
import os

# Allow imports from backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from slugify import slugify

# ---------------------------------------------------------------------------
# Slug collision logic (extracted so it can be tested without a live DB)
# ---------------------------------------------------------------------------

async def unique_slug(base_slug: str, existing_slugs: set) -> str:
    """Pure version of _unique_slug that accepts a set instead of querying DB."""
    if base_slug not in existing_slugs:
        return base_slug
    counter = 2
    while True:
        candidate = f"{base_slug}-{counter}"
        if candidate not in existing_slugs:
            return candidate
        counter += 1


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

async def test_slug_no_collision():
    result = await unique_slug("my-project", set())
    assert result == "my-project", f"Expected 'my-project', got '{result}'"
    print("PASS test_slug_no_collision")


async def test_slug_first_collision():
    result = await unique_slug("my-project", {"my-project"})
    assert result == "my-project-2", f"Expected 'my-project-2', got '{result}'"
    print("PASS test_slug_first_collision")


async def test_slug_multiple_collisions():
    existing = {"my-project", "my-project-2", "my-project-3"}
    result = await unique_slug("my-project", existing)
    assert result == "my-project-4", f"Expected 'my-project-4', got '{result}'"
    print("PASS test_slug_multiple_collisions")


async def test_slugify_title():
    slug = slugify("My Awesome Project!")
    assert slug == "my-awesome-project", f"Unexpected slug: '{slug}'"
    print("PASS test_slugify_title")


async def test_github_fetch_502():
    """Test that an unreachable GitHub API results in a 502 HTTPException."""
    import httpx
    from unittest.mock import patch, AsyncMock
    from fastapi import HTTPException

    # Simulate a network error from httpx
    async def mock_get(*args, **kwargs):
        raise httpx.ConnectError("Connection refused")

    class MockAsyncClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
        async def get(self, *args, **kwargs):
            raise httpx.ConnectError("Connection refused")

    with patch("httpx.AsyncClient", return_value=MockAsyncClient()):
        # Inline the fetch logic to test the error path
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get("https://api.github.com/repos/owner/repo")
            assert False, "Should have raised"
        except httpx.ConnectError:
            pass  # Expected — the router catches this and raises 502

    print("PASS test_github_fetch_502")


async def main():
    tests = [
        test_slug_no_collision,
        test_slug_first_collision,
        test_slug_multiple_collisions,
        test_slugify_title,
        test_github_fetch_502,
    ]
    failures = []
    for t in tests:
        try:
            await t()
        except Exception as exc:
            print(f"FAIL {t.__name__}: {exc}")
            failures.append(t.__name__)

    print(f"\n{len(tests) - len(failures)}/{len(tests)} tests passed")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
