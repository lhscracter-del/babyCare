// 예방접종 일정 관련 API 함수 모음

import api from './axios'

export const getVaccines = (childId) => api.get(`/children/${childId}/vaccines/`)

export const createVaccine = (childId, data) => api.post(`/children/${childId}/vaccines/`, data)

// 완료 처리 및 상세 정보 수정 모두 이 함수로 처리합니다
export const updateVaccine = (childId, recordId, data) =>
  api.patch(`/children/${childId}/vaccines/${recordId}`, data)

export const deleteVaccine = (childId, recordId) =>
  api.delete(`/children/${childId}/vaccines/${recordId}`)
