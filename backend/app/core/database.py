# ===== 데이터베이스 연결 파일 =====
# 데이터베이스(DB)와 연결하고, 테이블을 만드는 코드입니다.
# SQLAlchemy = 파이썬 코드로 DB를 다루게 해주는 도구 (SQL 문 대신 파이썬 코드로 작성 가능)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
# create_async_engine: 비동기 방식으로 DB에 연결하는 엔진 생성
# AsyncSession: DB 작업을 묶어서 처리하는 세션 (트랜잭션 단위)
# async_sessionmaker: 세션을 만들어주는 공장 함수

from sqlalchemy.orm import DeclarativeBase  # 모든 DB 테이블 모델의 부모 클래스
from sqlalchemy import text                 # 직접 SQL 문자열을 실행할 때 사용

from app.core.config import settings        # 데이터베이스 주소 등 설정값

# DB 엔진 생성 (실제 DB 파일/서버에 연결하는 객체)
engine = create_async_engine(
    settings.DATABASE_URL,  # 접속할 DB 주소 (예: sqlite+aiosqlite:///./babycare.db)
    echo=False,             # True로 바꾸면 실행되는 SQL 문이 콘솔에 출력됨 (디버깅용)
    pool_pre_ping=True,     # 요청 전에 DB 연결이 살아있는지 먼저 확인
)

# 세션 팩토리: DB 작업을 할 때마다 새 세션을 만들어주는 공장
# expire_on_commit=False: 커밋 후에도 객체를 그대로 쓸 수 있게 설정
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


# 모든 DB 테이블 모델이 상속받는 기본 클래스
# models/ 폴더의 User, Child 등이 모두 이 Base를 상속함
class Base(DeclarativeBase):
    pass


# 앱 시작 시 DB 테이블을 생성하는 함수
async def create_tables():
    async with engine.begin() as conn:
        # Base를 상속한 모든 모델(User, Child 등)의 테이블을 DB에 생성
        # 이미 테이블이 있으면 건드리지 않음
        await conn.run_sync(Base.metadata.create_all)
        # children 테이블에 user_id 컬럼이 없으면 추가 (기존 DB 마이그레이션)
        # IF NOT EXISTS: 이미 있으면 오류 없이 무시
        await conn.execute(text(
            "ALTER TABLE children ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"
        ))
