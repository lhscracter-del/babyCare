# ===== 수유 기록 서비스 =====
# 수유/식사 기록의 조회, 추가, 수정, 삭제 로직을 처리합니다.

from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.feed_record import FeedRecord
from app.schemas.feed_record import FeedRecordCreate, FeedRecordUpdate


async def get_list(
    db: AsyncSession,
    child_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[FeedRecord]:
    """특정 아이의 수유 기록을 최신순(먹인 시각 내림차순)으로 반환합니다.

    skip/limit으로 페이지네이션하며, start_date/end_date로 기간 필터링이 가능합니다.
    """
    query = (
        select(FeedRecord)
        .where(FeedRecord.child_id == child_id)
        .order_by(FeedRecord.fed_at.desc())  # 가장 최근 수유 기록이 먼저
    )
    if start_date is not None:
        query = query.where(func.date(FeedRecord.fed_at) >= start_date)
    if end_date is not None:
        query = query.where(func.date(FeedRecord.fed_at) <= end_date)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: FeedRecordCreate) -> FeedRecord:
    """새 수유 기록을 저장합니다."""
    record = FeedRecord(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: FeedRecordUpdate) -> FeedRecord:
    """기존 수유 기록을 수정합니다.

    child_id와 record_id 둘 다 일치해야 수정 가능 (다른 아이의 기록은 수정 불가)
    """
    result = await db.execute(
        select(FeedRecord).where(FeedRecord.id == record_id, FeedRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed record not found")

    # 요청에서 전달된 필드만 업데이트 (나머지는 그대로 유지)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    """수유 기록을 삭제합니다."""
    result = await db.execute(
        select(FeedRecord).where(FeedRecord.id == record_id, FeedRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed record not found")

    await db.delete(record)
    await db.commit()
