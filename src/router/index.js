import App from '@/App.vue'
import LoginView from '@/views/LoginView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: NotFoundView
  }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Wait for the ID to be loaded from localStorage if it's not already loaded
  if (!authStore.id) {
    await authStore.loadId();
  }

  // Perform the redirection based on the authentication status and target route
  if (authStore.id && to.name === 'login') {
    next({ name: 'home' });
  } else if (!authStore.id && to.name !== 'login') {
    next({ name: 'login' });
  } else {
    next(); // Proceed to the route
  }
});

export default router
