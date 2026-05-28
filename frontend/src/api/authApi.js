import api from './axios'

export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const refreshToken = (refresh_token) => api.post('/auth/refresh', { refresh_token })
export const getMe = () => api.get('/auth/me')
