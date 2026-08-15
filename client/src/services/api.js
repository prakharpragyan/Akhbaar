import axios from 'axios'

// Base URL points to your Express backend
// In development: http://localhost:5000
// In production: your Render URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── Axios Instance ───────────────────────────────────────────────────────────
// One axios instance used everywhere — we attach the JWT automatically
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach JWT token to every request
// This is how "protected routes" work on the backend — it checks this header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('akhbaar_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: if token expired (401), log user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('akhbaar_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth API ─────────────────────────────────────────────────────────────────
// Maps to: POST /api/auth/register and POST /api/auth/login on your backend
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login:    (credentials) => api.post('/auth/login', credentials),
  getMe:    () => api.get('/auth/me'),
  updatePreferences: (preferences) => api.put('/auth/preferences', { preferences }),
}

// ─── News API ─────────────────────────────────────────────────────────────────
// Maps to: GET /api/news?category=technology on your backend
export const newsAPI = {
  getNews:  (category) => api.get(`/news?category=${category}`),
  getPersonalizedNews: ()        => api.get('/news/personalized'), 
  toggleBookmark:      (article)  => api.post('/news/bookmark', article),
  getBookmarks:        ()         => api.get('/news/bookmarks'),
  searchNews:          (query)    => api.get(`/news/search?q=${query}`),
  trackClick:          (url)      => api.post('/news/click', { url }),
  getTrending:         ()         => api.get('/news/trending'),
  getRecommendations:   ()         => api.get('/news/recommendations'),
}

export const aiAPI = {
  summarize: (articleData) => api.post('/ai/summarize', articleData),
  explain:   (articleData) => api.post('/ai/explain',   articleData),
  sentiment: (articleData) => api.post('/ai/sentiment', articleData),
}


export default api
