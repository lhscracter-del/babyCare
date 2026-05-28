// 수면 기록 관련 API 함수 모음

import api from './axios'

export const getSleeps = (childId) => api.get(`/children/${childId}/sleeps/`)

export const createSleep = (childId, data) => api.post(`/children/${childId}/sleeps/`, data)

export const updateSleep = (childId, recordId, data) =>
  api.patch(`/children/${childId}/sleeps/${recordId}`, data)

export const deleteSleep = (childId, recordId) =>
  api.delete(`/children/${childId}/sleeps/${recordId}`)
