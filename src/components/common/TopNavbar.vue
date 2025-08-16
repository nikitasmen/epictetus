<template>
  <nav class="top-navbar" :class="navbarClasses">
    <div class="navbar-container">
      <!-- Brand/Logo Section -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <img 
            v-if="logoSrc" 
            :src="logoSrc" 
            :alt="brandName" 
            class="brand-logo"
          >
          <span class="brand-text">{{ brandName }}</span>
        </router-link>
      </div>

      <!-- Desktop Navigation Links -->
      <div class="navbar-nav desktop-nav">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'nav-link--active': isActiveRoute(item.path) }"
        >
          <span v-if="item.icon" class="nav-icon">{{ item.icon }}</span>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>

        <!-- Admin Badge -->
        <span v-if="authStore.isAdmin" class="admin-badge">
          👨‍💼 Admin
        </span>

        <!-- User Menu -->
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <button class="user-button" @click="toggleUserMenu">
            <span class="user-avatar">{{ userInitials }}</span>
            <span class="user-name">{{ authStore.userName }}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          
          <div v-if="isUserMenuOpen" class="user-dropdown">
            <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item" @click="closeUserMenu">
              ⚙️ Admin Panel
            </router-link>
            <button class="dropdown-item logout-btn" @click="handleLogout">
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Toggle navigation menu"
      >
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'active': isMobileMenuOpen }"></span>
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    <div class="mobile-nav" :class="{ 'mobile-nav--open': isMobileMenuOpen }">
      <!-- User Info in Mobile Menu -->
      <div v-if="authStore.isAuthenticated" class="mobile-user-info">
        <div class="mobile-user-avatar">{{ userInitials }}</div>
        <div class="mobile-user-details">
          <span class="mobile-user-name">{{ authStore.userName }}</span>
          <span v-if="authStore.isAdmin" class="mobile-admin-badge">Admin</span>
        </div>
      </div>

      <router-link
        v-for="item in navigationItems"
        :key="item.path"
        :to="item.path"
        class="mobile-nav-link"
        :class="{ 'mobile-nav-link--active': isActiveRoute(item.path) }"
        @click="closeMobileMenu"
      >
        <span v-if="item.icon" class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.name }}</span>
      </router-link>

      <!-- Admin Link in Mobile -->
      <router-link 
        v-if="authStore.isAdmin" 
        to="/admin" 
        class="mobile-nav-link admin-link"
        @click="closeMobileMenu"
      >
        <span class="nav-icon">⚙️</span>
        <span class="nav-text">Admin Panel</span>
      </router-link>

      <!-- Logout Button in Mobile -->
      <button 
        v-if="authStore.isAuthenticated" 
        class="mobile-nav-link logout-btn"
        @click="handleLogout"
      >
        <span class="nav-icon">🚪</span>
        <span class="nav-text">Logout</span>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

// Stores
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Props
const props = defineProps({
  navigationItems: {
    type: Array,
    required: true
  },
  logoSrc: {
    type: String,
    default: ''
  },
  brandName: {
    type: String,
    default: 'Brand'
  },
  sticky: {
    type: Boolean,
    default: true
  },
  transparent: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'minimal', 'accent'].includes(value)
  }
})

// Reactive state
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const isScrolled = ref(false)

// Computed properties
const navbarClasses = computed(() => [
  'top-navbar',
  `top-navbar--${props.variant}`,
  {
    'top-navbar--sticky': props.sticky,
    'top-navbar--transparent': props.transparent && !isScrolled.value,
    'top-navbar--scrolled': isScrolled.value,
    'top-navbar--mobile-open': isMobileMenuOpen.value
  }
])

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  
  // Prevent body scroll when mobile menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// User menu methods
const userInitials = computed(() => {
  if (!authStore.userName) return 'U'
  return authStore.userName.split(' ').map(name => name[0]).join('').toUpperCase()
})

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = async () => {
  closeUserMenu()
  closeMobileMenu()
  authStore.logout()
  await router.push('/')
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Close mobile menu on route change
  closeMobileMenu()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})

