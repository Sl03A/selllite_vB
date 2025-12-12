
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routes import auth_routes, user_routes, project_routes, billing_routes
import asyncio

app = FastAPI(title="Futuristic SaaS - Complete")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(project_routes.router)
app.include_router(billing_routes.router)

@app.get("/health")
async def health():
    return {"status":"ok"}

@app.on_event("startup")
async def startup():
    # create tables if not existing (simple approach; use alembic in prod)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
