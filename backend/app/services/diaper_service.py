from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.diaper_record import DiaperRecord
from app.schemas.diaper_record import DiaperRecordCreate


async def get_list(db: AsyncSession, child_id: int) -> list[DiaperRecord]:
    result = await db.execute(
        select(DiaperRecord)
        .where(DiaperRecord.child_id == child_id)
        .order_by(DiaperRecord.changed_at.desc())
    )
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: DiaperRecordCreate) -> DiaperRecord:
    record = DiaperRecord(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    result = await db.execute(
        select(DiaperRecord).where(DiaperRecord.id == record_id, DiaperRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diaper record not found")

    await db.delete(record)
    await db.commit()
