import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import { Quasar, Notify, Loading, ClosePopup, Dialog } from 'quasar'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
app.use(pinia)
app.use(router)
app.use(Quasar, {
  plugins: {
    Notify,
    Loading,
    Dialog,
  },
  config: {
    brand: {
      primary: '#21dc1c',      // Main vibrant green
      secondary: '#16a50f',    // Darker green for contrast
      accent: '#7ef078',       // Light green accent
      dark: '#0d4d0a',         // Very dark green
      'dark-page': '#1a1a1a',  // Dark background
      positive: '#21dc1c',     // Success green (same as primary)
      negative: '#dc1c21',     // Red (complementary color)
      info: '#1c9edc',         // Blue for information
      warning: '#dcb81c',      // Yellow-orange for warnings
      black: '#000',
      white: '#fff',
    },
  },
  directives: { ClosePopup },
})
app.mount('#app')
