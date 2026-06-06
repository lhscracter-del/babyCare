# ===== 사용자(User) 데이터베이스 테이블 정의 =====
# 이 파일은 "users" 테이블의 구조를 파이썬 클래스로 정의합니다.
# SQLAlchemy ORM: SQL 문 없이 파이썬 클래스로 DB 테이블을 다루는 방식

from datetime import datetime                            # 날짜/시간 타입 사용
from sqlalchemy import String, DateTime                  # DB 컬럼 타입 (문자열, 날짜시간)
from sqlalchemy.orm import Mapped, mapped_column         # 컬럼 정의 도구

from app.core.database import Base  # 모든 모델의 부모 클래스


class User(Base):
    """앱을 사용하는 부모(사용자) 정보를 저장하는 테이블입니다."""
    __tablename__ = "users"  # DB에서 이 테이블의 실제 이름

    # id: 사용자 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # email: 로그인에 사용하는 이메일 주소 (중복 불가, 검색 최적화를 위해 인덱스 설정)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # hashed_password: bcrypt로 암호화된 비밀번호 (원본 비밀번호는 저장하지 않음)
    hashed_password: Mapped[str] = mapped_column(String(255))

    # name: 사용자 이름 (화면에 표시될 닉네임)
    name: Mapped[str] = mapped_column(String(100))

    # created_at: 계정 생성 시각 (자동으로 현재 시각이 저장됨)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
