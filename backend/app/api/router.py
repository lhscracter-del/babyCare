# ===== API 라우터 통합 파일 =====
# 모든 API 경로를 한 곳에서 등록하고 관리합니다.
# 각 기능별 라우터를 불러와서 URL 접두사(prefix)를 붙여서 등록합니다.

from fastapi import APIRouter, Depends

# 각 기능별 라우터 모듈 import
from app.api.v1 import auth, children, feeds, sleeps, growths, vaccines, diaries, upload, diapers
from app.core.dependencies import verify_child_owner  # 아이 소유권 확인 함수

# 최상위 API 라우터 (여기에 모든 하위 라우터를 등록)
api_router = APIRouter()

# 인증 관련 API: /api/v1/auth/login, /api/v1/auth/register 등
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# 아이 관리 API: /api/v1/children, /api/v1/children/{id} 등
api_router.include_router(children.router, prefix="/children", tags=["children"])

# 아래 기능들은 모두 특정 아이(child_id)에 속하는 데이터입니다.
# dependencies=[Depends(verify_child_owner)]: 모든 요청에서 해당 아이가 본인 것인지 자동 확인
# 예: /api/v1/children/1/feeds 는 아이 ID 1의 수유 기록

# 수유 기록 API
api_router.include_router(feeds.router, prefix="/children/{child_id}/feeds", tags=["feeds"],
                          dependencies=[Depends(verify_child_owner)])

# 수면 기록 API
api_router.include_router(sleeps.router, prefix="/children/{child_id}/sleeps", tags=["sleeps"],
                          dependencies=[Depends(verify_child_owner)])

# 성장 기록 API (키, 몸무게, 머리둘레)
api_router.include_router(growths.router, prefix="/children/{child_id}/growths", tags=["growths"],
                          dependencies=[Depends(verify_child_owner)])

# 예방접종 일정 API
api_router.include_router(vaccines.router, prefix="/children/{child_id}/vaccines", tags=["vaccines"],
                          dependencies=[Depends(verify_child_owner)])

# 육아 일기 API
api_router.include_router(diaries.router, prefix="/children/{child_id}/diaries", tags=["diaries"],
                          dependencies=[Depends(verify_child_owner)])

# 기저귀 교체 기록 API
api_router.include_router(diapers.router, prefix="/children/{child_id}/diapers", tags=["diapers"],
                          dependencies=[Depends(verify_child_owner)])

# 이미지 업로드 API (prefix 없음 - /api/v1/upload/diary-image)
api_router.include_router(upload.router, tags=["upload"])
