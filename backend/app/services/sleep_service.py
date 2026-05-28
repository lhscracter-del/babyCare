from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.sleep_record import SleepRecord
from app.schemas.sleep_record import SleepRecordCreate, SleepRecordUpdate


async def get_list(db: AsyncSession, child_id: int) -> list[SleepRecord]:
    result = await db.execute(
        select(SleepRecord)
        .where(SleepRecord.child_id == child_id)
        .order_by(SleepRecord.sleep_at.desc())
    )
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: SleepRecordCreate) -> SleepRecord:
    record = SleepRecord(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: SleepRecordUpdate) -> SleepRecord:
    result = await db.execute(
        select(SleepRecord).where(SleepRecord.id == record_id, SleepRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sleep record not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    result = await db.execute(
        select(SleepRecord).where(SleepRecord.id == record_id, SleepRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sleep record not found")

    await db.delete(record)
    await db.commit()
