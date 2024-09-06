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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.id) {
    authStore.loadId();
  }

  if (authStore.id && to.name === 'login') {
    next({ name: 'home' });
  } else if (!authStore.id && to.name !== 'login') {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router
