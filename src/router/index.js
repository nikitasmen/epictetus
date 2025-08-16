// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'Epictetus EE Team - Home'
    }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/NewsView.vue'),
    meta: {
      title: 'News - Epictetus EE Team'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: 'Login - Epictetus EE Team'
    }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/SignupView.vue'),
    meta: {
      title: 'Sign Up - Epictetus EE Team'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/ContactView.vue'),
    meta: {
      title: 'Contact Us - Epictetus EE Team'
    }
  },
  {
    path: '/library',
    name: 'Library',
    component: () => import('../views/LibraryView.vue'),
    meta: {
      title: 'E-Library - Epictetus EE Team'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: {
      title: 'Admin Panel - Epictetus EE Team',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found - Epictetus EE Team'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // If there's a saved position (back/forward navigation), use it
    if (savedPosition) {
      return savedPosition
    }
    // If navigating to an anchor, scroll to it
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    // Otherwise scroll to top
    return { top: 0, behavior: 'smooth' }
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Check authentication for protected routes
  if (to.meta.requiresAuth) {
    // Import auth store dynamically to avoid circular dependency
    import('../stores/auth.js').then(({ useAuthStore }) => {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
        return
      }
      
      if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next({ name: 'Home' })
        return
      }
      
      next()
    })
  } else {
    next()
  }
  // Add loading state or authentication checks here if needed
  next()
})

router.afterEach((to, from) => {
  // Analytics tracking, cleanup, etc.
  console.log(`Navigated from ${from.name || 'unknown'} to ${to.name}`)
})

export default router