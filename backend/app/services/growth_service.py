# ===== 성장 기록 서비스 =====
# 아이의 성장 기록(키, 몸무게, 머리 둘레) 조회, 추가, 수정, 삭제 로직을 처리합니다.

from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.growth_record import GrowthRecord
from app.schemas.growth_record import GrowthRecordCreate, GrowthRecordUpdate


async def get_list(
    db: AsyncSession,
    child_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[GrowthRecord]:
    """특정 아이의 성장 기록을 최신 측정일순으로 반환합니다.

    skip/limit으로 페이지네이션하며, start_date/end_date로 기간 필터링이 가능합니다.
    """
    query = (
        select(GrowthRecord)
        .where(GrowthRecord.child_id == child_id)
        .order_by(GrowthRecord.measured_at.desc())  # 가장 최근 측정 기록이 먼저
    )
    if start_date is not None:
        query = query.where(func.date(GrowthRecord.measured_at) >= start_date)
    if end_date is not None:
        query = query.where(func.date(GrowthRecord.measured_at) <= end_date)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: GrowthRecordCreate) -> GrowthRecord:
    """새 성장 기록을 저장합니다."""
    record = GrowthRecord(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: GrowthRecordUpdate) -> GrowthRecord:
    """기존 성장 기록을 수정합니다."""
    result = await db.execute(
        select(GrowthRecord).where(GrowthRecord.id == record_id, GrowthRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Growth record not found")

    # 요청에서 전달된 필드만 업데이트 (나머지는 그대로 유지)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    """성장 기록을 삭제합니다."""
    result = await db.execute(
        select(GrowthRecord).where(GrowthRecord.id == record_id, GrowthRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Growth record not found")

    await db.delete(record)
    await db.commit()
