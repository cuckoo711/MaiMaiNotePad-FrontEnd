import axios from 'axios'

const apiBase = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:9278/api`

const apiClient = axios.create({
  baseURL: apiBase,
  timeout: 10000,
})

const refreshClient = axios.create({
  baseURL: apiBase,
  timeout: 10000,
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
}

const redirectToLogin = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  window.location.href = '/login'
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success !== undefined) {
      return response.data
    }
    return response
  },
  async (error) => {
    const { response, config } = error

    if (response && response.status === 401) {
      const originalRequest = config
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        redirectToLogin()
        return Promise.reject(error)
      }

      if (originalRequest._retry) {
        redirectToLogin()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const params = new URLSearchParams()
        params.append('refresh_token', refreshToken)

        const refreshResponse = await refreshClient.post('/refresh', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })

        const data = refreshResponse.data && refreshResponse.data.success !== undefined
          ? refreshResponse.data
          : refreshResponse

        const newAccessToken = data.data && data.data.access_token

        if (!newAccessToken) {
          throw new Error('刷新令牌失败：未返回新的访问令牌')
        }

        localStorage.setItem('access_token', newAccessToken)
        isRefreshing = false
        onRefreshed(newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    }

    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message
    }
    return Promise.reject(error)
  }
)

export default apiClient
