// Utility functions for handling news data storage and retrieval
import newsData from '../data/news.json'

/**
 * News storage utility class
 * Handles loading, saving, and managing news articles from/to JSON file
 */
class NewsStorage {
  constructor() {
    this.storageKey = 'epictetus_news_data'
    this.data = this.loadFromStorage() || this.getDefaultData()
  }

  /**
   * Get default news data from JSON file
   */
  getDefaultData() {
    return {
      articles: [...newsData.articles],
      categories: [...newsData.categories],
      lastUpdated: new Date().toISOString()
    }
  }

  /**
   * Load data from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        // Merge with default data to ensure we have all categories
        return {
          ...this.getDefaultData(),
          ...data,
          articles: data.articles || this.getDefaultData().articles
        }
      }
    } catch (error) {
      console.warn('Error loading news data from storage:', error)
    }
    return null
  }

  /**
   * Save data to localStorage
   */
  saveToStorage() {
    try {
      this.data.lastUpdated = new Date().toISOString()
      localStorage.setItem(this.storageKey, JSON.stringify(this.data))
      return true
    } catch (error) {
      console.error('Error saving news data to storage:', error)
      return false
    }
  }

  /**
   * Get all articles
   */
  getAllArticles() {
    return [...this.data.articles]
  }

  /**
   * Get article by ID
   */
  getArticleById(id) {
    return this.data.articles.find(article => article.id === parseInt(id))
  }

  /**
   * Get articles by category
   */
  getArticlesByCategory(category) {
    if (category === 'all') return this.getAllArticles()
    return this.data.articles.filter(article => article.category === category)
  }

  /**
   * Get featured articles
   */
  getFeaturedArticles() {
    return this.data.articles.filter(article => article.featured)
  }

  /**
   * Search articles
   */
  searchArticles(query, category = 'all') {
    let articles = category === 'all' ? this.getAllArticles() : this.getArticlesByCategory(category)
    
    if (!query || query.trim() === '') return articles

    const searchTerm = query.toLowerCase()
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.description.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm) ||
      article.author.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  /**
   * Add new article
   */
  addArticle(articleData) {
    const newId = Math.max(...this.data.articles.map(a => a.id), 0) + 1
    const newArticle = {
      id: newId,
      ...articleData,
      publishedDate: articleData.publishedDate || new Date().toISOString().split('T')[0],
      likes: 0,
      views: 0,
      readTime: this.calculateReadTime(articleData.content)
    }

    this.data.articles.unshift(newArticle)
    this.saveToStorage()
    return newArticle
  }

  /**
   * Update existing article
   */
  updateArticle(id, updates) {
    const index = this.data.articles.findIndex(article => article.id === parseInt(id))
    if (index === -1) return null

    this.data.articles[index] = {
      ...this.data.articles[index],
      ...updates,
      id: parseInt(id) // Ensure ID doesn't change
    }

    this.saveToStorage()
    return this.data.articles[index]
  }

  /**
   * Delete article
   */
  deleteArticle(id) {
    const index = this.data.articles.findIndex(article => article.id === parseInt(id))
    if (index === -1) return false

    this.data.articles.splice(index, 1)
    this.saveToStorage()
    return true
  }

  /**
   * Like article
   */
  likeArticle(id) {
    const article = this.getArticleById(id)
    if (article) {
      article.likes++
      this.saveToStorage()
      return article.likes
    }
    return null
  }

  /**
   * Increment article views
   */
  incrementViews(id) {
    const article = this.getArticleById(id)
    if (article) {
      article.views++
      this.saveToStorage()
      return article.views
    }
    return null
  }

  /**
   * Get all categories with counts
   */
  getCategories() {
    const categoriesWithCounts = this.data.categories.map(category => ({
      ...category,
      count: category.value === 'all' 
        ? this.data.articles.length 
        : this.data.articles.filter(article => article.category === category.value).length
    }))

    return categoriesWithCounts
  }

  /**
   * Calculate reading time based on content
   */
  calculateReadTime(content) {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }

  /**
   * Reset to default data
   */
  resetToDefault() {
    this.data = this.getDefaultData()
    this.saveToStorage()
    return this.data
  }

  /**
   * Export data for backup
   */
  exportData() {
    return JSON.stringify(this.data, null, 2)
  }

  /**
   * Import data from backup
   */
  importData(jsonData) {
    try {
      const imported = JSON.parse(jsonData)
      if (imported.articles && Array.isArray(imported.articles)) {
        this.data = {
          ...this.getDefaultData(),
          ...imported
        }
        this.saveToStorage()
        return true
      }
      throw new Error('Invalid data format')
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

// Export singleton instance
export const newsStorage = new NewsStorage()

// Export utility functions
export const {
  getAllArticles,
  getArticleById,
  getArticlesByCategory,
  getFeaturedArticles,
  searchArticles,
  addArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  incrementViews,
  getCategories,
  calculateReadTime,
  resetToDefault,
  exportData,
  importData
} = newsStorage
