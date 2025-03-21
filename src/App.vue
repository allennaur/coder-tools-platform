<template>
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <!-- 添加全局Toast组件 -->
  <Toast />
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Toast from './components/common/Toast.vue'
import ToastService from './utils/ToastService'

export default {
  name: 'App',
  components: {
    HelloWorld,
    Toast
  },
  data() {
    return {
      toast: ToastService
    }
  },
  provide() {
    return {
      toast: this.toast // 提供toast服务给所有子组件
    }
  },
  mounted() {
    // 确保ToastService可全局访问
    window.$toast = ToastService;
  }
}
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', sans-serif; /* 使用苹果标准字体 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #333; /* 标准文本颜色 */
  margin: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(230,230,245,0.7) 0%, rgba(220,220,240,0.6) 100%); /* 添加全局背景 */
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}

/* 添加全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

/* 修改 VisionOS 风格的焦点效果，去除不美观的默认边框 */
:focus {
  outline: none;
}

button:focus, textarea:focus, input:focus, [role="button"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  transition: box-shadow 0.2s ease;
}

/* 使用更细微、更符合 VisionOS 风格的焦点效果 */
.visionos-focus:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  transition: box-shadow 0.2s ease;
}

/* 优化可点击元素的交互效果 */
button, [role="button"] {
  transition: all 0.2s ease;
  outline: none; /* 移除默认轮廓 */
}

button:active, [role="button"]:active {
  transform: scale(0.98);
}

/* 添加全局输入框样式，确保所有工具中输入区域表现一致 */
input, textarea, select {
  box-sizing: border-box;
}

.panel-content {
  overflow: hidden;
  position: relative;
}

/* 确保flex容器中的子元素正确缩放 */
.flex-container {
  display: flex;
  min-width: 0;
  min-height: 0;
}

.flex-item {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

/* 优化输入容器的边界显示 */
.input-container {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 确保滚动容器不会意外溢出 */
.scroll-container {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}

/* 全局日期选择器和下拉菜单美化 - VisionOS风格 */
input[type="datetime-local"],
select {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

input[type="datetime-local"]:focus,
select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

/* 美化日历图标 */
::-webkit-calendar-picker-indicator {
  filter: opacity(0.6);
  transition: filter 0.2s ease;
}

::-webkit-calendar-picker-indicator:hover {
  filter: opacity(1);
  cursor: pointer;
}

/* 美化下拉箭头 */
select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 30px;
}
</style>
