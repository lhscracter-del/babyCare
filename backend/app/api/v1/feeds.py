from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.feed_record import FeedRecordCreate, FeedRecordUpdate, FeedRecordResponse
from app.services import feed_service

router = APIRouter()


@router.get("/", response_model=list[FeedRecordResponse])
async def list_feeds(child_id: int, db: AsyncSession = Depends(get_db)):
    return await feed_service.get_list(db, child_id)


@router.post("/", response_model=FeedRecordResponse, status_code=201)
async def create_feed(child_id: int, data: FeedRecordCreate, db: AsyncSession = Depends(get_db)):
    return await feed_service.create(db, child_id, data)


@router.patch("/{record_id}", response_model=FeedRecordResponse)
async def update_feed(child_id: int, record_id: int, data: FeedRecordUpdate, db: AsyncSession = Depends(get_db)):
    return await feed_service.update(db, child_id, record_id, data)


@router.delete("/{record_id}", status_code=204)
async def delete_feed(child_id: int, record_id: int, db: AsyncSession = Depends(get_db)):
    await feed_service.delete(db, child_id, record_id)
