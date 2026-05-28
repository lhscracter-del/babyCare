// 성장 기록 관련 API 함수 모음

import api from './axios'

export const getGrowths = (childId) => api.get(`/children/${childId}/growths/`)

export const createGrowth = (childId, data) => api.post(`/children/${childId}/growths/`, data)

export const updateGrowth = (childId, recordId, data) =>
  api.patch(`/children/${childId}/growths/${recordId}`, data)

export const deleteGrowth = (childId, recordId) =>
  api.delete(`/children/${childId}/growths/${recordId}`)
