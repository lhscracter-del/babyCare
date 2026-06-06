# ===== 육아 일기 API 엔드포인트 =====
# URL 형태: /api/v1/children/{child_id}/diaries/
# 육아 일기 작성, 목록 조회, 수정, 삭제를 제공합니다.
# 이미지 업로드는 별도의 /upload/diary-image API를 먼저 호출 후 URL을 이 API에 전달합니다.

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.diary_entry import DiaryEntryCreate, DiaryEntryUpdate, DiaryEntryResponse
from app.services import diary_service

router = APIRouter()


# GET /api/v1/children/{child_id}/diaries/ — 일기 목록 조회
@router.get("/", response_model=list[DiaryEntryResponse])
async def list_diaries(
    child_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """해당 아이의 육아 일기 목록을 최신 날짜순으로 반환합니다. (페이지네이션·기간 필터 지원)"""
    return await diary_service.get_list(db, child_id, skip, limit, start_date, end_date)


# POST /api/v1/children/{child_id}/diaries/ — 일기 작성
@router.post("/", response_model=DiaryEntryResponse, status_code=201)
async def create_diary(child_id: int, data: DiaryEntryCreate, db: AsyncSession = Depends(get_db)):
    """새 육아 일기를 작성합니다. (날짜, 내용, 기분, 이미지 URL 등)"""
    return await diary_service.create(db, child_id, data)


# PATCH /api/v1/children/{child_id}/diaries/{record_id} — 일기 수정
@router.patch("/{record_id}", response_model=DiaryEntryResponse)
async def update_diary(child_id: int, record_id: int, data: DiaryEntryUpdate, db: AsyncSession = Depends(get_db)):
    """기존 육아 일기를 수정합니다. 이미지가 바뀌면 기존 이미지 파일도 자동 삭제됩니다."""
    return await diary_service.update(db, child_id, record_id, data)


# DELETE /api/v1/children/{child_id}/diaries/{record_id} — 일기 삭제
@router.delete("/{record_id}", status_code=204)
async def delete_diary(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    """육아 일기를 삭제합니다. 첨부된 이미지 파일도 함께 삭제됩니다."""
    await diary_service.delete(db, child_id, record_id)
