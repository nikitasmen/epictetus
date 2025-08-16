<template>
  <div class="page-container">
    <!-- Header Section -->
    <PageHeader
      title="Latest News & Updates"
      description="Stay informed with the latest developments, insights, and announcements from the Epictetus EE Team"
      :breadcrumbs="breadcrumbs"
      :showBreadcrumbs="true"
    />

    <!-- Filter Section -->
    <FilterSection
      :categories="filterCategories"
      :defaultCategory="'all'"
      :showSearch="true"
      searchPlaceholder="Search news..."
      :showSort="true"
      :sortOptions="sortOptions"
      :showViewToggle="true"
      @update:category="handleCategoryChange"
      @update:search="handleSearchChange"
      @update:sort="handleSortChange"
      @update:view="handleViewChange"
    />

    <!-- News Grid -->
    <div v-if="filteredArticles.length > 0" :class="['news-container', `news-container--${currentView}`]">
      <NewsCard
        v-for="article in filteredArticles"
        :key="article.id"
        :article="transformArticleData(article)"
        :variant="currentView === 'list' ? 'compact' : 'default'"
        :layout="currentView === 'list' ? 'horizontal' : 'vertical'"
        :isArticleLiked="article.isLiked"
        :isSaved="article.isSaved"
        @read="handleArticleRead"
        @save="handleArticleSave"
        @unsave="handleArticleUnsave"
        @like="handleArticleLike"
        @unlike="handleArticleUnlike"
        @share="handleArticleShare"
        @view-source="handleViewSource"
        @topic-click="handleTopicClick"
      />
    </div>

    <!-- Load More Button -->
    <div class="load-more-section" v-if="hasMoreArticles && filteredArticles.length > 0">
      <AppButton
        variant="outline"
        size="large"
        @click="loadMore"
        :loading="loadingMore"
      >
        Load More Articles
      </AppButton>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📰</div>
      <h3>No articles found</h3>
      <p>Try adjusting your search or filter criteria</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNewsStore } from '@/stores/news.js'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterSection from '@/components/common/FilterSection.vue'
import NewsCard from '@/components/news/NewsCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs.js'

// Stores
const newsStore = useNewsStore()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('all')
const currentView = ref('grid')
const currentSort = ref('')
const hasMoreArticles = ref(true)
const loadingMore = ref(false)

// Navigation breadcrumbs
const { breadcrumbs } = useBreadcrumbs('News')

// Get data from store
const filterCategories = computed(() => newsStore.categories)
const articles = computed(() => newsStore.articles)

// Sort options for FilterSection component
const sortOptions = ref([
  { value: 'date', label: 'Latest First' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'author', label: 'Author A-Z' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' }
])

// Computed properties
const filteredArticles = computed(() => {
  if (searchQuery.value) {
    return newsStore.searchArticles(searchQuery.value, selectedCategory.value)
  }
  return newsStore.articlesByCategory(selectedCategory.value)
})

// Methods
const transformArticleData = (article) => {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    content: article.content,
    author: article.author,
    category: article.category,
    publishedDate: article.publishedDate,
    imageUrl: article.imageUrl,
    tags: article.tags,
    readTime: article.readTime,
    views: article.views,
    likes: article.likes,
    featured: article.featured,
    isBreaking: false,
    isTrending: article.featured,
    topics: article.tags.slice(0, 2),
    contentTypes: article.featured ? ['featured'] : []
  }
}

const handleCategoryChange = (category) => {
  selectedCategory.value = category
}

const handleSearchChange = (query) => {
  searchQuery.value = query
}

const handleSortChange = (sortOption) => {
  currentSort.value = sortOption
}

const handleViewChange = (view) => {
  currentView.value = view
}

const handleArticleRead = (article) => {
  // Increment views in store
  newsStore.incrementViews(article.id)
}

const handleArticleSave = (article) => {
  // Handle article save logic - could be stored in user preferences
  console.log('Article saved:', article.title)
}

const handleArticleUnsave = (article) => {
  // Handle article unsave logic
  console.log('Article unsaved:', article.title)
}

const handleArticleLike = (article) => {
  // Handle article like logic
  newsStore.likeArticle(article.id)
}

const handleArticleUnlike = (article) => {
  // Handle article unlike logic - would need to track user preferences
  console.log('Article unliked:', article.title)
}

const handleArticleShare = (shareData) => {
  // Handle article sharing logic
  console.log('Article shared:', shareData)
}

const handleViewSource = (article) => {
  // Handle view source logic
  console.log('View source for:', article.title)
}

const handleTopicClick = (topic) => {
  // Handle topic click logic
}

const loadMore = async () => {
  loadingMore.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  hasMoreArticles.value = false
  loadingMore.value = false
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.news-container {
  margin-top: 2rem;
}

.news-container--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.news-container--list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .news-container--grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 0.5rem;
  }
}
</style>