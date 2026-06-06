# ===== 예방접종 일정 API 엔드포인트 =====
# URL 형태: /api/v1/children/{child_id}/vaccines/
# 예방접종 일정 추가, 조회, 완료 처리(수정), 삭제를 제공합니다.

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.vaccine_schedule import VaccineScheduleCreate, VaccineScheduleUpdate, VaccineScheduleResponse
from app.services import vaccine_service

router = APIRouter()


# GET /api/v1/children/{child_id}/vaccines/ — 예방접종 일정 목록 조회
@router.get("/", response_model=list[VaccineScheduleResponse])
async def list_vaccines(
    child_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """해당 아이의 예방접종 일정 목록을 예정일 오름차순으로 반환합니다. (페이지네이션·기간 필터 지원)"""
    return await vaccine_service.get_list(db, child_id, skip, limit, start_date, end_date)


# POST /api/v1/children/{child_id}/vaccines/ — 예방접종 일정 추가
@router.post("/", response_model=VaccineScheduleResponse, status_code=201)
async def create_vaccine(child_id: int, data: VaccineScheduleCreate, db: AsyncSession = Depends(get_db)):
    """새 예방접종 일정을 등록합니다. (접종명, 예정일 필요)"""
    return await vaccine_service.create(db, child_id, data)


# PATCH /api/v1/children/{child_id}/vaccines/{record_id} — 예방접종 일정 수정 (완료 처리)
@router.patch("/{record_id}", response_model=VaccineScheduleResponse)
async def update_vaccine(
    child_id: int,
    record_id: int,
    data: VaccineScheduleUpdate,
    db: AsyncSession = Depends(get_db),
):
    """예방접종 일정을 수정합니다.
    주로 is_completed=true, completed_at=날짜 로 접종 완료 처리에 사용됩니다.
    """
    return await vaccine_service.update(db, child_id, record_id, data)


# DELETE /api/v1/children/{child_id}/vaccines/{record_id} — 예방접종 일정 삭제
@router.delete("/{record_id}", status_code=204)
async def delete_vaccine(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    """예방접종 일정을 삭제합니다."""
    await vaccine_service.delete(db, child_id, record_id)
