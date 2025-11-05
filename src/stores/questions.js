import { defineStore } from 'pinia'
import { questionService } from '../services/questionService'

export const useQuestionStore = defineStore('questions', {
  state: () => ({
    questions: [],
    currentQuestion: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: {
      category: '',
      difficulty: ''
    }
  }),

  getters: {
    questionsCount: (state) => state.questions.length,
    
    categories: (state) => {
      const categories = [...new Set(state.questions.map(q => q.category))]
      return categories.sort()
    },
    
    difficulties: () => ['easy', 'medium', 'hard'],
    
    filteredQuestions: (state) => {
      let questions = state.questions

      if (state.searchQuery) {
        const searchLower = state.searchQuery.toLowerCase()
        questions = questions.filter(q =>
          q.question.toLowerCase().includes(searchLower) ||
          q.category.toLowerCase().includes(searchLower) ||
          q.explanation?.toLowerCase().includes(searchLower)
        )
      }

      if (state.filters.category) {
        questions = questions.filter(q => q.category === state.filters.category)
      }

      if (state.filters.difficulty) {
        questions = questions.filter(q => q.difficulty === state.filters.difficulty)
      }

      return questions
    },
    
    questionsByCategory: (state) => {
      return (category) => state.questions.filter(q => q.category === category)
    },
    
    questionsByDifficulty: (state) => {
      return (difficulty) => state.questions.filter(q => q.difficulty === difficulty)
    },
    
    statistics: (state) => {
      const byCategory = state.questions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1
        return acc
      }, {})
      
      const byDifficulty = state.questions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
        return acc
      }, {})
      
      return {
        total: state.questions.length,
        byCategory,
        byDifficulty
      }
    }
  },

  actions: {
    async loadQuestions() {
      this.isLoading = true
      this.error = null
      
      try {
        this.questions = await questionService.getQuestions()
        return { success: true }
      } catch (error) {
        this.error = 'Сұрақтарды жүктеу қатесі'
        console.error('Load questions error:', error)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async createQuestion(questionData) {
      this.isLoading = true
      this.error = null
      
      try {
        const newQuestion = await questionService.createQuestion(questionData)
        this.questions.push(newQuestion)
        return { success: true, question: newQuestion }
      } catch (error) {
        this.error = 'Сұрақ құру қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateQuestion(id, questionData) {
      this.isLoading = true
      this.error = null
      
      try {
        const updatedQuestion = await questionService.updateQuestion(id, questionData)
        const index = this.questions.findIndex(q => q.id === id)
        if (index !== -1) {
          this.questions[index] = updatedQuestion
        }
        return { success: true, question: updatedQuestion }
      } catch (error) {
        this.error = 'Сұрақты жаңарту қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async deleteQuestion(id) {
      this.isLoading = true
      this.error = null
      
      try {
        await questionService.deleteQuestion(id)
        this.questions = this.questions.filter(q => q.id !== id)
        return { success: true }
      } catch (error) {
        this.error = 'Сұрақты жою қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async getQuestion(id) {
      this.isLoading = true
      this.error = null
      
      try {
        const question = await questionService.getQuestion(id)
        this.currentQuestion = question
        return { success: true, question }
      } catch (error) {
        this.error = 'Сұрақты табу қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    setCurrentQuestion(question) {
      this.currentQuestion = question
    },

    clearCurrentQuestion() {
      this.currentQuestion = null
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
        difficulty: ''
      }
      this.searchQuery = ''
    },

    clearError() {
      this.error = null
    },

    // Bulk operations
    async importQuestions(questions) {
      this.isLoading = true
      this.error = null
      
      try {
        const results = []
        for (const questionData of questions) {
          const result = await questionService.createQuestion(questionData)
          results.push(result)
          this.questions.push(result)
        }
        return { success: true, questions: results }
      } catch (error) {
        this.error = 'Сұрақтарды импорттау қатесі'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    }
  }
})