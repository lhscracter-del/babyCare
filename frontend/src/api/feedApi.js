// 수유/식사 기록 관련 API 함수 모음

import api from './axios'

export const getFeeds = (childId) => api.get(`/children/${childId}/feeds/`)

export const createFeed = (childId, data) => api.post(`/children/${childId}/feeds/`, data)

export const updateFeed = (childId, recordId, data) =>
  api.patch(`/children/${childId}/feeds/${recordId}`, data)

export const deleteFeed = (childId, recordId) =>
  api.delete(`/children/${childId}/feeds/${recordId}`)
