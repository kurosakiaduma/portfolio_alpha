from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from dotenv import load_dotenv

# Import routers
from routers import skills, certifications, projects, music, blog, contact_messages, chatbot
from routers.health import router as health_router

load_dotenv()

def create_app() -> FastAPI:
	app = FastAPI(title="Portfolio Backend")

	# CORS
	origins = [os.getenv("PUBLIC_SITE_URL", "http://localhost:4321"), "http://localhost:4321"]
	allowed_origins = os.getenv("ALLOWED_ORIGINS")
	if allowed_origins:
		origins.extend([origin.strip() for origin in allowed_origins.split(",") if origin.strip()])
	origins = list(dict.fromkeys(origins))
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
	app.include_router(projects.router, prefix="/api")
	app.include_router(music.router, prefix="/api")
	app.include_router(blog.router, prefix="/api")
	app.include_router(contact_messages.router, prefix="/api")
	app.include_router(chatbot.router, prefix="/api")

	from routers.admin import router as admin_router
	app.include_router(admin_router, prefix="/api/admin")
	
	return app


app = create_app()


if __name__ == "__main__":
	import uvicorn

	uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
