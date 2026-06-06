# ===== 수유 기록 API 엔드포인트 =====
# URL 형태: /api/v1/children/{child_id}/feeds/
# router.py에서 verify_child_owner가 의존성으로 등록되어 있어
# 모든 요청에서 자동으로 해당 아이가 현재 사용자의 것인지 확인됩니다.

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.feed_record import FeedRecordCreate, FeedRecordUpdate, FeedRecordResponse
from app.services import feed_service

router = APIRouter()


# GET /api/v1/children/{child_id}/feeds/?child_id=1 — 수유 기록 목록 조회
# child_id: URL 경로 파라미터 (router.py에서 prefix로 정의됨)
@router.get("/", response_model=list[FeedRecordResponse])
async def list_feeds(
    child_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """해당 아이의 수유 기록을 최신순으로 반환합니다. (페이지네이션·기간 필터 지원)"""
    return await feed_service.get_list(db, child_id, skip, limit, start_date, end_date)


# POST /api/v1/children/{child_id}/feeds/ — 수유 기록 추가
@router.post("/", response_model=FeedRecordResponse, status_code=201)
async def create_feed(child_id: int, data: FeedRecordCreate, db: AsyncSession = Depends(get_db)):
    """새 수유 기록을 추가합니다. (수유 종류, 양, 시각 등)"""
    return await feed_service.create(db, child_id, data)


# PATCH /api/v1/children/{child_id}/feeds/{record_id} — 수유 기록 수정
@router.patch("/{record_id}", response_model=FeedRecordResponse)
async def update_feed(child_id: int, record_id: int, data: FeedRecordUpdate, db: AsyncSession = Depends(get_db)):
    """기존 수유 기록을 수정합니다."""
    return await feed_service.update(db, child_id, record_id, data)


# DELETE /api/v1/children/{child_id}/feeds/{record_id} — 수유 기록 삭제
@router.delete("/{record_id}", status_code=204)
async def delete_feed(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    """수유 기록을 삭제합니다."""
    await feed_service.delete(db, child_id, record_id)
