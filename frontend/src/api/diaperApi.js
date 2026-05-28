import api from './axios'

export const getDiapers = (childId) => api.get(`/children/${childId}/diapers/`)

export const createDiaper = (childId, data) => api.post(`/children/${childId}/diapers/`, data)

export const deleteDiaper = (childId, recordId) =>
  api.delete(`/children/${childId}/diapers/${recordId}`)
