from fastapi import APIRouter

from app.api.v1 import auth, children, feeds, sleeps, growths, vaccines, diaries, upload

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(children.router, prefix="/children", tags=["children"])
api_router.include_router(feeds.router, prefix="/children/{child_id}/feeds", tags=["feeds"])
api_router.include_router(sleeps.router, prefix="/children/{child_id}/sleeps", tags=["sleeps"])
api_router.include_router(growths.router, prefix="/children/{child_id}/growths", tags=["growths"])
api_router.include_router(vaccines.router, prefix="/children/{child_id}/vaccines", tags=["vaccines"])
api_router.include_router(diaries.router, prefix="/children/{child_id}/diaries", tags=["diaries"])
api_router.include_router(upload.router, tags=["upload"])
