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

.toast-message {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin: 8px 0;
  max-width: 80%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  pointer-events: auto;
}

.toast-success {
  background: rgba(38, 166, 91, 0.9);
}

.toast-error {
  background: rgba(235, 59, 90, 0.9);
}

.toast-warning {
  background: rgba(255, 159, 67, 0.9);
}

.toast-info {
  background: rgba(0, 122, 255, 0.9);
}

.toast-icon {
  font-size: 16px;
}

/* 动画效果 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
