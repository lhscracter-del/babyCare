from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # children 테이블에 user_id 컬럼이 없으면 추가 (기존 DB 마이그레이션)
        await conn.execute(text(
            "ALTER TABLE children ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)"
        ))
