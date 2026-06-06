# ===== 아이(Child) 데이터베이스 테이블 정의 =====
# 각 사용자(부모)가 등록한 아이들의 기본 정보를 저장하는 테이블입니다.
# 한 부모(user)가 여러 명의 아이를 등록할 수 있습니다.

from datetime import date, datetime                          # date = 날짜만, datetime = 날짜+시간
from sqlalchemy import String, Date, DateTime, Integer, ForeignKey
# String: 문자열 / Date: 날짜만 / DateTime: 날짜+시간 / ForeignKey: 다른 테이블 참조
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Child(Base):
    """아이의 기본 정보(이름, 생년월일, 성별)를 저장하는 테이블입니다."""
    __tablename__ = "children"

    # id: 아이 고유 번호 (자동 증가, 기본키)
    id: Mapped[int] = mapped_column(primary_key=True)

    # user_id: 이 아이의 부모(사용자) ID
    # ForeignKey("users.id"): users 테이블의 id를 참조 (부모-자녀 관계)
    # nullable=True: 기존 데이터 호환을 위해 NULL 허용
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    # name: 아이 이름
    name: Mapped[str] = mapped_column(String(100))

    # birth_date: 아이의 생년월일 (Date 타입 = 날짜만, 시간 없음)
    birth_date: Mapped[date] = mapped_column(Date)

    # gender: 성별 ("M" = 남자, "F" = 여자)
    gender: Mapped[str] = mapped_column(String(1))

    # created_at: 아이 등록 시각 (자동으로 현재 시각이 저장됨)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
