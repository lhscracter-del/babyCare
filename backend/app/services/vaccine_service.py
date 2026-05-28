from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.vaccine_schedule import VaccineSchedule
from app.schemas.vaccine_schedule import VaccineScheduleCreate, VaccineScheduleUpdate


async def get_list(db: AsyncSession, child_id: int) -> list[VaccineSchedule]:
    result = await db.execute(
        select(VaccineSchedule)
        .where(VaccineSchedule.child_id == child_id)
        .order_by(VaccineSchedule.scheduled_at)
    )
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: VaccineScheduleCreate) -> VaccineSchedule:
    record = VaccineSchedule(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: VaccineScheduleUpdate) -> VaccineSchedule:
    result = await db.execute(
        select(VaccineSchedule).where(
            VaccineSchedule.id == record_id,
            VaccineSchedule.child_id == child_id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccine schedule not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    result = await db.execute(
        select(VaccineSchedule).where(
            VaccineSchedule.id == record_id,
            VaccineSchedule.child_id == child_id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccine schedule not found")

    await db.delete(record)
    await db.commit()
