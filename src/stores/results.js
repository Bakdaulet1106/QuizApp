import { defineStore } from 'pinia'
import { quizService } from '../services/quizService'
import { useAuthStore } from './auth'
import { calculateScore, calculateCorrectAnswers } from '../utils/helpers'

export const useResultsStore = defineStore('results', {
  state: () => ({
    results: [],
    currentResult: null,
    isLoading: false,
    error: null,
    filters: {
      quizId: '',
      dateFrom: '',
      dateTo: ''
    }
  }),

  getters: {
    resultsCount: (state) => state.results.length,
    
    userResults: (state) => {
      const authStore = useAuthStore()
      return state.results.filter(result => result.userId === authStore.userId)
    },
    
    recentResults: (state) => {
      const authStore = useAuthStore()
      const userResults = state.results.filter(result => result.userId === authStore.userId)
      return userResults
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 10)
    },
    
    averageScore: (state) => {
      const authStore = useAuthStore()
      const userResults = state.results.filter(result => result.userId === authStore.userId)
      if (userResults.length === 0) return 0
      
      const total = userResults.reduce((sum, result) => sum + result.score, 0)
      return Math.round(total / userResults.length)
    },
    
    bestScore: (state) => {
      const authStore = useAuthStore()
      const userResults = state.results.filter(result => result.userId === authStore.userId)
      if (userResults.length === 0) return 0
      return Math.max(...userResults.map(result => result.score))
    },
    
    filteredResults: (state) => {
      const authStore = useAuthStore()
      let results = state.results.filter(result => result.userId === authStore.userId)

      if (state.filters.quizId) {
        results = results.filter(result => result.quizId === parseInt(state.filters.quizId))
      }

      if (state.filters.dateFrom) {
        results = results.filter(result => 
          new Date(result.submittedAt) >= new Date(state.filters.dateFrom)
        )
      }

      if (state.filters.dateTo) {
        results = results.filter(result => 
          new Date(result.submittedAt) <= new Date(state.filters.dateTo)
        )
      }

      return results
    },
    
    statistics: (state) => {
      const authStore = useAuthStore()
      const userResults = state.results.filter(result => result.userId === authStore.userId)
      
      const byQuiz = userResults.reduce((acc, result) => {
        if (!acc[result.quizId]) {
          acc[result.quizId] = {
            quizTitle: result.quizTitle,
            attempts: 0,
            averageScore: 0,
            bestScore: 0
          }
        }
        acc[result.quizId].attempts++
        acc[result.quizId].averageScore = 
          (acc[result.quizId].averageScore * (acc[result.quizId].attempts - 1) + result.score) / acc[result.quizId].attempts
        acc[result.quizId].bestScore = Math.max(acc[result.quizId].bestScore, result.score)
        return acc
      }, {})
      
      return {
        totalAttempts: userResults.length,
        averageScore: userResults.length > 0 
          ? userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length
          : 0,
        bestScore: userResults.length > 0 
          ? Math.max(...userResults.map(r => r.score))
          : 0,
        byQuiz
      }
    }
  },

  actions: {
    async loadResults() {
      this.isLoading = true
      this.error = null
      
      try {
        this.results = await quizService.getResults()
        return { success: true }
      } catch (error) {
        this.error = 'Нәтижелерді жүктеу қатесі'
        console.error('Load results error:', error)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async submitQuizResult(quizData, userAnswers, timeSpent) {
      this.isLoading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const score = calculateScore(quizData.questions, userAnswers)
        const correctAnswers = calculateCorrectAnswers(quizData.questions, userAnswers)

        const result = {
          quizId: quizData.id,
          quizTitle: quizData.title,
          userId: authStore.userId,
          userName: authStore.userName,
          score,
          correctAnswers,
          totalQuestions: quizData.questions.length,
          timeSpent,
          userAnswers,
          questions: quizData.questions,
          submittedAt: new Date().toISOString()
        }

        const savedResult = await quizService.submitResults(result)
        this.results.push(savedResult)
        this.currentResult = savedResult
        
        return { success: true, result: savedResult }
      } catch (error) {
        this.error = 'Тест нәтижесін жіберу қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async getResult(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const result = this.results.find(r => r.id === id)
        if (!result) {
          throw new Error('Нәтиже табылмады')
        }
        this.currentResult = result
        return { success: true, result }
      } catch (error) {
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async getUserResults(userId) {
      this.isLoading = true
      this.error = null
      
      try {
        const userResults = await quizService.getUserResults(userId)
        // Merge with local results
        const localUserResults = this.results.filter(r => r.userId === userId)
        const allResults = [...userResults, ...localUserResults]
        // Remove duplicates
        this.results = allResults.filter((result, index, self) =>
          index === self.findIndex(r => r.id === result.id)
        )
        return { success: true, results: this.results.filter(r => r.userId === userId) }
      } catch (error) {
        this.error = 'Пайдаланушы нәтижелерін жүктеу қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    setCurrentResult(result) {
      this.currentResult = result
    },

    clearCurrentResult() {
      this.currentResult = null
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        quizId: '',
        dateFrom: '',
        dateTo: ''
      }
    },

    clearError() {
      this.error = null
    },

    // Analytics
    async getQuizAnalytics(quizId) {
      const quizResults = this.results.filter(r => r.quizId === quizId)
      if (quizResults.length === 0) return null
      
      const averageScore = quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
      const bestScore = Math.max(...quizResults.map(r => r.score))
      const completionRate = quizResults.length // This would need total attempts data
      
      return {
        attempts: quizResults.length,
        averageScore: Math.round(averageScore),
        bestScore,
        completionRate,
        recentAttempts: quizResults
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
          .slice(0, 5)
      }
    }
  }
})