// Watch for route changes to close mobile menu
import { watch } from 'vue'
watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<style scoped>
.top-navbar {
  position: relative;
  background-color: var(--background-primary, #ffffff);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  transition: all 0.3s ease;
  z-index: 1000;
}

.top-navbar--sticky {
  position: sticky;
  top: 0;
}

.top-navbar--transparent {
  background-color: transparent;
  border-bottom-color: transparent;
}

.top-navbar--scrolled {
  background-color: var(--background-primary, #ffffff);
  border-bottom-color: var(--border-color, #e5e7eb);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.top-navbar--accent {
  background-color: var(--primary-color, #3b82f6);
  border-bottom-color: var(--primary-dark, #2563eb);
}

.top-navbar--accent .brand-text,
.top-navbar--accent .nav-text {
  color: white;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Brand/Logo */
.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  font-weight: 600;
}

.brand-logo {
  height: 32px;
  width: auto;
  margin-right: 0.5rem;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary, #1f2937);
  transition: color 0.3s ease;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--primary-color, #3b82f6);
  background-color: var(--background-secondary, #f9fafb);
}

.nav-link--active {
  color: var(--primary-color, #3b82f6);
  font-weight: 600;
}

.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background-color: var(--primary-color, #3b82f6);
  border-radius: 1px;
}

.nav-icon {
  font-size: 1rem;
}

.nav-text {
  font-size: 0.875rem;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 0.375rem;
  transition: background-color 0.3s ease;
}

.mobile-menu-toggle:hover {
  background-color: var(--background-secondary, #f9fafb);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background-color: var(--text-primary, #1f2937);
  transition: all 0.3s ease;
  margin: 2px 0;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile Navigation */
.mobile-nav {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--background-primary, #ffffff);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  padding: 1rem;
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;
}

.mobile-nav--open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
  margin-bottom: 0.25rem;
}

.mobile-nav-link:hover,
.mobile-nav-link--active {
  color: var(--primary-color, #3b82f6);
  background-color: var(--background-secondary, #f9fafb);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .navbar-container {
    padding: 0 1rem;
  }

  .brand-text {
    font-size: 1.1rem;
  }

  .brand-logo {
    height: 28px;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 0.75rem;
    height: 56px;
  }

  .brand-text {
    font-size: 1rem;
  }

  .brand-logo {
    height: 24px;
  }
}

/* User Menu Styles */
.admin-badge {
  background-color: var(--success-color, #4CAF50);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 1rem;
}

.user-menu {
  position: relative;
  margin-left: 1rem;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.3s ease;
}

.user-button:hover {
  background-color: var(--background-secondary, #f9fafb);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--primary-color, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary, #1f2937);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
  transition: transform 0.3s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--background-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1000;
  overflow: hidden;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-primary, #1f2937);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: var(--background-secondary, #f9fafb);
}

.logout-btn {
  color: var(--error-color, #ef4444);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

/* Mobile User Info */
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  margin-bottom: 0.5rem;
}

.mobile-user-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary-color, #3b82f6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.mobile-user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-user-name {
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.mobile-admin-badge {
  background-color: var(--success-color, #4CAF50);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.625rem;
  font-weight: 600;
  align-self: flex-start;
}

.admin-link {
  background-color: var(--success-color, #4CAF50) !important;
  color: white !important;
}

.admin-link:hover {
  background-color: var(--success-dark, #388e3c) !important;
}

.mobile-nav-link.logout-btn {
  background: none;
  border: none;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 0.5rem;
  color: var(--error-color, #ef4444);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .top-navbar {
    background-color: var(--background-primary-dark, #1f2937);
    border-bottom-color: var(--border-color-dark, #374151);
  }

  .brand-text {
    color: var(--text-primary-dark, #f9fafb);
  }

  .nav-link {
    color: var(--text-secondary-dark, #d1d5db);
  }

  .nav-link:hover {
    background-color: var(--background-secondary-dark, #374151);
  }

  .hamburger-line {
    background-color: var(--text-primary-dark, #f9fafb);
  }

  .mobile-nav {
    background-color: var(--background-primary-dark, #1f2937);
    border-bottom-color: var(--border-color-dark, #374151);
  }

  .mobile-nav-link {
    color: var(--text-secondary-dark, #d1d5db);
  }

  .mobile-nav-link:hover,
  .mobile-nav-link--active {
    background-color: var(--background-secondary-dark, #374151);
  }
}
</style>
