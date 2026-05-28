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

DIARY_UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads" / "diaries"


async def get_all(db: AsyncSession, user_id: int) -> list[Child]:
    result = await db.execute(
        select(Child).where(Child.user_id == user_id).order_by(Child.created_at.desc())
    )
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, child_id: int, user_id: int) -> Child:
    result = await db.execute(
        select(Child).where(Child.id == child_id, Child.user_id == user_id)
    )
    child = result.scalar_one_or_none()
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    return child


async def create(db: AsyncSession, user_id: int, data: ChildCreate) -> Child:
    child = Child(user_id=user_id, **data.model_dump())
    db.add(child)
    await db.commit()
    await db.refresh(child)
    return child


async def update(db: AsyncSession, child_id: int, user_id: int, data: ChildUpdate) -> Child:
    child = await get_by_id(db, child_id, user_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(child, key, value)
    await db.commit()
    await db.refresh(child)
    return child


async def delete_child(db: AsyncSession, child_id: int, user_id: int) -> None:
    child = await get_by_id(db, child_id, user_id)

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

    for model in [FeedRecord, SleepRecord, GrowthRecord, VaccineSchedule, DiaryEntry]:
        await db.execute(delete(model).where(model.child_id == child_id))

    await db.delete(child)
    await db.commit()
