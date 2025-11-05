import { defineStore } from 'pinia'
import { quizService } from '../services/quizService'

export const useQuizStore = defineStore('quizzes', {
  state: () => ({
    quizzes: [],
    currentQuiz: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: {
      category: '',
      isActive: true
    }
  }),

  getters: {
    quizzesCount: (state) => state.quizzes.length,
    
    activeQuizzes: (state) => state.quizzes.filter(quiz => quiz.isActive),
    
    categories: (state) => {
      const categories = [...new Set(state.quizzes.map(quiz => quiz.category))]
      return categories.sort()
    },
    
    filteredQuizzes: (state) => {
      let quizzes = state.quizzes

      if (state.filters.isActive) {
        quizzes = quizzes.filter(quiz => quiz.isActive)
      }

      if (state.searchQuery) {
        const searchLower = state.searchQuery.toLowerCase()
        quizzes = quizzes.filter(quiz =>
          quiz.title.toLowerCase().includes(searchLower) ||
          quiz.description.toLowerCase().includes(searchLower) ||
          quiz.category.toLowerCase().includes(searchLower)
        )
      }

      if (state.filters.category) {
        quizzes = quizzes.filter(quiz => quiz.category === state.filters.category)
      }

      return quizzes
    },
    
    quizzesByCategory: (state) => {
      return (category) => state.quizzes.filter(quiz => quiz.category === category)
    },
    
    statistics: (state) => {
      const byCategory = state.quizzes.reduce((acc, quiz) => {
        acc[quiz.category] = (acc[quiz.category] || 0) + 1
        return acc
      }, {})
      
      return {
        total: state.quizzes.length,
        active: state.quizzes.filter(q => q.isActive).length,
        byCategory
      }
    }
  },

  actions: {
    async loadQuizzes() {
      this.isLoading = true
      this.error = null
      
      try {
        this.quizzes = await quizService.getQuizzes()
        return { success: true }
      } catch (error) {
        this.error = 'Тесттерді жүктеу қатесі'
        console.error('Load quizzes error:', error)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async loadQuizById(id) {
      this.isLoading = true
      this.error = null
      
      try {
        this.currentQuiz = await quizService.getQuiz(id)
        return { success: true, quiz: this.currentQuiz }
      } catch (error) {
        this.error = 'Тестті жүктеу қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async createQuiz(quizData) {
      this.isLoading = true
      this.error = null
      
      try {
        const newQuiz = await quizService.createQuiz(quizData)
        this.quizzes.push(newQuiz)
        return { success: true, quiz: newQuiz }
      } catch (error) {
        this.error = 'Тест құру қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateQuiz(id, quizData) {
      this.isLoading = true
      this.error = null
      
      try {
        const updatedQuiz = await quizService.updateQuiz(id, quizData)
        const index = this.quizzes.findIndex(q => q.id === id)
        if (index !== -1) {
          this.quizzes[index] = updatedQuiz
        }
        if (this.currentQuiz && this.currentQuiz.id === id) {
          this.currentQuiz = updatedQuiz
        }
        return { success: true, quiz: updatedQuiz }
      } catch (error) {
        this.error = 'Тестті жаңарту қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async deleteQuiz(id) {
      this.isLoading = true
      this.error = null
      
      try {
        await quizService.deleteQuiz(id)
        this.quizzes = this.quizzes.filter(q => q.id !== id)
        if (this.currentQuiz && this.currentQuiz.id === id) {
          this.currentQuiz = null
        }
        return { success: true }
      } catch (error) {
        this.error = 'Тестті жою қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async toggleQuizActive(id) {
      const quiz = this.quizzes.find(q => q.id === id)
      if (!quiz) return { success: false, error: 'Тест табылмады' }
      
      return await this.updateQuiz(id, { isActive: !quiz.isActive })
    },

    setCurrentQuiz(quiz) {
      this.currentQuiz = quiz
    },

    clearCurrentQuiz() {
      this.currentQuiz = null
    },

    setSearchQuery(query) {
      this.searchQuery = query
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = {
        category: '',
        isActive: true
      }
      this.searchQuery = ''
    },

    clearError() {
      this.error = null
    },

    // Get quiz with questions
    async getQuizWithQuestions(id) {
      const quiz = this.quizzes.find(q => q.id === id) || await quizService.getQuiz(id)
      if (!quiz) return null
      
      // In a real app, you would fetch the actual questions here
      // For now, we'll return the quiz with question IDs
      return quiz
    }
  }
})