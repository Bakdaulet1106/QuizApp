import api from './api'
import { StorageService } from './storageService'

export const questionService = {
  async getQuestions() {
    try {
      const response = await api.get('/questions')
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.warn('API error, using local storage:', error)
      return StorageService.getOfflineData('questions') || []
    }
  },

  async getQuestion(id) {
    try {
      const response = await api.get(`/questions/${id}`)
      return response
    } catch (error) {
      const questions = StorageService.getOfflineData('questions') || []
      return questions.find(q => q.id === parseInt(id)) || null
    }
  },

  async createQuestion(questionData) {
    try {
      const newQuestion = {
        id: Date.now(),
        ...questionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const response = await api.post('/questions', newQuestion)
      
      // Update local storage
      const questions = StorageService.getOfflineData('questions') || []
      questions.push(newQuestion)
      StorageService.saveOfflineData('questions', questions)
      
      return response
    } catch (error) {
      console.warn('API error, saving locally:', error)
      
      const newQuestion = {
        id: Date.now(),
        ...questionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const questions = StorageService.getOfflineData('questions') || []
      questions.push(newQuestion)
      StorageService.saveOfflineData('questions', questions)
      
      // Add to sync queue
      StorageService.addPendingSyncAction({
        type: 'CREATE_QUESTION',
        data: newQuestion
      })
      
      return newQuestion
    }
  },

  async updateQuestion(id, questionData) {
    try {
      const updatedQuestion = {
        ...questionData,
        updatedAt: new Date().toISOString()
      }
      
      const response = await api.patch(`/questions/${id}`, updatedQuestion)
      
      // Update local storage
      const questions = StorageService.getOfflineData('questions') || []
      const index = questions.findIndex(q => q.id === parseInt(id))
      if (index !== -1) {
        questions[index] = { ...questions[index], ...updatedQuestion }
        StorageService.saveOfflineData('questions', questions)
      }
      
      return response
    } catch (error) {
      console.warn('API error, updating locally:', error)
      
      const questions = StorageService.getOfflineData('questions') || []
      const index = questions.findIndex(q => q.id === parseInt(id))
      if (index !== -1) {
        questions[index] = {
          ...questions[index],
          ...questionData,
          updatedAt: new Date().toISOString()
        }
        StorageService.saveOfflineData('questions', questions)
      }
      
      // Add to sync queue
      StorageService.addPendingSyncAction({
        type: 'UPDATE_QUESTION',
        id: parseInt(id),
        data: questionData
      })
      
      return questions[index] || null
    }
  },

  async deleteQuestion(id) {
    try {
      await api.delete(`/questions/${id}`)
      
      // Update local storage
      const questions = StorageService.getOfflineData('questions') || []
      const filteredQuestions = questions.filter(q => q.id !== parseInt(id))
      StorageService.saveOfflineData('questions', filteredQuestions)
      
      return { success: true }
    } catch (error) {
      console.warn('API error, deleting locally:', error)
      
      const questions = StorageService.getOfflineData('questions') || []
      const filteredQuestions = questions.filter(q => q.id !== parseInt(id))
      StorageService.saveOfflineData('questions', filteredQuestions)
      
      // Add to sync queue
      StorageService.addPendingSyncAction({
        type: 'DELETE_QUESTION',
        id: parseInt(id)
      })
      
      return { success: true }
    }
  },

  async getQuestionsByCategory(category) {
    const questions = await this.getQuestions()
    return questions.filter(q => q.category === category)
  },

  async getQuestionsByDifficulty(difficulty) {
    const questions = await this.getQuestions()
    return questions.filter(q => q.difficulty === difficulty)
  },

  async searchQuestions(query) {
    const questions = await this.getQuestions()
    const searchLower = query.toLowerCase()
    return questions.filter(q =>
      q.question.toLowerCase().includes(searchLower) ||
      q.category.toLowerCase().includes(searchLower) ||
      q.explanation?.toLowerCase().includes(searchLower)
    )
  },

  // Statistics
  async getQuestionStatistics() {
    const questions = await this.getQuestions()
    
    const byCategory = questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1
      return acc
    }, {})
    
    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
      return acc
    }, {})
    
    return {
      total: questions.length,
      byCategory,
      byDifficulty
    }
  }
}