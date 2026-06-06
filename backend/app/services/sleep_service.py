# ===== 수면 기록 서비스 =====
# 아이의 수면 기록(잠든 시각, 깨어난 시각, 수면 품질) 조회, 추가, 수정, 삭제 로직을 처리합니다.

from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.sleep_record import SleepRecord
from app.schemas.sleep_record import SleepRecordCreate, SleepRecordUpdate


async def get_list(
    db: AsyncSession,
    child_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[SleepRecord]:
    """특정 아이의 수면 기록을 최신순(잠든 시각 내림차순)으로 반환합니다.

    skip/limit으로 페이지네이션하며, start_date/end_date로 기간 필터링이 가능합니다.
    """
    query = (
        select(SleepRecord)
        .where(SleepRecord.child_id == child_id)
        .order_by(SleepRecord.sleep_at.desc())  # 가장 최근 수면이 먼저
    )
    if start_date is not None:
        query = query.where(func.date(SleepRecord.sleep_at) >= start_date)
    if end_date is not None:
        query = query.where(func.date(SleepRecord.sleep_at) <= end_date)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: SleepRecordCreate) -> SleepRecord:
    """새 수면 기록을 저장합니다."""
    record = SleepRecord(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: SleepRecordUpdate) -> SleepRecord:
    """기존 수면 기록을 수정합니다.

    예: 잠들 때 기록했다가 깨어난 후 wake_at 필드만 추가 수정하는 경우에 사용
    """
    result = await db.execute(
        select(SleepRecord).where(SleepRecord.id == record_id, SleepRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sleep record not found")

    # 요청에서 전달된 필드만 업데이트 (나머지는 그대로 유지)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    """수면 기록을 삭제합니다."""
    result = await db.execute(
        select(SleepRecord).where(SleepRecord.id == record_id, SleepRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sleep record not found")

    await db.delete(record)
    await db.commit()
