import redis
import boto3
from botocore.client import Config
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    health_status = {
        "status": "UP",
        "service": "ai-service",
        "version": settings.VERSION,
        "dependencies": {
            "redis": "UNKNOWN",
            "storage": "UNKNOWN"
        }
    }

    # Check Redis connectivity
    try:
        r = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            socket_connect_timeout=2
        )
        if r.ping():
            health_status["dependencies"]["redis"] = "UP"
        else:
            health_status["dependencies"]["redis"] = "DOWN"
            health_status["status"] = "DEGRADED"
    except Exception as e:
        health_status["dependencies"]["redis"] = f"DOWN ({str(e)})"
        health_status["status"] = "DEGRADED"

    # Check S3 / MinIO connectivity
    try:
        s3 = boto3.client(
            "s3",
            endpoint_url=settings.MINIO_ENDPOINT,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            region_name=settings.MINIO_REGION,
            config=Config(signature_version="s3v4", connect_timeout=2, read_timeout=2)
        )
        s3.list_buckets()
        health_status["dependencies"]["storage"] = "UP"
    except Exception as e:
        health_status["dependencies"]["storage"] = f"DOWN ({str(e)})"
        health_status["status"] = "DEGRADED"

    return health_status


@router.get("/ping")
def ping():
    return {"ping": "pong", "service": "ai-service"}

