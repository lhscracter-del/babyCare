# ===== 예방접종 일정 서비스 =====
# 아이의 예방접종 일정 조회, 추가, 수정(완료 처리 포함), 삭제 로직을 처리합니다.

from datetime import date
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status

from app.models.vaccine_schedule import VaccineSchedule
from app.schemas.vaccine_schedule import VaccineScheduleCreate, VaccineScheduleUpdate


async def get_list(
    db: AsyncSession,
    child_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[VaccineSchedule]:
    """특정 아이의 예방접종 일정을 예정일 오름차순으로 반환합니다.

    오름차순 정렬: 가장 먼저 맞아야 하는 접종이 목록 맨 위에 표시됨
    skip/limit으로 페이지네이션하며, start_date/end_date로 기간 필터링이 가능합니다.
    """
    query = (
        select(VaccineSchedule)
        .where(VaccineSchedule.child_id == child_id)
        .order_by(VaccineSchedule.scheduled_at)  # 예정일 오름차순 (가장 빠른 날짜 먼저)
    )
    if start_date is not None:
        query = query.where(func.date(VaccineSchedule.scheduled_at) >= start_date)
    if end_date is not None:
        query = query.where(func.date(VaccineSchedule.scheduled_at) <= end_date)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def create(db: AsyncSession, child_id: int, data: VaccineScheduleCreate) -> VaccineSchedule:
    """새 예방접종 일정을 등록합니다."""
    record = VaccineSchedule(child_id=child_id, **data.model_dump())
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update(db: AsyncSession, child_id: int, record_id: int, data: VaccineScheduleUpdate) -> VaccineSchedule:
    """예방접종 일정을 수정합니다.

    주로 is_completed=True, completed_at=날짜 를 업데이트하여 "접종 완료" 처리에 사용됩니다.
    """
    result = await db.execute(
        select(VaccineSchedule).where(
            VaccineSchedule.id == record_id,
            VaccineSchedule.child_id == child_id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vaccine schedule not found")

    # 요청에서 전달된 필드만 업데이트 (나머지는 그대로 유지)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete(db: AsyncSession, child_id: int, record_id: int) -> None:
    """예방접종 일정을 삭제합니다."""
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
