import io
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image

router = APIRouter()

UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads" / "diaries"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE_MB = 20          # 원본 파일 수신 상한 (너무 큰 파일 차단)
MAX_DIMENSION = 1200      # 리사이즈 기준 — 가장 긴 변을 이 픽셀로 축소
JPEG_QUALITY = 92         # JPEG 저장 품질 (0-100, 높을수록 고화질·큰 용량)


def compress_to_jpeg(content: bytes) -> bytes:
    """모든 이미지를 JPEG로 변환하고 장변 1200px 이하로 리사이즈한다."""
    img = Image.open(io.BytesIO(content))

    # RGBA / Palette 등 JPEG 미지원 모드 → RGB 변환 (투명 영역은 흰색으로)
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

    # 장변이 MAX_DIMENSION을 초과하면 비율 유지하며 축소
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

    # 압축 처리
    try:
        compressed = compress_to_jpeg(content)
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 처리에 실패했습니다. 올바른 이미지 파일인지 확인해 주세요")

    # 항상 .jpg로 저장
    filename = f"{uuid4()}.jpg"
    (UPLOAD_DIR / filename).write_bytes(compressed)

    original_kb = len(content) // 1024
    saved_kb = len(compressed) // 1024

    return {
        "filename": filename,
        "url": f"/api/uploads/diaries/{filename}",
        "original_kb": original_kb,
        "saved_kb": saved_kb,
    }
