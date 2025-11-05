import { defineStore } from 'pinia'
import { authService } from '../services/authService'
import { StorageService } from '../services/storageService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: StorageService.getUser(),
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isStudent: (state) => state.user?.role === 'student',
    userName: (state) => state.user?.name || 'Қонақ',
    userEmail: (state) => state.user?.email,
    userId: (state) => state.user?.id
  },

  actions: {
    async login(credentials) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.login(credentials)
        this.user = response.user
        this.token = response.token
        
        StorageService.setUser(response.user)
        localStorage.setItem('token', response.token)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.register(userData)
        this.user = response.user
        this.token = response.token
        
        StorageService.setUser(response.user)
        localStorage.setItem('token', response.token)
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await authService.logout()
        this.user = null
        this.token = null
        this.error = null
        
        StorageService.clearUser()
        localStorage.removeItem('token')
        
        return { success: true }
      } catch (error) {
        console.error('Logout error:', error)
        // Force logout even if there's an error
        this.user = null
        this.token = null
        StorageService.clearUser()
        localStorage.removeItem('token')
        return { success: true }
      }
    },

    async updateProfile(userData) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await authService.updateProfile(this.user.id, userData)
        this.user = { ...this.user, ...response }
        StorageService.setUser(this.user)
        
        return { success: true, user: this.user }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async checkAuth() {
      if (!this.token || !this.user) {
        return false
      }
      
      try {
        const user = await authService.getCurrentUser()
        this.user = user
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    clearError() {
      this.error = null
    },

    setUser(user) {
      this.user = user
      StorageService.setUser(user)
    }
  }
})