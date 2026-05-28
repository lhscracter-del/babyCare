// 아이(Child) 관련 API 함수 모음

import api from './axios'

export const getChildren = () => api.get('/children/')

export const createChild = (data) => api.post('/children/', data)

export const getChild = (childId) => api.get(`/children/${childId}`)

export const updateChild = (childId, data) => api.patch(`/children/${childId}`, data)

export const deleteChild = (childId) => api.delete(`/children/${childId}`)
