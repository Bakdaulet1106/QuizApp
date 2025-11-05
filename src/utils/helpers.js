import { QUIZ_DIFFICULTY } from './constants'

export const formatTime = (seconds) => {
  if (seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const formatTimeFull = (seconds) => {
  if (seconds < 60) return `${seconds} сек`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) return `${mins} мин ${secs} сек`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours} сағ ${remainingMins} мин`
}

export const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case QUIZ_DIFFICULTY.EASY:
      return 'var(--success-500)'
    case QUIZ_DIFFICULTY.MEDIUM:
      return 'var(--warning-500)'
    case QUIZ_DIFFICULTY.HARD:
      return 'var(--error-500)'
    default:
      return 'var(--gray-500)'
  }
}

export const getDifficultyText = (difficulty) => {
  switch (difficulty) {
    case QUIZ_DIFFICULTY.EASY:
      return 'Оңай'
    case QUIZ_DIFFICULTY.MEDIUM:
      return 'Орташа'
    case QUIZ_DIFFICULTY.HARD:
      return 'Қиын'
    default:
      return difficulty
  }
}

export const calculateScore = (questions, answers) => {
  if (!questions || !answers || questions.length === 0) return 0
  
  const correct = questions.filter((question, index) => 
    answers[index] === question.correctAnswer
  ).length
  return Math.round((correct / questions.length) * 100)
}

export const calculateCorrectAnswers = (questions, answers) => {
  if (!questions || !answers) return 0
  return questions.filter((question, index) => 
    answers[index] === question.correctAnswer
  ).length
}

export const isOnline = () => navigator.onLine

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('kk-KZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatDateShort = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('kk-KZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}