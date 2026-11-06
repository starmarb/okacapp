"""Pillow-based decoding and re-encoding.

Storage lives in ``appointments/photos.py``; this module only turns an uploaded
image into bytes and dimensions.
"""

import io
from dataclasses import dataclass

from django.conf import settings
from PIL import Image, ImageOps, UnidentifiedImageError

CONTENT_TYPE = "image/webp"
THUMBNAIL_QUALITY = 70


@dataclass(frozen=True)
class ProcessedImage:
    full: bytes
    thumbnail: bytes
    width: int
    height: int
    content_type: str = CONTENT_TYPE


class UnsupportedImage(ValueError):
    """The upload is not a decodable image (or is too large to decode safely)."""


def process_upload(upload) -> ProcessedImage:
    upload.seek(0)

    try:
        image = Image.open(upload)
        if image.width * image.height > settings.PHOTO_MAX_IMAGE_PIXELS:
            raise UnsupportedImage("Image dimensions are too large")
        image.load()
    except UnsupportedImage:
        raise
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise UnsupportedImage("Unsupported or corrupt image") from exc

    # Apply EXIF orientation, then drop metadata (including GPS) by re-encoding.
    image = ImageOps.exif_transpose(image)
    image = _to_rgb(image)

    max_dim = settings.PHOTO_MAX_DIMENSION
    image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
    width, height = image.size

    full = _encode(image, settings.PHOTO_WEBP_QUALITY)

    thumb = image.copy()
    thumb_dim = settings.PHOTO_THUMBNAIL_DIMENSION
    thumb.thumbnail((thumb_dim, thumb_dim), Image.Resampling.LANCZOS)
    thumbnail = _encode(thumb, THUMBNAIL_QUALITY)

    return ProcessedImage(
        full=full,
        thumbnail=thumbnail,
        width=width,
        height=height,
    )


def _to_rgb(image: Image.Image) -> Image.Image:
    """Flatten transparency onto white so PNGs don't turn black on save."""
    if image.mode in ("RGBA", "LA") or (
        image.mode == "P" and "transparency" in image.info
    ):
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, (255, 255, 255))
        background.paste(rgba, mask=rgba.getchannel("A"))
        return background
    return image.convert("RGB")


def _encode(image: Image.Image, quality: int) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="WEBP", quality=quality, method=6)
    return buffer.getvalue()
