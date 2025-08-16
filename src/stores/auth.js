import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const userName = computed(() => user.value?.name || '')

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock admin credentials - replace with actual authentication
      if (credentials.email === 'admin@epictetus.hmu.gr' && credentials.password === 'admin123') {
        user.value = {
          id: 1,
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
          avatar: '/logo.jpg'
        }

        // Store in localStorage for persistence
        localStorage.setItem('epictetus_user', JSON.stringify(user.value))
        localStorage.setItem('epictetus_token', 'mock-jwt-token')

        return { success: true }
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    error.value = null
    
    // Clear localStorage
    localStorage.removeItem('epictetus_user')
    localStorage.removeItem('epictetus_token')
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem('epictetus_user')
    const savedToken = localStorage.getItem('epictetus_token')

    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (err) {
        console.error('Error parsing saved user data:', err)
        logout()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize auth state
  checkAuth()

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    userName,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearError
  }
})
