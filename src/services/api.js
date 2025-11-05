import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      throw new Error('Интернет байланысы жоқ')
    }
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error('Құпия сөз немесе email дұрыс емес')
        case 404:
          throw new Error('Деректер табылмады')
        case 500:
          throw new Error('Сервер қатесі')
        default:
          throw new Error(error.response.data?.message || 'Жүйелік қате')
      }
    }
    
    throw new Error('Белгісіз қате')
  }
)

// API methods
export const apiService = {
  // Users
  async getUsers() {
    return api.get('/users')
  },

  async createUser(userData) {
    return api.post('/users', userData)
  },

  // Questions
  async getQuestions() {
    return api.get('/questions')
  },

  async getQuestion(id) {
    return api.get(`/questions/${id}`)
  },

  async createQuestion(questionData) {
    return api.post('/questions', questionData)
  },

  async updateQuestion(id, questionData) {
    return api.patch(`/questions/${id}`, questionData)
  },

  async deleteQuestion(id) {
    return api.delete(`/questions/${id}`)
  },

  // Quizzes
  async getQuizzes() {
    return api.get('/quizzes')
  },

  async getQuiz(id) {
    return api.get(`/quizzes/${id}`)
  },

  async createQuiz(quizData) {
    return api.post('/quizzes', quizData)
  },

  async updateQuiz(id, quizData) {
    return api.patch(`/quizzes/${id}`, quizData)
  },

  async deleteQuiz(id) {
    return api.delete(`/quizzes/${id}`)
  },

  // Results
  async getResults() {
    return api.get('/results')
  },

  async createResult(resultData) {
    return api.post('/results', resultData)
  },

  async getUserResults(userId) {
    const results = await api.get('/results')
    return Array.isArray(results) ? results.filter(r => r.userId === userId) : []
  }
}

export default api