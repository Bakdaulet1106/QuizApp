import { STORAGE_KEYS } from '../utils/constants'

export const StorageService = {
  // Basic localStorage methods
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  },

  getItem(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  },

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  },

  // User management
  setUser(user) {
    return this.setItem(STORAGE_KEYS.USER, user)
  },

  getUser() {
    return this.getItem(STORAGE_KEYS.USER)
  },

  clearUser() {
    return this.removeItem(STORAGE_KEYS.USER)
  },

  // Quiz progress management
  saveQuizProgress(quizId, progress) {
    const allProgress = this.getItem(STORAGE_KEYS.QUIZ_PROGRESS) || {}
    allProgress[quizId] = {
      ...progress,
      savedAt: new Date().toISOString()
    }
    return this.setItem(STORAGE_KEYS.QUIZ_PROGRESS, allProgress)
  },

  getQuizProgress(quizId) {
    const allProgress = this.getItem(STORAGE_KEYS.QUIZ_PROGRESS) || {}
    return allProgress[quizId] || null
  },

  clearQuizProgress(quizId) {
    const allProgress = this.getItem(STORAGE_KEYS.QUIZ_PROGRESS) || {}
    delete allProgress[quizId]
    return this.setItem(STORAGE_KEYS.QUIZ_PROGRESS, allProgress)
  },

  // Offline data management
  saveOfflineData(key, data) {
    const offlineData = this.getItem(STORAGE_KEYS.OFFLINE_DATA) || {}
    offlineData[key] = {
      data,
      savedAt: new Date().toISOString()
    }
    return this.setItem(STORAGE_KEYS.OFFLINE_DATA, offlineData)
  },

  getOfflineData(key) {
    const offlineData = this.getItem(STORAGE_KEYS.OFFLINE_DATA) || {}
    return offlineData[key]?.data || null
  },

  // Data synchronization helpers
  getPendingSyncActions() {
    return this.getItem('pending_sync_actions') || []
  },

  addPendingSyncAction(action) {
    const actions = this.getPendingSyncActions()
    actions.push({
      ...action,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    })
    return this.setItem('pending_sync_actions', actions)
  },

  removePendingSyncAction(actionId) {
    const actions = this.getPendingSyncActions()
    const filteredActions = actions.filter(action => action.id !== actionId)
    return this.setItem('pending_sync_actions', filteredActions)
  }
}

export default StorageService