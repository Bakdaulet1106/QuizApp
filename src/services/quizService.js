import api from './api'
import { StorageService } from './storageService'

export const quizService = {
  async getQuizzes() {
    try {
      const response = await api.get('/quizzes')
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.warn('API error, using local storage:', error)
      return StorageService.getOfflineData('quizzes') || []
    }
  },

  async getQuiz(id) {
    try {
      const response = await api.get(`/quizzes/${id}`)
      return response
    } catch (error) {
      const quizzes = StorageService.getOfflineData('quizzes') || []
      return quizzes.find(q => q.id === parseInt(id)) || null
    }
  },

  async createQuiz(quizData) {
    try {
      const newQuiz = {
        id: Date.now(),
        ...quizData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const response = await api.post('/quizzes', newQuiz)
      
      // Update local storage
      const quizzes = StorageService.getOfflineData('quizzes') || []
      quizzes.push(newQuiz)
      StorageService.saveOfflineData('quizzes', quizzes)
      
      return response
    } catch (error) {
      console.warn('API error, saving locally:', error)
      
      const newQuiz = {
        id: Date.now(),
        ...quizData,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const quizzes = StorageService.getOfflineData('quizzes') || []
      quizzes.push(newQuiz)
      StorageService.saveOfflineData('quizzes', quizzes)
      
      // Add to sync queue
      StorageService.addPendingSyncAction({
        type: 'CREATE_QUIZ',
        data: newQuiz
      })
      
      return newQuiz
    }
  },

  async updateQuiz(id, quizData) {
    try {
      const updatedQuiz = {
        ...quizData,
        updatedAt: new Date().toISOString()
      }
      
      const response = await api.patch(`/quizzes/${id}`, updatedQuiz)
      
      // Update local storage
      const quizzes = StorageService.getOfflineData('quizzes') || []
      const index = quizzes.findIndex(q => q.id === parseInt(id))
      if (index !== -1) {
        quizzes[index] = { ...quizzes[index], ...updatedQuiz }
        StorageService.saveOfflineData('quizzes', quizzes)
      }
      
      return response
    } catch (error) {
      console.warn('API error, updating locally:', error)
      
      const quizzes = StorageService.getOfflineData('quizzes') || []
      const index = quizzes.findIndex(q => q.id === parseInt(id))
      if (index !== -1) {
        quizzes[index] = {
          ...quizzes[index],
          ...quizData,
          updatedAt: new Date().toISOString()
        }
        StorageService.saveOfflineData('quizzes', quizzes)
      }
      
      // Add to sync queue
      StorageService.addPendingSyncAction({
        type: 'UPDATE_QUIZ',
        id: parseInt(id),
        data: quizData
      })
      
      return quizzes[index] || null
    }
  },

  async deleteQuiz(id) {
    try {
      await api.delete(`/quizzes/${id}`)
      
      // Update local storage
      const quizzes = StorageService.getOfflineData('quizzes') || []
      const filteredQuizzes = quizzes.filter(q => q.id !== parseInt(id))
      StorageService.saveOfflineData('quizzes', filteredQuizzes)
      
      return { success: true }
    } catch (error) {
      console.warn('API error, deleting locally:', error)
      
      const quizzes = StorageService.getOfflineData('quizzes') || []
      const filteredQuizzes = quizzes.filter(q => q.id !== parseInt(id))
      StorageService.saveOfflineData('quizzes', filteredQuizzes)
      
      // Add to sync queue
      StorageService.addPendingSyncAction({
        type: 'DELETE_QUIZ',
        id: parseInt(id)
      })
      
      return { success: true }
    }
  },

  async submitResults(results) {
    try {
      const resultWithId = {
        id: Date.now(),
        ...results,
        submittedAt: new Date().toISOString()
      }
      
      const response = await api.post('/results', resultWithId)
      
      // Update local storage
      const allResults = StorageService.getOfflineData('results') || []
      allResults.push(resultWithId)
      StorageService.saveOfflineData('results', allResults)
      
      return response
    } catch (error) {
      console.warn('API error, saving locally:', error)
      
      const resultWithId = {
        id: Date.now(),
        ...results,
        submittedAt: new Date().toISOString()
      }
      
      const allResults = StorageService.getOfflineData('results') || []
      allResults.push(resultWithId)
      StorageService.saveOfflineData('results', allResults)
      
      // Add to sync queue
      StorageService.addPendingSyncAction({
        type: 'CREATE_RESULT',
        data: resultWithId
      })
      
      return resultWithId
    }
  },

  async getUserResults(userId) {
    try {
      const response = await api.get('/results')
      const results = Array.isArray(response) ? response : []
      return results.filter(r => r.userId === userId)
    } catch (error) {
      const results = StorageService.getOfflineData('results') || []
      return results.filter(r => r.userId === userId)
    }
  },

  async getQuizResults(quizId) {
    const results = StorageService.getOfflineData('results') || []
    return results.filter(r => r.quizId === quizId)
  },

  // Statistics
  async getQuizStatistics() {
    const quizzes = await this.getQuizzes()
    const results = StorageService.getOfflineData('results') || []
    
    const quizStats = quizzes.map(quiz => {
      const quizResults = results.filter(r => r.quizId === quiz.id)
      const averageScore = quizResults.length > 0 
        ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
        : 0
      
      return {
        ...quiz,
        attempts: quizResults.length,
        averageScore: Math.round(averageScore),
        lastAttempt: quizResults.length > 0 
          ? Math.max(...quizResults.map(r => new Date(r.submittedAt).getTime()))
          : null
      }
    })
    
    return {
      totalQuizzes: quizzes.length,
      totalAttempts: results.length,
      averageScore: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0,
      quizStats
    }
  },

  // Search and filter
  async searchQuizzes(query) {
    const quizzes = await this.getQuizzes()
    const searchLower = query.toLowerCase()
    return quizzes.filter(q =>
      q.title.toLowerCase().includes(searchLower) ||
      q.description.toLowerCase().includes(searchLower) ||
      q.category.toLowerCase().includes(searchLower)
    )
  },

  async getQuizzesByCategory(category) {
    const quizzes = await this.getQuizzes()
    return quizzes.filter(q => q.category === category)
  },

  async getActiveQuizzes() {
    const quizzes = await this.getQuizzes()
    return quizzes.filter(q => q.isActive)
  }
}