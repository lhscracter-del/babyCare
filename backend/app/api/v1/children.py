# ===== 아이 관리 API 엔드포인트 =====
# 아이 목록 조회, 등록, 개별 조회, 수정, 삭제 API를 정의합니다.
# 모든 API는 로그인이 필요합니다. (get_current_user 의존성)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.schemas.child import ChildCreate, ChildUpdate, ChildResponse
from app.services import child_service

router = APIRouter()


# GET /api/v1/children/ — 내 아이들 목록 조회
@router.get("/", response_model=list[ChildResponse])
async def list_children(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # 로그인 확인
):
    """현재 로그인한 사용자가 등록한 모든 아이 목록을 반환합니다."""
    user_id = int(current_user["sub"])  # 토큰에서 사용자 ID 추출
    return await child_service.get_all(db, user_id)


# POST /api/v1/children/ — 새 아이 등록
@router.post("/", response_model=ChildResponse, status_code=201)
async def create_child(
    data: ChildCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """새 아이를 등록합니다. (이름, 생년월일, 성별 필요)"""
    user_id = int(current_user["sub"])
    return await child_service.create(db, user_id, data)


# GET /api/v1/children/{child_id} — 특정 아이 정보 조회
# {child_id}: URL에서 동적으로 받는 아이 ID (예: /children/1, /children/2)
@router.get("/{child_id}", response_model=ChildResponse)
async def get_child(
    child_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """특정 아이의 기본 정보를 반환합니다."""
    user_id = int(current_user["sub"])
    return await child_service.get_by_id(db, child_id, user_id)


# PATCH /api/v1/children/{child_id} — 아이 정보 수정
# PATCH: 일부 필드만 수정 (PUT은 전체 교체, PATCH는 부분 수정)
@router.patch("/{child_id}", response_model=ChildResponse)
async def update_child(
    child_id: int,
    data: ChildUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """아이의 이름, 생년월일, 성별 등을 수정합니다."""
    user_id = int(current_user["sub"])
    return await child_service.update(db, child_id, user_id, data)


# DELETE /api/v1/children/{child_id} — 아이 삭제
# status_code=204: "No Content" — 삭제 성공 시 응답 본문 없음
@router.delete("/{child_id}", status_code=204)
async def delete_child(
    child_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """아이와 해당 아이의 모든 기록(수유, 수면, 일기 등)을 삭제합니다."""
    user_id = int(current_user["sub"])
    await child_service.delete_child(db, child_id, user_id)
