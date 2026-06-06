# ===== 인증 관련 데이터 형식(스키마) 정의 =====
# Pydantic 모델: API 요청/응답 데이터의 형식을 정의하고 자동으로 검증합니다.
#
# [스키마란?]
# API가 받거나 보내는 데이터의 "틀"입니다.
# 예: 로그인 요청에는 반드시 email과 password가 있어야 한다는 규칙을 정의

from pydantic import BaseModel  # 데이터 검증 기본 클래스


class UserCreate(BaseModel):
    """회원가입 요청 데이터 형식. 이 3가지 필드가 모두 있어야 합니다."""
    email: str     # 이메일 주소 (로그인 ID로 사용)
    password: str  # 비밀번호 (평문으로 받아서 서버에서 암호화)
    name: str      # 사용자 이름


class UserResponse(BaseModel):
    """사용자 정보 응답 형식. 비밀번호는 절대 응답에 포함하지 않습니다."""
    id: int        # 사용자 고유 번호
    email: str     # 이메일 주소
    name: str      # 사용자 이름

    # from_attributes=True: SQLAlchemy 모델 객체를 이 Pydantic 모델로 변환 가능하게 설정
    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    """로그인 요청 데이터 형식."""
    email: str     # 이메일 주소
    password: str  # 비밀번호


class TokenResponse(BaseModel):
    """로그인/토큰 갱신 응답 형식. 두 종류의 토큰을 함께 반환합니다."""
    access_token: str   # 짧은 수명의 API 요청용 토큰 (30분)
    refresh_token: str  # 긴 수명의 재발급용 토큰 (7일)
    token_type: str = "bearer"  # 토큰 방식 (항상 "bearer")


class RefreshRequest(BaseModel):
    """액세스 토큰 갱신 요청 데이터 형식."""
    refresh_token: str  # 재발급에 사용할 리프레시 토큰
