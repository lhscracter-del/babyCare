# ===== 육아 일기 서비스 =====
# 육아 일기 조회, 작성, 수정, 삭제 로직을 처리합니다.
# 일기에는 텍스트 + 이미지를 첨부할 수 있으며,
# 이미지는 Cloudinary(클라우드) 또는 로컬 파일로 저장됩니다.

import asyncio       # 동기 블로킹 호출을 별도 스레드에서 실행하기 위해 사용
import re           # 정규표현식 (URL에서 특정 패턴 추출에 사용)
from datetime import date
from pathlib import Path
from typing import Optional

import cloudinary.uploader           # Cloudinary 이미지 서비스 SDK
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.diary_entry import DiaryEntry
from app.schemas.diary_entry import DiaryEntryCreate, DiaryEntryUpdate

# 로컬 이미지 파일이 저장된 폴더 경로 (레거시 데이터 대응)
DIARY_UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads" / "diaries"


async def _delete_image_file(image_path: str | None) -> None:
    """이미지 파일을 삭제하는 내부 함수입니다.

    - Cloudinary URL인 경우: Cloudinary API로 삭제
    - 로컬 경로인 경우: 로컬 파일 시스템에서 삭제 (예전에 로컬에 저장한 이미지 대응)

    Cloudinary destroy()는 동기 블로킹 호출이므로 asyncio.to_thread로 별도 스레드에서
    실행하여 이벤트 루프를 차단하지 않습니다.
    """
    if not image_path:
        return  # 이미지 경로가 없으면 아무것도 하지 않음

    if "cloudinary.com" in image_path:
        try:
            # Cloudinary URL에서 public_id(파일 식별자) 추출
            # URL 형태: .../upload/v숫자/babycare/diaries/uuid.jpg
            after_upload = image_path.split("/upload/", 1)[1]       # "upload/" 이후 문자열
            without_version = re.sub(r"^v\d+/", "", after_upload)   # 버전 번호 제거 (v123456/)
            public_id = without_version.rsplit(".", 1)[0]            # 확장자 제거
            # 동기 SDK 호출을 별도 스레드에서 실행 (이벤트 루프 차단 방지)
            await asyncio.to_thread(cloudinary.uploader.destroy, public_id)
        except Exception:
            pass  # 삭제 실패해도 무시 (이미 삭제됐을 수 있음)
        return

    # 로컬 파일 (레거시 데이터 대응)
    filename = image_path.rsplit("/", 1)[-1]      # URL 또는 경로의 마지막 파일명 추출
    file_path = DIARY_UPLOAD_DIR / filename
    if file_path.exists():
        file_path.unlink()  # 파일 삭제


async def _delete_entry_images(record: DiaryEntry) -> None:
    """일기 항목에 연결된 이미지(크롭본 + 원본)를 모두 삭제합니다."""
    await _delete_image_file(record.image_path)           # 크롭된 이미지 삭제
    await _delete_image_file(record.original_image_path)  # 원본 이미지 삭제


async def get_list(
    db: AsyncSession,
    child_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[DiaryEntry]:
    """특정 아이의 육아 일기 목록을 최신 날짜순으로 반환합니다.

    skip/limit으로 페이지네이션하며, start_date/end_date로 기간 필터링이 가능합니다.
    """
    query = (
        select(DiaryEntry)
        .where(DiaryEntry.child_id == child_id)
        .order_by(DiaryEntry.entry_date.desc())  # 가장 최근 날짜의 일기가 먼저
    )
    if start_date is not None:
        query = query.where(DiaryEntry.entry_date >= start_date)
    if end_date is not None:
        query = query.where(DiaryEntry.entry_date <= end_date)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: DiaryEntryCreate) -> DiaryEntry:
    """새 육아 일기를 저장합니다."""
    record = DiaryEntry(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: DiaryEntryUpdate) -> DiaryEntry:
    """기존 육아 일기를 수정합니다.

    이미지가 교체되거나 제거된 경우, 기존 이미지 파일을 먼저 삭제한 후 업데이트합니다.
    (파일이 클라우드에 남아서 비용이 발생하지 않도록)
    """
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.id == record_id, DiaryEntry.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")

    # 이미지가 교체·제거된 경우 기존 파일 삭제
    patch = data.model_dump(exclude_unset=True)  # 수정된 필드만 가져오기
    new_image = patch.get("image_path", ...)     # ... (Ellipsis) = "이 키가 없음"을 의미
    # 요청에 image_path가 있고, 기존 값과 다른 경우에만 기존 이미지 삭제
    if new_image is not ... and new_image != record.image_path:
        await _delete_image_file(record.image_path)
    new_original = patch.get("original_image_path", ...)
    if new_original is not ... and new_original != record.original_image_path:
        await _delete_image_file(record.original_image_path)

    # 실제 DB 필드 업데이트
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    """육아 일기를 삭제합니다. 첨부된 이미지 파일도 함께 삭제합니다."""
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.id == record_id, DiaryEntry.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")

    await _delete_entry_images(record)  # 이미지 파일 먼저 삭제

    await db.delete(record)
    await db.commit()
