import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach session token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greenmint_auth_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Session expired while navigating/checking out: drop token and resume after login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && localStorage.getItem('greenmint_auth_token')) {
      localStorage.removeItem('greenmint_auth_token')
      const back = window.location.pathname + window.location.search
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(back)}&expired=1`
      }
    }
    return Promise.reject(error)
  },
)
