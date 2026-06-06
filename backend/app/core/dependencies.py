# ===== 의존성 주입 함수 모음 =====
# FastAPI에서 "의존성 주입"이란, API 함수가 실행되기 전에 자동으로 준비해주는 것들입니다.
# 예: DB 세션 연결, 로그인 확인, 권한 확인 등
# Depends(함수) 형태로 사용하면 API가 호출될 때마다 자동으로 이 함수들이 실행됩니다.

from typing import AsyncGenerator  # 비동기 제너레이터 타입 명시용

from fastapi import Depends, HTTPException, status
# Depends: 의존성 주입 선언
# HTTPException: HTTP 에러 응답을 보낼 때 사용
# status: HTTP 상태 코드 상수 (401, 404 등)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# HTTPBearer: "Authorization: Bearer <토큰>" 형태의 헤더에서 토큰을 추출하는 도구

from sqlalchemy.ext.asyncio import AsyncSession  # DB 세션 타입
from sqlalchemy import select                    # DB 조회 쿼리 작성용

from app.core.database import AsyncSessionLocal  # DB 세션 팩토리
from app.core.security import decode_token       # JWT 토큰 해독 함수

# HTTP 헤더의 Bearer 토큰을 자동으로 추출하는 보안 스킴 객체
security = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """API 함수에서 사용할 DB 세션을 생성하고 자동으로 반환·종료합니다.

    with 문처럼 동작: API가 끝나면 세션이 자동으로 닫힙니다.
    Depends(get_db)로 API 함수에 주입하여 사용합니다.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session  # 세션을 API 함수에 전달
        finally:
            await session.close()  # API 처리가 끝나면 무조건 세션 닫기


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """요청 헤더의 JWT 토큰을 검증하고 현재 로그인한 사용자 정보를 반환합니다.

    토큰이 없거나 만료된 경우 401 에러를 응답합니다.
    반환값 예시: {"sub": "1", "email": "user@example.com", "type": "access"}
    """
    token = credentials.credentials  # Bearer 뒤의 실제 토큰 문자열 추출
    payload = decode_token(token)    # 토큰 해독
    # 토큰이 유효하지 않거나, 리프레시 토큰을 액세스 토큰 자리에 쓴 경우 거부
    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return payload  # 토큰 안의 사용자 정보 반환


async def verify_child_owner(
    child_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> None:
    """요청한 아이(child_id)가 현재 로그인한 사용자의 아이인지 확인합니다.

    다른 사람의 아이 데이터에 접근하지 못하도록 막는 보안 함수입니다.
    아이가 없거나 본인 소유가 아니면 404 에러를 응답합니다.
    """
    from app.models.child import Child  # 순환 import 방지를 위해 함수 내부에서 import
    user_id = int(current_user["sub"])  # 토큰에서 현재 사용자 ID 추출
    # DB에서 해당 ID의 아이가 현재 사용자의 것인지 조회
    result = await db.execute(
        select(Child).where(Child.id == child_id, Child.user_id == user_id)
    )
    if not result.scalar_one_or_none():
        # 아이를 찾지 못한 경우 404 반환 (보안상 403 대신 404 사용 - 존재 여부 자체를 숨김)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
