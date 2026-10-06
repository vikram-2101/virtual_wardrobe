import logging
import boto3
from botocore.client import Config
from app.core.config import settings

logger = logging.getLogger("ai-service.storage")


def get_s3_client():
    """Initializes and returns a boto3 S3 client configured for MinIO / AWS S3."""
    return boto3.client(
        "s3",
        endpoint_url=settings.MINIO_ENDPOINT,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        region_name=settings.MINIO_REGION,
        config=Config(signature_version="s3v4"),
    )


def upload_bytes(data: bytes, key: str, content_type: str = "image/jpeg") -> str:
    """Uploads binary data to S3 / MinIO storage bucket."""
    client = get_s3_client()
    client.put_object(
        Bucket=settings.MINIO_BUCKET_NAME,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    logger.info(f"Uploaded {len(data)} bytes to s3://{settings.MINIO_BUCKET_NAME}/{key}")
    return key


def get_object_url(key: str) -> str:
    """Generates accessible URL for the S3 object key."""
    endpoint = settings.MINIO_ENDPOINT.rstrip("/")
    bucket = settings.MINIO_BUCKET_NAME
    clean_key = key.lstrip("/")
    return f"{endpoint}/{bucket}/{clean_key}"

