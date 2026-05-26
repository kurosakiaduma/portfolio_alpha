from fastapi import APIRouter
from db.mongo import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check():
    """Return service health and DB connectivity status."""
    db = get_db()
    try:
        # Motor exposes command via awaitable
        pong = await db.command({"ping": 1})
        db_ok = pong.get("ok", 0) == 1
    except Exception as exc:
        return {"status": "unhealthy", "db": False, "error": str(exc)}

    return {"status": "healthy", "db": bool(db_ok)}
