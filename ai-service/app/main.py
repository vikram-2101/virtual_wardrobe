from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, metadata, tryon
from app.worker.consumer import start_worker, stop_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background Redis queue worker
    worker_thread = start_worker()
    yield
    # Shutdown: Stop worker cleanly
    stop_worker()
    worker_thread.join(timeout=3)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(metadata.router, prefix=settings.API_V1_STR, tags=["Metadata"])
app.include_router(tryon.router, prefix=settings.API_V1_STR, tags=["Try-On"])


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": f"{settings.API_V1_STR}/docs",
    }
