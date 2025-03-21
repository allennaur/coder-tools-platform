import { createApp } from 'vue'
import App from './App.vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import ToastService from './utils/ToastService'

const app = createApp(App)

// 添加全局访问
app.config.globalProperties.$toast = ToastService

// 暴露给window对象，方便全局访问
window.$toast = ToastService

app.mount('#app')
