# ===== 이미지 업로드 API =====
# 일기에 첨부할 이미지를 업로드하는 API입니다.
# 업로드된 이미지는 Cloudinary(클라우드 이미지 서비스)에 저장됩니다.
#
# [업로드 흐름]
# 1. 클라이언트가 이미지 파일을 이 API로 업로드
# 2. 서버가 이미지를 JPEG로 변환 + 크기 축소 (용량 절약)
# 3. Cloudinary에 업로드 후 이미지 URL 반환
# 4. 클라이언트가 받은 URL을 일기 작성/수정 API에 전달하여 저장

import asyncio     # 동기 블로킹 호출을 별도 스레드에서 실행하기 위해 사용
import io          # 메모리에서 파일처럼 다루는 도구
from uuid import uuid4  # 고유한 파일명 생성용 (UUID = 전 세계에서 유일한 ID)

import cloudinary
import cloudinary.uploader  # Cloudinary 업로드 SDK
from fastapi import APIRouter, UploadFile, File, HTTPException
# UploadFile: 업로드된 파일 / File(...): 필수 파일 파라미터

from PIL import Image  # Pillow: 이미지 처리 라이브러리 (리사이즈, 변환 등)

from app.core.config import settings  # Cloudinary 설정값

router = APIRouter()

# Cloudinary 서비스 초기화 (설정값으로 연결)
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,  # 클라우드 이름
    api_key=settings.CLOUDINARY_API_KEY,         # API 키
    api_secret=settings.CLOUDINARY_API_SECRET,   # API 비밀키
)

# 업로드 허용 파일 형식
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE_MB = 20       # 최대 파일 크기: 20MB
MAX_DIMENSION = 1200   # 이미지 장변 최대 크기: 1200px
JPEG_QUALITY = 92      # JPEG 압축 품질 (0~100, 높을수록 화질 좋지만 용량 큼)


def compress_to_jpeg(content: bytes) -> bytes:
    """이미지를 JPEG 형식으로 변환하고 장변 1200px 이하로 리사이즈합니다.

    - RGBA(투명도 있는 PNG) → 흰 배경 위에 합성 후 RGB로 변환
    - 팔레트 모드(P, GIF 등) → RGBA 변환 후 흰 배경 합성
    - 그 외 → RGB로 변환
    - 이미지가 1200px보다 크면 비율 유지하며 축소
    """
    img = Image.open(io.BytesIO(content))  # 바이트 데이터를 이미지 객체로 열기

    # 투명도가 있는 이미지(RGBA, LA 모드)를 흰 배경으로 합성
    if img.mode in ("RGBA", "LA"):
        background = Image.new("RGB", img.size, (255, 255, 255))  # 흰 배경 이미지 생성
        background.paste(img, mask=img.split()[-1])  # 알파 채널을 마스크로 사용해 합성
        img = background
    # 팔레트 모드(GIF 등)도 RGBA로 변환 후 흰 배경 합성
    elif img.mode == "P":
        img = img.convert("RGBA")
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[-1])
        img = background
    # 그 외 RGB가 아닌 모드는 RGB로 변환
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # 이미지가 최대 크기보다 크면 비율 유지하며 축소
    w, h = img.size
    if w > MAX_DIMENSION or h > MAX_DIMENSION:
        img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.LANCZOS)  # LANCZOS: 고품질 리사이즈 알고리즘

    # 결과를 JPEG로 압축하여 바이트로 반환
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    return output.getvalue()


# POST /api/v1/upload/diary-image — 일기 이미지 업로드
@router.post("/upload/diary-image")
async def upload_diary_image(file: UploadFile = File(...)):
    """이미지 파일을 받아서 압축 후 Cloudinary에 업로드합니다.

    응답 예시:
    {
        "url": "https://res.cloudinary.com/.../image.jpg",  ← 저장된 이미지 URL
        "original_kb": 1024,  ← 원본 파일 크기 (KB)
        "saved_kb": 256       ← 압축 후 파일 크기 (KB)
    }
    """
    # 허용된 파일 형식인지 확인
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="JPG, PNG, GIF, WEBP 파일만 업로드 가능합니다")

    # 파일 내용을 메모리에 읽기
    content = await file.read()
    # 파일 크기 제한 확인 (20MB)
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"파일 크기는 {MAX_SIZE_MB}MB 이하여야 합니다")

    # 이미지 압축 및 JPEG 변환
    # PIL 처리는 CPU 집약적인 동기 작업이므로 별도 스레드에서 실행 (이벤트 루프 차단 방지)
    try:
        compressed = await asyncio.to_thread(compress_to_jpeg, content)
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 처리에 실패했습니다. 올바른 이미지 파일인지 확인해 주세요")

    # Cloudinary에 업로드할 파일 경로/이름 설정 (UUID로 유일한 이름 생성)
    public_id = f"babycare/diaries/{uuid4()}"
    # Cloudinary 업로드는 동기 블로킹 네트워크 호출이므로 별도 스레드에서 실행 (이벤트 루프 차단 방지)
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            compressed,
            public_id=public_id,      # Cloudinary 내에서의 파일 경로 및 이름
            resource_type="image",    # 파일 타입: 이미지
            format="jpg",             # 저장 형식: jpg
        )
    except Exception:
        raise HTTPException(status_code=500, detail="이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요")

    # 용량 절감 정보 계산
    original_kb = len(content) // 1024    # 원본 크기 (KB)
    saved_kb = len(compressed) // 1024    # 압축 후 크기 (KB)

    return {
        "url": result["secure_url"],  # HTTPS 이미지 URL (일기 저장 시 이 URL을 사용)
        "original_kb": original_kb,
        "saved_kb": saved_kb,
    }
