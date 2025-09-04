import { createRouter, createWebHistory } from 'vue-router'
import CloudFileListView from "@/views/CloudFileListView.vue";
import AlbumListView from "@/views/AlbumListView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CloudFileListView,
    },
    {
      path: '/albums',
      name: 'albums',
      component: AlbumListView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/memories',
      name: 'memories',
      component: () => import('@/views/MemoriesView.vue')
    }
  ],
})

export default router
