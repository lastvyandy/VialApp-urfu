from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models.models  # noqa: F401 - Registra los modelos en Base.metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas automáticamente en SQLite al iniciar el contenedor
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0-mvp",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenido a VialApp MVP API (UrFU)"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}