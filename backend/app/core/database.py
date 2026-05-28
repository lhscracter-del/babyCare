from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text

from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # 기존 DB에 image_path 컬럼이 없으면 추가 (SQLite는 ALTER TABLE ADD COLUMN만 지원)
        result = await conn.execute(text("PRAGMA table_info(diary_entries)"))
        columns = [row[1] for row in result.fetchall()]
        if "image_path" not in columns:
            await conn.execute(
                text("ALTER TABLE diary_entries ADD COLUMN image_path VARCHAR(500)")
            )
        if "original_image_path" not in columns:
            await conn.execute(
                text("ALTER TABLE diary_entries ADD COLUMN original_image_path VARCHAR(500)")
            )
