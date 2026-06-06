# ===== Alembic 마이그레이션 환경 설정 =====
# Alembic: 데이터베이스 테이블 구조 변경을 버전으로 관리하는 도구입니다.
# (예: 컬럼 추가, 테이블 이름 변경 등을 코드로 기록하고 적용/되돌리기 가능)
#
# 이 파일은 Alembic이 마이그레이션을 실행할 때 필요한 설정을 담고 있습니다.
# 보통 직접 수정할 일은 없습니다.

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.core.config import settings  # DB 주소 등 설정값
from app.core.database import Base    # 모든 테이블 모델의 부모 클래스
import app.models  # noqa: F401 — 모든 모델을 메타데이터에 등록 (이 import가 없으면 Alembic이 테이블 변경 감지 못함)

# Alembic 설정 객체
config = context.config
# DB 주소를 settings에서 가져와서 Alembic 설정에 주입
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# alembic.ini 파일의 로그 설정 적용
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 마이그레이션 대상: 모든 모델의 테이블 정보
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """오프라인 모드: 실제 DB 연결 없이 SQL 파일만 생성합니다."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """실제 DB 연결에 마이그레이션을 적용합니다."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """비동기 방식으로 DB에 연결하여 마이그레이션을 실행합니다."""
    # NullPool: 마이그레이션 후 연결 풀을 사용하지 않음 (일회성 실행이므로)
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()  # 연결 정리


def run_migrations_online() -> None:
    """온라인 모드: 실제 DB에 연결하여 마이그레이션을 실행합니다."""
    asyncio.run(run_async_migrations())  # 비동기 함수를 동기로 실행


# 오프라인/온라인 모드 자동 판단
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
