---
name: project-stack-baseline
description: babyCare tech stack, data-shape quirks, and verification commands relevant to performance work
metadata:
  type: project
---

babyCare = FastAPI (async SQLAlchemy) backend + React/Vite frontend (React Query, Zustand store `childStore`).

**Verification commands** (no `python` alias — use `python3`):
- Backend syntax: `cd backend && python3 -m py_compile <files>`
- Frontend build: `cd frontend && npx --no-install vite build` (ESLint has NO config file, so lint fails — use the Vite build to catch parse errors instead).

**Why:** These are the only quick checks available in this env; eslint is installed but unconfigured.

**How to apply:** When touching backend Python, run py_compile; when touching frontend JSX, run vite build to confirm it still compiles.

## Data-shape quirks (load-bearing for query/UI optimizations)
- `get_list()` services return records pre-sorted by their time column DESC (vaccine is ASC by `scheduled_at`). Frontend can rely on `arr[0]` being most-recent instead of re-sorting.
- DateTime columns per model: feed=`fed_at`, sleep=`sleep_at`, diaper=`changed_at`, growth=`measured_at`, vaccine=`scheduled_at` (all `DateTime`); diary=`entry_date` (`Date`). For date-range filtering, DateTime columns need `func.date(col)` comparison; `entry_date` compares directly.
- `vaccine.scheduled_at` is treated as a plain `"YYYY-MM-DD"` string on the frontend (compared with `===`, not `.split('T')`). Diary `entry_date` is also `"YYYY-MM-DD"`.
- Active axios instance is `frontend/src/api/axios.js` (imported as `./axios` by all `*Api.js` files). `client.js` was a dead duplicate (removed).

## Applied optimizations (2026-06-04)
- PERF-01: added `skip/limit/start_date/end_date` to all six list services + routers (router defaults skip=0, limit=100, le=500).
- PERF-02: `upload.py` and `diary_service.py` now wrap Cloudinary upload/destroy and PIL `compress_to_jpeg` in `asyncio.to_thread`. `_delete_image_file`/`_delete_entry_images` became async.
- PERF-03/04/05: `useMemo` for HomePage `allRecords`, VaccinePage `markedDatesMap` (regrouped by-date to drop O(N²)), and markedDates on Feed/Sleep/Diaper/Diary pages.
