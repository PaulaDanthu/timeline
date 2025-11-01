import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import InteractiveTimeline from '../pages/InteractiveTimeline.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
   {
    path: '/histoire-lumiere',
    name: 'HistoireLumiere',
    component: InteractiveTimeline
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
