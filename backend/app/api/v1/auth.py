# ===== 인증 API 엔드포인트 =====
# 회원가입, 로그인, 로그아웃, 토큰 갱신, 내 정보 조회 API를 정의합니다.
#
# [API 엔드포인트란?]
# 클라이언트(프론트엔드)가 서버에 요청을 보내는 URL 주소입니다.
# 예: POST /api/v1/auth/login → 로그인 요청

from fastapi import APIRouter, Depends        # APIRouter: URL 경로 묶음 / Depends: 의존성 주입
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user  # DB 세션, 현재 사용자 가져오기
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, UserCreate, UserResponse
from app.services import auth_service  # 실제 처리 로직은 서비스에 위임

# 이 파일의 라우터 객체 (router.py에서 "/auth" 경로로 등록됨)
router = APIRouter()


# POST /api/v1/auth/register — 회원가입
# response_model: 응답 데이터 형식 / status_code=201: "Created" 상태 코드
@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """새 계정을 생성합니다. 이메일과 비밀번호, 이름을 받습니다."""
    return await auth_service.register(db, data)


# POST /api/v1/auth/login — 로그인
@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """이메일/비밀번호로 로그인하고 액세스 토큰과 리프레시 토큰을 반환합니다."""
    return await auth_service.login(db, data)


# POST /api/v1/auth/logout — 로그아웃
@router.post("/logout")
async def logout():
    """로그아웃합니다. (서버는 stateless이므로 클라이언트가 토큰을 버리면 됨)"""
    return {"message": "Logged out successfully"}


# POST /api/v1/auth/refresh — 액세스 토큰 갱신
@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """만료된 액세스 토큰을 리프레시 토큰으로 새로 발급받습니다."""
    return await auth_service.refresh_token(db, data)


# GET /api/v1/auth/me — 내 정보 조회 (로그인 필요)
# current_user: 헤더의 토큰에서 자동으로 현재 사용자 정보 추출
@router.get("/me", response_model=UserResponse)
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),  # 토큰 검증 후 사용자 정보 주입
):
    """현재 로그인한 사용자의 정보를 반환합니다."""
    return await auth_service.get_user_by_id(db, int(current_user["sub"]))
