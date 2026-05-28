from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from fastapi import HTTPException, status

from app.models.child import Child
from app.models.feed_record import FeedRecord
from app.models.sleep_record import SleepRecord
from app.models.growth_record import GrowthRecord
from app.models.vaccine_schedule import VaccineSchedule
from app.models.diary_entry import DiaryEntry
from app.schemas.child import ChildCreate, ChildUpdate

# 일기 이미지가 저장되는 디렉토리
DIARY_UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads" / "diaries"


async def get_all(db: AsyncSession) -> list[Child]:
    result = await db.execute(select(Child).order_by(Child.created_at.desc()))
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, child_id: int) -> Child:
    result = await db.execute(select(Child).where(Child.id == child_id))
    child = result.scalar_one_or_none()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    return child


async def create(db: AsyncSession, data: ChildCreate) -> Child:
    child = Child(**data.model_dump())
    db.add(child)
    await db.commit()
    await db.refresh(child)
    return child


async def update(db: AsyncSession, child_id: int, data: ChildUpdate) -> Child:
    child = await get_by_id(db, child_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(child, key, value)
    await db.commit()
    await db.refresh(child)
    return child


async def delete_child(db: AsyncSession, child_id: int) -> None:
    child = await get_by_id(db, child_id)

    # 일기에 첨부된 이미지 파일 먼저 삭제 (크롭본 + 원본)
    result = await db.execute(
        select(DiaryEntry.image_path, DiaryEntry.original_image_path).where(
            DiaryEntry.child_id == child_id,
        )
    )
    for (image_path, original_image_path) in result.fetchall():
        for path in (image_path, original_image_path):
            if not path:
                continue
            filename = path.rsplit("/", 1)[-1]
            file_path = DIARY_UPLOAD_DIR / filename
            if file_path.exists():
                file_path.unlink()

    # 관련 DB 기록 전체 삭제
    for model in [FeedRecord, SleepRecord, GrowthRecord, VaccineSchedule, DiaryEntry]:
        await db.execute(delete(model).where(model.child_id == child_id))

    await db.delete(child)
    await db.commit()
