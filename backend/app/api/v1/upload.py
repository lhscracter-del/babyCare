import io
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image

from app.core.config import settings

router = APIRouter()

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE_MB = 20
MAX_DIMENSION = 1200
JPEG_QUALITY = 92


def compress_to_jpeg(content: bytes) -> bytes:
    """모든 이미지를 JPEG로 변환하고 장변 1200px 이하로 리사이즈한다."""
    img = Image.open(io.BytesIO(content))

    if img.mode in ("RGBA", "LA"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    elif img.mode == "P":
        img = img.convert("RGBA")
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    w, h = img.size
    if w > MAX_DIMENSION or h > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)

    output = io.BytesIO()
    img.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return output.getvalue()


@router.post("/upload/diary-image")
async def upload_diary_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"파일 크기는 {MAX_SIZE_MB}MB 이하여야 합니다")

    try:
        compressed = compress_to_jpeg(content)
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 처리에 실패했습니다. 올바른 이미지 파일인지 확인해 주세요")

    public_id = f"babycare/diaries/{uuid4()}"
    try:
        result = cloudinary.uploader.upload(
            compressed,
            public_id=public_id,
            resource_type="image",
            format="jpg",
        )
    except Exception:
        raise HTTPException(status_code=500, detail="이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요")

    original_kb = len(content) // 1024
    saved_kb = len(compressed) // 1024

    return {
        "url": result["secure_url"],
        "original_kb": original_kb,
        "saved_kb": saved_kb,
    }
