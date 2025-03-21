import { createApp } from 'vue'
import App from './App.vue'
import '@fortawesome/fontawesome-free/css/all.min.css'
import ToastService from './utils/ToastService'

// 添加全局错误处理，避免不必要的sockjs连接错误显示在控制台
window.addEventListener('error', (event) => {
  // 过滤掉sockjs相关的连接错误
  if (event.filename && (
      event.filename.includes('sockjs-node') || 
      event.message.includes('sockjs-node')
    )) {
    event.preventDefault();
    return false;
  }
  return true;
});

// 也可以抑制某些请求错误
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.toString().includes('sockjs-node')) {
    // 返回一个永不解决的Promise，避免执行失败的WebSocket连接
    return new Promise(() => {});
  }
  return originalFetch(url, options);
};

const app = createApp(App)

// 添加全局访问
app.config.globalProperties.$toast = ToastService

// 暴露给window对象，方便全局访问
window.$toast = ToastService

app.mount('#app')

// 抑制特定的控制台错误信息
const originalConsoleError = console.error;
console.error = function(...args) {
  const errorMsg = args.join(' ');
  if (errorMsg.includes('sockjs-node') || errorMsg.includes('WebSocket connection')) {
    // 不显示WebSocket连接相关的错误
    return;
  }
  originalConsoleError.apply(console, args);
};
