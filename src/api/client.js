import axios from 'axios'

// Auth uses an HttpOnly cookie set by the API; nothing sensitive is kept in JS or localStorage.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

// Normalizes the API's ProblemDetails error shape into { status, title, detail, errors, correlationId }.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response
    const data = response?.data ?? {}
    return Promise.reject({
      status: response?.status ?? 0,
      title: data.title ?? (response ? 'Request failed' : 'Network error'),
      detail: data.detail ?? null,
      errors: data.errors ?? null,
      correlationId: data.correlationId ?? response?.headers?.['x-correlation-id'] ?? null,
    })
  },
)

export default apiClient
