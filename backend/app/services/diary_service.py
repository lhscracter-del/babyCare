import re
from pathlib import Path

import cloudinary.uploader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.diary_entry import DiaryEntry
from app.schemas.diary_entry import DiaryEntryCreate, DiaryEntryUpdate

DIARY_UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads" / "diaries"


def _delete_image_file(image_path: str | None) -> None:
    if not image_path:
        return
    if "cloudinary.com" in image_path:
        try:
            # URL에서 public_id 추출: .../upload/v숫자/babycare/diaries/uuid.jpg
            after_upload = image_path.split("/upload/", 1)[1]
            without_version = re.sub(r"^v\d+/", "", after_upload)
            public_id = without_version.rsplit(".", 1)[0]
            cloudinary.uploader.destroy(public_id)
        except Exception:
            pass
        return
    # 로컬 파일 (레거시 데이터 대응)
    filename = image_path.rsplit("/", 1)[-1]
    file_path = DIARY_UPLOAD_DIR / filename
    if file_path.exists():
        file_path.unlink()


def _delete_entry_images(record: DiaryEntry) -> None:
    _delete_image_file(record.image_path)
    _delete_image_file(record.original_image_path)


async def get_list(db: AsyncSession, child_id: int) -> list[DiaryEntry]:
    result = await db.execute(
        select(DiaryEntry)
        .where(DiaryEntry.child_id == child_id)
        .order_by(DiaryEntry.entry_date.desc())
    )
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: DiaryEntryCreate) -> DiaryEntry:
    record = DiaryEntry(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: DiaryEntryUpdate) -> DiaryEntry:
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.id == record_id, DiaryEntry.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")

    # 이미지가 교체·제거된 경우 기존 파일 삭제
    patch = data.model_dump(exclude_unset=True)
    new_image = patch.get("image_path", ...)
    if new_image is not ... and new_image != record.image_path:
        _delete_image_file(record.image_path)
    new_original = patch.get("original_image_path", ...)
    if new_original is not ... and new_original != record.original_image_path:
        _delete_image_file(record.original_image_path)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    result = await db.execute(
        select(DiaryEntry).where(DiaryEntry.id == record_id, DiaryEntry.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diary entry not found")

    _delete_entry_images(record)

    await db.delete(record)
    await db.commit()
