# ===== 인증 서비스 =====
# 회원가입, 로그인, 로그아웃, 토큰 갱신 등 사용자 인증 로직을 처리합니다.
# API 엔드포인트(auth.py)에서 이 함수들을 호출합니다.

from sqlalchemy.ext.asyncio import AsyncSession  # 비동기 DB 세션 타입
from sqlalchemy import select                    # DB 조회 쿼리 작성
from fastapi import HTTPException, status        # HTTP 에러 응답 도구

from app.models.user import User  # 사용자 DB 모델
from app.core.security import (
    verify_password,       # 비밀번호 일치 확인
    get_password_hash,     # 비밀번호 암호화
    create_access_token,   # 액세스 토큰 생성
    create_refresh_token,  # 리프레시 토큰 생성
    decode_token,          # 토큰 해독
)
from app.schemas.auth import LoginRequest, UserCreate, TokenResponse, RefreshRequest


async def register(db: AsyncSession, data: UserCreate) -> User:
    """새 사용자를 등록(회원가입)합니다.

    이미 등록된 이메일이면 400 에러를 반환합니다.
    비밀번호는 bcrypt로 암호화하여 저장합니다.
    """
    # 이미 같은 이메일로 가입된 사용자가 있는지 확인
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # 새 사용자 객체 생성 (비밀번호는 암호화해서 저장)
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),  # 비밀번호 암호화
        name=data.name,
    )
    db.add(user)        # DB에 추가 예약
    await db.commit()   # 실제 DB에 저장
    await db.refresh(user)  # DB에서 최신 상태(자동 생성된 id 등) 다시 읽기
    return user


async def login(db: AsyncSession, data: LoginRequest) -> TokenResponse:
    """이메일/비밀번호로 로그인하고 JWT 토큰을 반환합니다.

    이메일이 없거나 비밀번호가 틀리면 401 에러를 반환합니다.
    성공 시 액세스 토큰과 리프레시 토큰을 함께 반환합니다.
    """
    # 이메일로 사용자 조회
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    # 사용자가 없거나 비밀번호가 틀린 경우 (보안상 둘 다 같은 에러 메시지 사용)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 토큰 생성: sub(subject) = 사용자 ID (문자열로 변환해서 저장)
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


async def get_user_by_id(db: AsyncSession, user_id: int) -> User:
    """사용자 ID로 사용자 정보를 조회합니다. (내 정보 보기에 사용)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def refresh_token(db: AsyncSession, data: RefreshRequest) -> TokenResponse:
    """만료된 액세스 토큰을 리프레시 토큰으로 갱신합니다.

    리프레시 토큰이 유효하면 새 액세스 토큰과 리프레시 토큰을 모두 새로 발급합니다.
    리프레시 토큰이 만료되면 다시 로그인해야 합니다.
    """
    # 리프레시 토큰 해독 및 유효성 확인
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # 토큰에서 사용자 ID 추출 후 DB에서 사용자 존재 확인
    user_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # 새 토큰 발급
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
