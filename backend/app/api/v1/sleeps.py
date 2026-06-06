# ===== 수면 기록 API 엔드포인트 =====
# URL 형태: /api/v1/children/{child_id}/sleeps/
# router.py의 verify_child_owner가 모든 요청에서 자동으로 소유권을 확인합니다.

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.sleep_record import SleepRecordCreate, SleepRecordUpdate, SleepRecordResponse
from app.services import sleep_service

router = APIRouter()


# GET /api/v1/children/{child_id}/sleeps/ — 수면 기록 목록 조회
@router.get("/", response_model=list[SleepRecordResponse])
async def list_sleeps(
    child_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """해당 아이의 수면 기록을 최신순으로 반환합니다. (페이지네이션·기간 필터 지원)"""
    return await sleep_service.get_list(db, child_id, skip, limit, start_date, end_date)


# POST /api/v1/children/{child_id}/sleeps/ — 수면 기록 추가
@router.post("/", response_model=SleepRecordResponse, status_code=201)
async def create_sleep(child_id: int, data: SleepRecordCreate, db: AsyncSession = Depends(get_db)):
    """새 수면 기록을 추가합니다. (잠든 시각, 깨어난 시각, 품질 점수 등)"""
    return await sleep_service.create(db, child_id, data)


# PATCH /api/v1/children/{child_id}/sleeps/{record_id} — 수면 기록 수정
@router.patch("/{record_id}", response_model=SleepRecordResponse)
async def update_sleep(child_id: int, record_id: int, data: SleepRecordUpdate, db: AsyncSession = Depends(get_db)):
    """기존 수면 기록을 수정합니다. (예: 깨어난 시각 나중에 추가)"""
    return await sleep_service.update(db, child_id, record_id, data)


# DELETE /api/v1/children/{child_id}/sleeps/{record_id} — 수면 기록 삭제
@router.delete("/{record_id}", status_code=204)
async def delete_sleep(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    """수면 기록을 삭제합니다."""
    await sleep_service.delete(db, child_id, record_id)
