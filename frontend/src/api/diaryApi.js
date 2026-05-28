// 일기 관련 API 함수 모음

import api from './axios'

export const getDiaries = (childId) => api.get(`/children/${childId}/diaries/`)

export const createDiary = (childId, data) => api.post(`/children/${childId}/diaries/`, data)

export const updateDiary = (childId, recordId, data) =>
  api.patch(`/children/${childId}/diaries/${recordId}`, data)

export const deleteDiary = (childId, recordId) =>
  api.delete(`/children/${childId}/diaries/${recordId}`)

// 일기 이미지 업로드 — FormData로 전송, 서버에서 저장 후 URL 반환
export const uploadDiaryImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload/diary-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
