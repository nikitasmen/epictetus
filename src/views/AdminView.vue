<template>
  <div class="admin-panel page-container">
    <!-- Header -->
    <PageHeader
      title="Admin Panel"
      description="Manage news articles and system settings"
      :breadcrumbs="breadcrumbs"
      :showBreadcrumbs="true"
    />

    <!-- Admin Navigation -->
    <div class="admin-nav">
      <button 
        v-for="tab in adminTabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['admin-nav-btn', { 'active': activeTab === tab.id }]"
      >
        <span class="nav-icon">{{ tab.icon }}</span>
        <span class="nav-text">{{ tab.name }}</span>
      </button>
    </div>

    <!-- News Management Tab -->
    <div v-if="activeTab === 'news'" class="admin-section">
      <div class="section-header">
        <h2>News Management</h2>
        <AppButton @click="showAddArticleModal = true" variant="primary">
          <span class="icon">📝</span>
          Add New Article
        </AppButton>
      </div>

      <!-- Articles List -->
      <div class="articles-list">
        <div v-if="newsStore.isLoading" class="loading-state">
          <LoadingSpinner size="large" />
          <p>Loading articles...</p>
        </div>
        
        <div v-else-if="articles.length === 0" class="empty-state">
          <div class="empty-icon">📰</div>
          <h3>No articles found</h3>
          <p>Start by creating your first news article</p>
        </div>

        <div v-else class="articles-grid">
          <div 
            v-for="article in articles" 
            :key="article.id" 
            class="article-card"
          >
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <div class="article-badges">
                <span v-if="article.featured" class="badge featured">Featured</span>
                <span class="badge category">{{ article.category }}</span>
              </div>
            </div>
            
            <div class="article-meta">
              <span class="author">By {{ article.author }}</span>
              <span class="date">{{ formatDate(article.publishedDate) }}</span>
              <span class="stats">
                👁️ {{ article.views }} | ❤️ {{ article.likes }}
              </span>
            </div>
            
            <p class="article-excerpt">{{ article.description }}</p>
            
            <div class="article-actions">
              <AppButton 
                @click="editArticle(article)" 
                variant="outline" 
                size="small"
              >
                ✏️ Edit
              </AppButton>
              <AppButton 
                @click="deleteArticle(article)" 
                variant="outline" 
                size="small"
                :loading="deletingArticleId === article.id"
              >
                🗑️ Delete
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Tab -->
    <div v-if="activeTab === 'stats'" class="admin-section">
      <div class="section-header">
        <h2>Statistics</h2>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📰</div>
          <div class="stat-content">
            <h3>{{ articles.length }}</h3>
            <p>Total Articles</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>{{ featuredArticlesCount }}</h3>
            <p>Featured Articles</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-content">
            <h3>{{ totalViews }}</h3>
            <p>Total Views</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">❤️</div>
          <div class="stat-content">
            <h3>{{ totalLikes }}</h3>
            <p>Total Likes</p>
          </div>
        </div>
      </div>

      <div class="categories-overview">
        <h3>Articles by Category</h3>
        <div class="category-stats">
          <div 
            v-for="category in categoriesWithCounts" 
            :key="category.value"
            class="category-stat"
          >
            <span class="category-name">{{ category.label }}</span>
            <span class="category-count">{{ category.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div v-if="activeTab === 'settings'" class="admin-section">
      <div class="section-header">
        <h2>Settings</h2>
      </div>
      
      <div class="settings-grid">
        <div class="setting-card">
          <h3>Data Management</h3>
          <p>Export or import news data</p>
          <div class="setting-actions">
            <AppButton @click="exportData" variant="outline">
              📤 Export Data
            </AppButton>
            <AppButton @click="triggerImport" variant="outline">
              📥 Import Data
            </AppButton>
            <AppButton @click="resetData" variant="outline" :loading="resetting">
              🔄 Reset to Default
            </AppButton>
          </div>
        </div>
      </div>
      
      <input 
        ref="fileInput" 
        type="file" 
        accept=".json" 
        @change="handleFileImport" 
        style="display: none"
      >
    </div>

    <!-- Add/Edit Article Modal -->
    <AppModal 
      :show="showAddArticleModal || showEditArticleModal" 
      @close="closeArticleModal"
      title="Article Editor"
      size="large"
    >
      <ArticleEditor
        :article="selectedArticle"
        :isEditing="showEditArticleModal"
        @save="handleArticleSave"
        @cancel="closeArticleModal"
      />
    </AppModal>

    <!-- Error/Success Messages -->
    <div v-if="message" :class="['message', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useNewsStore } from '@/stores/news.js'
import PageHeader from '@/components/common/PageHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ArticleEditor from '@/components/admin/ArticleEditor.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs.js'

// Stores
const authStore = useAuthStore()
const newsStore = useNewsStore()
const router = useRouter()

// Check admin access
if (!authStore.isAdmin) {
  router.push('/')
}

// Reactive data
const activeTab = ref('news')
const showAddArticleModal = ref(false)
const showEditArticleModal = ref(false)
const selectedArticle = ref(null)
const deletingArticleId = ref(null)
const resetting = ref(false)
const message = ref(null)
const fileInput = ref(null)

// Breadcrumbs
const { breadcrumbs } = useBreadcrumbs('Admin')

// Admin tabs
const adminTabs = [
  { id: 'news', name: 'News Management', icon: '📰' },
  { id: 'stats', name: 'Statistics', icon: '📊' },
  { id: 'settings', name: 'Settings', icon: '⚙️' }
]

// Computed properties
const articles = computed(() => newsStore.articles)
const featuredArticlesCount = computed(() => 
  newsStore.featuredArticles.length
)
const totalViews = computed(() => 
  articles.value.reduce((sum, article) => sum + article.views, 0)
)
const totalLikes = computed(() => 
  articles.value.reduce((sum, article) => sum + article.likes, 0)
)
const categoriesWithCounts = computed(() => 
  newsStore.categories.filter(cat => cat.value !== 'all')
)

// Methods
const editArticle = (article) => {
  selectedArticle.value = { ...article }
  showEditArticleModal.value = true
}

const deleteArticle = async (article) => {
  if (!confirm(`Are you sure you want to delete "${article.title}"?`)) {
    return
  }

  deletingArticleId.value = article.id
  try {
    const result = await newsStore.deleteArticle(article.id)
    if (result.success) {
      showMessage('Article deleted successfully', 'success')
    } else {
      showMessage(result.error || 'Failed to delete article', 'error')
    }
  } catch (error) {
    showMessage('An error occurred while deleting the article', 'error')
  } finally {
    deletingArticleId.value = null
  }
}

const handleArticleSave = async (articleData) => {
  try {
    let result
    if (showEditArticleModal.value) {
      result = await newsStore.updateArticle(selectedArticle.value.id, articleData)
    } else {
      result = await newsStore.addArticle(articleData)
    }

    if (result.success) {
      closeArticleModal()
      const action = showEditArticleModal.value ? 'updated' : 'created'
      showMessage(`Article ${action} successfully`, 'success')
    } else {
      showMessage(result.error || 'Failed to save article', 'error')
    }
  } catch (error) {
    showMessage('An error occurred while saving the article', 'error')
  }
}

const closeArticleModal = () => {
  showAddArticleModal.value = false
  showEditArticleModal.value = false
  selectedArticle.value = null
}

const exportData = () => {
  try {
    const data = newsStore.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `epictetus-news-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showMessage('Data exported successfully', 'success')
  } catch (error) {
    showMessage('Failed to export data', 'error')
  }
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const result = await newsStore.importData(text)
    if (result.success) {
      showMessage('Data imported successfully', 'success')
    } else {
      showMessage(result.error || 'Failed to import data', 'error')
    }
  } catch (error) {
    showMessage('Invalid file format', 'error')
  }
  
  // Reset file input
  event.target.value = ''
}

const resetData = async () => {
  if (!confirm('Are you sure you want to reset all data to default? This cannot be undone.')) {
    return
  }

  resetting.value = true
  try {
    const result = await newsStore.resetToDefault()
    if (result.success) {
      showMessage('Data reset to default successfully', 'success')
    } else {
      showMessage(result.error || 'Failed to reset data', 'error')
    }
  } catch (error) {
    showMessage('An error occurred while resetting data', 'error')
  } finally {
    resetting.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const showMessage = (text, type = 'info') => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = null
  }, 5000)
}

// Lifecycle
onMounted(() => {
  // Clear any previous errors
  newsStore.clearError()
})
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  background-color: var(--background-secondary);
}

.admin-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: var(--background-primary);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow);
}

.admin-nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
}

.admin-nav-btn:hover {
  background-color: var(--background-secondary);
  color: var(--text-primary);
}

.admin-nav-btn.active {
  background-color: var(--primary-color);
  color: white;
}

.admin-section {
  background-color: var(--background-primary);
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
  color: var(--text-primary);
  margin: 0;
}

/* Articles Management */
.articles-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}

.article-card {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  background-color: var(--background-primary);
  transition: all 0.3s ease;
}

.article-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.article-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.article-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.featured {
  background-color: var(--warning-color);
  color: white;
}

.badge.category {
  background-color: var(--primary-color);
  color: white;
}

.article-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.article-excerpt {
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-actions {
  display: flex;
  gap: 0.5rem;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--background-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  color: var(--text-secondary);
  margin: 0;
}

.categories-overview {
  margin-top: 2rem;
}

.categories-overview h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.category-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.category-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--background-secondary);
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
}

.category-name {
  font-weight: 500;
  color: var(--text-primary);
}

.category-count {
  font-weight: 600;
  color: var(--primary-color);
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
}

/* Settings */
.settings-grid {
  display: grid;
  gap: 1.5rem;
}

.setting-card {
  padding: 1.5rem;
  background-color: var(--background-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.setting-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.setting-card p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
}

.setting-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
}

/* Messages */
.message {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
  z-index: 1000;
  max-width: 400px;
  font-weight: 500;
}

.message.success {
  background-color: var(--success-color);
  color: white;
}

.message.error {
  background-color: var(--error-color);
  color: white;
}

.message.info {
  background-color: var(--primary-color);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-nav {
    flex-direction: column;
    gap: 0.5rem;
  }

  .admin-nav-btn {
    justify-content: center;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .article-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .setting-actions {
    flex-direction: column;
  }
}
</style>
