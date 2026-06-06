# ===== 보안 관련 함수 모음 =====
# 비밀번호 암호화, JWT 토큰 생성/검증 기능을 담당합니다.
#
# [JWT(JSON Web Token)란?]
# 로그인 성공 시 서버가 발급하는 "신분증" 같은 것입니다.
# 클라이언트가 요청할 때마다 이 토큰을 보내면 서버가 "누가 보낸 요청인지" 확인합니다.
# 토큰은 암호화되어 있어 위·변조가 불가능합니다.

from datetime import datetime, timedelta  # 날짜/시간 계산에 사용
from typing import Optional               # 값이 없을 수도 있는 경우 타입 표시용

from jose import JWTError, jwt            # JWT 토큰 생성·검증 라이브러리
from passlib.context import CryptContext  # 비밀번호 해싱(암호화) 라이브러리

from app.core.config import settings      # SECRET_KEY, ALGORITHM 등 설정값


# bcrypt 알고리즘으로 비밀번호를 암호화하는 컨텍스트 객체
# bcrypt: 단방향 암호화 - 암호화는 되지만 복호화는 불가능 (보안에 매우 강함)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """입력한 비밀번호가 DB에 저장된 암호화된 비밀번호와 일치하는지 확인합니다."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """비밀번호를 bcrypt로 암호화하여 반환합니다. (DB에 저장할 때 사용)"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """로그인 성공 시 발급하는 액세스 토큰을 생성합니다.

    액세스 토큰: API 요청 시 매번 보내는 짧은 수명의 토큰 (기본 30분)
    만료 시간이 짧아 탈취당해도 피해가 제한됨
    """
    to_encode = data.copy()  # 원본 데이터를 복사해서 사용
    # 만료 시간 계산: 지금 시간 + 설정된 만료 시간
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})  # 만료시간과 토큰 종류 추가
    # 설정된 비밀키와 알고리즘으로 JWT 토큰 문자열 생성
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """액세스 토큰이 만료됐을 때 새 토큰을 재발급 받기 위한 리프레시 토큰을 생성합니다.

    리프레시 토큰: 액세스 토큰보다 수명이 길고 (기본 7일), 재발급에만 사용됨
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """JWT 토큰 문자열을 해독해서 안에 담긴 정보(사용자 ID 등)를 반환합니다.

    토큰이 위조되었거나 만료된 경우 None을 반환합니다.
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        # 토큰이 잘못되었거나 만료된 경우 None 반환
        return None
