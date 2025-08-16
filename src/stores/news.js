import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { newsStorage } from '../utils/newsStorage.js'

export const useNewsStore = defineStore('news', () => {
  // State
  const isLoading = ref(false)
  const error = ref(null)

  // Reactive articles from storage
  const articles = computed(() => newsStorage.getAllArticles())

  // Getters
  const featuredArticles = computed(() => 
    newsStorage.getFeaturedArticles()
  )

  const articlesByCategory = computed(() => (category) => {
    return newsStorage.getArticlesByCategory(category)
  })

  const getArticleById = computed(() => (id) => 
    newsStorage.getArticleById(id)
  )

  const categories = computed(() => {
    return newsStorage.getCategories()
  })

  // Actions
  const addArticle = async (articleData) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const newArticle = newsStorage.addArticle(articleData)
      return { success: true, article: newArticle }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const updateArticle = async (id, updates) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const updatedArticle = newsStorage.updateArticle(id, updates)
      if (!updatedArticle) {
        throw new Error('Article not found')
      }
      return { success: true, article: updatedArticle }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteArticle = async (id) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const success = newsStorage.deleteArticle(id)
      if (!success) {
        throw new Error('Article not found')
      }
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const likeArticle = (id) => {
    const likes = newsStorage.likeArticle(id)
    return likes
  }

  const incrementViews = (id) => {
    const views = newsStorage.incrementViews(id)
    return views
  }

  const searchArticles = (query, category = 'all') => {
    return newsStorage.searchArticles(query, category)
  }

  const clearError = () => {
    error.value = null
  }

  // Admin actions
  const resetToDefault = async () => {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      newsStorage.resetToDefault()
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  const exportData = () => {
    return newsStorage.exportData()
  }

  const importData = async (jsonData) => {
    isLoading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const success = newsStorage.importData(jsonData)
      if (!success) {
        throw new Error('Invalid data format')
      }
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    isLoading,
    error,
    
    // Getters
    articles,
    featuredArticles,
    articlesByCategory,
    getArticleById,
    categories,
    
    // Actions
    addArticle,
    updateArticle,
    deleteArticle,
    likeArticle,
    incrementViews,
    searchArticles,
    clearError,
    resetToDefault,
    exportData,
    importData
  }
})
