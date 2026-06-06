# ===== 성장 기록 API 엔드포인트 =====
# URL 형태: /api/v1/children/{child_id}/growths/
# 아이의 키, 몸무게, 머리둘레를 기록하고 조회합니다.

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.growth_record import GrowthRecordCreate, GrowthRecordUpdate, GrowthRecordResponse
from app.services import growth_service

router = APIRouter()


# GET /api/v1/children/{child_id}/growths/ — 성장 기록 목록 조회
@router.get("/", response_model=list[GrowthRecordResponse])
async def list_growths(
    child_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """해당 아이의 성장 기록을 최신 측정일순으로 반환합니다. (페이지네이션·기간 필터 지원)"""
    return await growth_service.get_list(db, child_id, skip, limit, start_date, end_date)


# POST /api/v1/children/{child_id}/growths/ — 성장 기록 추가
@router.post("/", response_model=GrowthRecordResponse, status_code=201)
async def create_growth(child_id: int, data: GrowthRecordCreate, db: AsyncSession = Depends(get_db)):
    """새 성장 기록을 추가합니다. (키, 몸무게, 머리둘레 중 하나 이상 필요)"""
    return await growth_service.create(db, child_id, data)


# PATCH /api/v1/children/{child_id}/growths/{record_id} — 성장 기록 수정
@router.patch("/{record_id}", response_model=GrowthRecordResponse)
async def update_growth(child_id: int, record_id: int, data: GrowthRecordUpdate, db: AsyncSession = Depends(get_db)):
    """기존 성장 기록을 수정합니다."""
    return await growth_service.update(db, child_id, record_id, data)


# DELETE /api/v1/children/{child_id}/growths/{record_id} — 성장 기록 삭제
@router.delete("/{record_id}", status_code=204)
async def delete_growth(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    """성장 기록을 삭제합니다."""
    await growth_service.delete(db, child_id, record_id)
