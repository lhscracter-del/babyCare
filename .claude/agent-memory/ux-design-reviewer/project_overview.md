---
name: project-overview
description: babyCare 프로젝트 기술스택, 구조, 대상 사용자 요약
metadata:
  type: project
---

React (Vite + Tailwind CSS) 기반 아기 육아 기록 모바일 웹앱.

**Why:** 부모가 아이의 수유/수면/기저귀/성장/일기/예방접종을 스마트폰에서 간편하게 기록하기 위해 개발.

**How to apply:** 모든 UI 결정은 모바일 우선 (max-w-md 기준), 터치 인터랙션 최우선 고려.

## 기술스택
- Frontend: React 18, Vite, Tailwind CSS, React Query (@tanstack/react-query), React Hook Form, Zustand, React Router DOM
- Backend: FastAPI (Python), Alembic, SQLAlchemy
- 상태관리: Zustand (authStore, childStore), React Query (서버 상태)

## 주요 파일 구조
- `frontend/src/hooks/` — 도메인별 커스텀 훅 (useFeed, useSleep, useDiaper, useDiary, useGrowth, useVaccine)
- `frontend/src/components/` — 도메인별 List/Form 컴포넌트
- `frontend/src/pages/` — 라우트 페이지 컴포넌트
- `frontend/src/api/` — axios 기반 API 함수
- `frontend/src/store/` — Zustand 스토어

## 대상 사용자
신생아~영아기 자녀를 둔 부모. 기술 리터러시 중간 수준, 스마트폰 위주 사용.
