from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.feed_record import FeedRecord
from app.schemas.feed_record import FeedRecordCreate, FeedRecordUpdate


async def get_list(db: AsyncSession, child_id: int) -> list[FeedRecord]:
    result = await db.execute(
        select(FeedRecord)
        .where(FeedRecord.child_id == child_id)
        .order_by(FeedRecord.fed_at.desc())
    )
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: FeedRecordCreate) -> FeedRecord:
    record = FeedRecord(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: FeedRecordUpdate) -> FeedRecord:
    result = await db.execute(
        select(FeedRecord).where(FeedRecord.id == record_id, FeedRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed record not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    result = await db.execute(
        select(FeedRecord).where(FeedRecord.id == record_id, FeedRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed record not found")

    await db.delete(record)
    await db.commit()
