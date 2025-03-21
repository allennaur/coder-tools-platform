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
      toast: this.toast
    }
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
</style>
