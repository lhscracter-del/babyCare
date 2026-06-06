# ===== 환경 설정 파일 =====
# 서버에서 사용하는 설정값들을 한 곳에 모아 관리합니다.
# .env 파일에 실제 값을 넣으면 여기서 자동으로 불러옵니다.

from pydantic_settings import BaseSettings  # 환경변수를 자동으로 읽어주는 도구
from typing import List                     # 리스트 타입 명시를 위해 사용


class Settings(BaseSettings):
    # 프로젝트 이름과 버전 (API 문서에 표시됨)
    PROJECT_NAME: str = "BabyCare API"
    VERSION: str = "0.1.0"

    # 데이터베이스 주소: SQLite를 사용 (개발용, 로컬 파일에 저장됨)
    # aiosqlite = 비동기(async) 방식으로 SQLite를 사용하기 위한 드라이버
    DATABASE_URL: str = "sqlite+aiosqlite:///./babycare.db"

    # JWT 토큰 관련 설정
    # SECRET_KEY: 토큰을 서명할 때 쓰는 비밀 키 (실제 운영 시 반드시 변경!)
    # ALGORITHM: 토큰 암호화 방식 (HS256 = HMAC-SHA256)
    # ACCESS_TOKEN_EXPIRE_MINUTES: 액세스 토큰 만료 시간 (30분)
    # REFRESH_TOKEN_EXPIRE_DAYS: 리프레시 토큰 만료 시간 (7일)
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS 허용 주소 목록
    # 이 주소에서 오는 요청만 서버가 받아들임
    CORS_ORIGINS: List[str] = ["http://localhost:5173","https://babycare-1-wnd4.onrender.com"]

    # Cloudinary 이미지 클라우드 서비스 설정 (일기 이미지 저장에 사용)
    # .env 파일에서 실제 값을 불러옴
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"  # .env 파일에서 환경변수를 읽어옴


# Settings 클래스의 인스턴스를 하나 만들어 전역으로 사용
# 다른 파일에서 "from app.core.config import settings" 로 불러다 쓸 수 있음
settings = Settings()
