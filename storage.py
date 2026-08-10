import os
import uuid
import boto3
from botocore.client import Config

# Set these as environment variables — never hardcode credentials in code.
# AWS_ACCESS_KEY / AWS_SECRET_KEY come from an IAM user with S3 permissions
# (create one in the AWS console under IAM > Users > Security credentials).
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY")
S3_BUCKET = os.environ.get("S3_BUCKET")
S3_REGION = os.environ.get("S3_REGION", "us-east-2")  # Ohio — closest AWS region to Texas

_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    config=Config(signature_version="s3v4"),
    region_name=S3_REGION,
)


def upload_photo(file_bytes: bytes, filename: str, content_type: str) -> str:
    """Uploads a photo's bytes to the bucket and returns the storage key."""
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    key = f"appointment-photos/{uuid.uuid4()}.{ext}"

    _client.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return key


def get_photo_url(key: str, expires_in: int = 3600) -> str:
    """Generates a temporary signed URL so the dashboard can display the photo."""
    return _client.generate_presigned_url(
        "get_object",
        Params={"Bucket": S3_BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )