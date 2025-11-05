export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
}

export const QUIZ_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
}

export const QUIZ_CATEGORIES = [
  'Экономика',
  'Бухгалтерлік есеп',
  'Менеджмент',
  'Маркетинг',
  'Қаржы',
  'Жалпы'
]

export const STORAGE_KEYS = {
  USER: 'quiz_app_user',
  QUIZ_PROGRESS: 'quiz_app_progress',
  OFFLINE_DATA: 'quiz_app_offline'
}

export const API_ENDPOINTS = {
  LOGIN: '/api/users',
  QUESTIONS: '/api/questions',
  QUIZZES: '/api/quizzes',
  RESULTS: '/api/results'
}

export const QUIZ_CONFIG = {
  MAX_QUESTIONS_PER_QUIZ: 50,
  MAX_OPTIONS_PER_QUESTION: 6,
  MIN_OPTIONS_PER_QUESTION: 2,
  DEFAULT_QUIZ_DURATION: 1800,
  MAX_QUIZ_DURATION: 7200
}