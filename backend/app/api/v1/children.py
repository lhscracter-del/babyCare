from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.child import ChildCreate, ChildUpdate, ChildResponse
from app.services import child_service

router = APIRouter()


@router.get("/", response_model=list[ChildResponse])
async def list_children(db: AsyncSession = Depends(get_db)):
    return await child_service.get_all(db)


@router.post("/", response_model=ChildResponse, status_code=201)
async def create_child(data: ChildCreate, db: AsyncSession = Depends(get_db)):
    return await child_service.create(db, data)


@router.get("/{child_id}", response_model=ChildResponse)
async def get_child(child_id: int, db: AsyncSession = Depends(get_db)):
    return await child_service.get_by_id(db, child_id)


@router.patch("/{child_id}", response_model=ChildResponse)
async def update_child(child_id: int, data: ChildUpdate, db: AsyncSession = Depends(get_db)):
    return await child_service.update(db, child_id, data)


@router.delete("/{child_id}", status_code=204)
async def delete_child(child_id: int, db: AsyncSession = Depends(get_db)):
    await child_service.delete_child(db, child_id)
