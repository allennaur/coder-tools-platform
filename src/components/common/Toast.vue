<template>
  <div class="toast-container" :class="positionClass">
    <transition-group name="toast">
      <div
        v-for="toast in visibleToasts"
        :key="toast.id"
        class="toast-message"
        :class="['toast-' + toast.type]"
      >
        <i :class="getIconClass(toast.type)" class="toast-icon"></i>
        <span>{{ toast.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script>
import ToastService from '@/utils/ToastService';
import { computed } from 'vue';

export default {
  name: 'Toast',
  setup() {
    // 获取当前可见的消息
    const visibleToasts = computed(() => ToastService.getVisibleToasts());
    
    // 根据位置计算CSS类
    const positionClass = computed(() => {
      const positions = new Set(visibleToasts.value.map(toast => toast.position || 'top'));
      return Array.from(positions).map(pos => `position-${pos}`);
    });
    
    // 获取图标类名
    const getIconClass = (type) => {
      switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-times-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'info': return 'fas fa-info-circle';
        default: return 'fas fa-info-circle';
      }
    };
    
    return {
      visibleToasts,
      positionClass,
      getIconClass,
    };
  },
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  pointer-events: none;
}

.position-top {
  top: 20px;
}

.position-bottom {
  bottom: 20px;
}

/* VisionOS 样式的 Toast 消息 - 调整了尺寸比例 */
.toast-message {
  background: rgba(255, 255, 255, 0.6);
  color: #333;
  padding: 12px 20px;
  border-radius: 16px; /* 调整为更圆润的边角 */
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  margin: 8px 0;
  max-width: 400px; /* 设置最大宽度，保持合适的阅读宽度 */
  width: auto; /* 宽度由内容决定，但不超过最大宽度 */
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  pointer-events: auto;
  transform-origin: center;
}

/* 不同类型的 Toast 样式 - 移除了左侧色块，使用调色点 */
.toast-success .toast-icon {
  color: #34c759;
}

.toast-error .toast-icon {
  color: #ff3b30;
}

.toast-warning .toast-icon {
  color: #ff9500;
}

.toast-info .toast-icon {
  color: #007aff;
}

.toast-icon {
  font-size: 18px;
  min-width: 24px; /* 使用min-width确保图标有一致的空间 */
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px; /* 为图标添加一点右侧边距 */
}

/* VisionOS 风格的动画效果 */
.toast-enter-active {
  animation: toast-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-leave-active {
  animation: toast-out 0.3s cubic-bezier(0.6, -0.28, 0.74, 0.05);
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
    filter: blur(8px);
  }
  50% {
    opacity: 1;
    transform: translateY(5px) scale(1.02);
    filter: blur(0);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
    filter: blur(4px);
  }
}

/* 媒体查询：适配移动设备 */
@media (max-width: 768px) {
  .toast-message {
    max-width: 90%;
    width: auto;
    min-width: 200px; /* 确保移动端有最小宽度 */
    font-size: 13px;
    padding: 10px 16px;
  }
}

/* 添加深色模式支持 */
@media (prefers-color-scheme: dark) {
  .toast-message {
    background: rgba(50, 50, 50, 0.75);
    color: #f5f5f7;
    border: 1px solid rgba(100, 100, 100, 0.3);
  }
  
  .toast-success {
    background: rgba(25, 55, 25, 0.85);
  }
  
  .toast-error {
    background: rgba(55, 25, 25, 0.85);
  }
  
  .toast-warning {
    background: rgba(55, 45, 25, 0.85);
  }
  
  .toast-info {
    background: rgba(25, 25, 55, 0.85);
  }
}
</style>
