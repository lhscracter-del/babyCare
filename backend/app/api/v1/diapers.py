# ===== 기저귀 교체 기록 API 엔드포인트 =====
# URL 형태: /api/v1/children/{child_id}/diapers/
# 기저귀 기록은 수정 기능이 없습니다. (조회, 추가, 삭제만 제공)

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.diaper_record import DiaperRecordCreate, DiaperRecordResponse
from app.services import diaper_service

router = APIRouter()


# GET /api/v1/children/{child_id}/diapers/ — 기저귀 기록 목록 조회
@router.get("/", response_model=list[DiaperRecordResponse])
async def list_diapers(
    child_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """해당 아이의 기저귀 교체 기록을 최신순으로 반환합니다. (페이지네이션·기간 필터 지원)"""
    return await diaper_service.get_list(db, child_id, skip, limit, start_date, end_date)


# POST /api/v1/children/{child_id}/diapers/ — 기저귀 교체 기록 추가
@router.post("/", response_model=DiaperRecordResponse, status_code=201)
async def create_diaper(child_id: int, data: DiaperRecordCreate, db: AsyncSession = Depends(get_db)):
    """새 기저귀 교체 기록을 추가합니다. (소변/대변 종류, 교체 시각 등)"""
    return await diaper_service.create(db, child_id, data)


# DELETE /api/v1/children/{child_id}/diapers/{record_id} — 기저귀 기록 삭제
@router.delete("/{record_id}", status_code=204)
async def delete_diaper(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    """기저귀 교체 기록을 삭제합니다."""
    await diaper_service.delete(db, child_id, record_id)
