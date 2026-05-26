from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import routers
from routers import skills, certifications
from routers.health import router as health_router


def create_app() -> FastAPI:
	app = FastAPI(title="Portfolio Backend")

	# CORS
	origins = [os.getenv("PUBLIC_SITE_URL", "http://localhost:4321"), "http://localhost:4321"]
	app.add_middleware(
		CORSMiddleware,
		allow_origins=origins,
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	# Include routers
	app.include_router(skills.router, prefix="/api")
	app.include_router(certifications.router, prefix="/api")
	app.include_router(health_router, prefix="/api")
	from routers.admin import router as admin_router
	app.include_router(admin_router, prefix="/api/admin")
	from routers.projects import router as projects_router
	app.include_router(projects_router, prefix="/api")
	from routers.music import router as music_router
	app.include_router(music_router, prefix="/api")
	from routers.blog import router as blog_router
	app.include_router(blog_router, prefix="/api")

	return app


app = create_app()


if __name__ == "__main__":
	import uvicorn

	uvicorn.run("backend.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
