# ===== 기저귀 교체 기록 서비스 =====
# 기저귀 교체 기록의 조회, 추가, 삭제 로직을 처리합니다.
# (수정 기능은 없음 - 기저귀 기록은 단순 삭제 후 재입력 방식 사용)

from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.diaper_record import DiaperRecord
from app.schemas.diaper_record import DiaperRecordCreate


async def get_list(
    db: AsyncSession,
    child_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[DiaperRecord]:
    """특정 아이의 기저귀 교체 기록을 최신순으로 반환합니다.

    skip/limit으로 페이지네이션하며, start_date/end_date로 기간 필터링이 가능합니다.
    """
    query = (
        select(DiaperRecord)
        .where(DiaperRecord.child_id == child_id)
        .order_by(DiaperRecord.changed_at.desc())  # 가장 최근 교체 기록이 먼저
    )
    if start_date is not None:
        query = query.where(func.date(DiaperRecord.changed_at) >= start_date)
    if end_date is not None:
        query = query.where(func.date(DiaperRecord.changed_at) <= end_date)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: DiaperRecordCreate) -> DiaperRecord:
    """새 기저귀 교체 기록을 저장합니다."""
    record = DiaperRecord(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    """기저귀 교체 기록을 삭제합니다."""
    result = await db.execute(
        select(DiaperRecord).where(DiaperRecord.id == record_id, DiaperRecord.child_id == child_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diaper record not found")

    await db.delete(record)
    await db.commit()
