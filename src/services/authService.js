import api from './api'

export const authService = {
  async login(credentials) {
    try {
      const response = await api.get('/users')
      const users = Array.isArray(response) ? response : []
      const user = users.find(u => 
        u.email === credentials.email && u.password === credentials.password
      )
      
      if (!user) {
        throw new Error('Қате email немесе құпия сөз')
      }

      const { password, ...userWithoutPassword } = user
      return {
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + user.id
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Серверге қосылу қатесі')
    }
  },

  async register(userData) {
    try {
      const response = await api.get('/users')
      const users = Array.isArray(response) ? response : []
      const existingUser = users.find(u => u.email === userData.email)
      
      if (existingUser) {
        throw new Error('Бұл email-мен тіркелген пайдаланушы бар')
      }

      const newUser = {
        id: Date.now(),
        ...userData,
        role: 'student',
        createdAt: new Date().toISOString()
      }

      await api.post('/users', newUser)

      const { password, ...userWithoutPassword } = newUser
      return {
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + newUser.id
      }
    } catch (error) {
      console.error('Register error:', error)
      throw new Error('Тіркелу қатесі')
    }
  },

  async logout() {
    // Clear local storage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return { success: true }
  },

  async getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user'))
    const token = localStorage.getItem('token')
    
    if (!user || !token) {
      throw new Error('Пайдаланушы табылмады')
    }
    
    return user
  },

  async updateProfile(userId, userData) {
    try {
      const response = await api.patch(`/users/${userId}`, userData)
      return response
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error('Профильді жаңарту қатесі')
    }
  }
}