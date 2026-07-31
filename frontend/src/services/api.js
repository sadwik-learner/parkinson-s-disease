import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail
    const message =
      detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected API error occurred.'

    const normalizedError = new Error(message)
    normalizedError.name = 'ApiError'
    normalizedError.status = status
    normalizedError.data = error.response?.data
    normalizedError.originalError = error

    return Promise.reject(normalizedError)
  },
)

export default api
