import { reactive } from 'vue';

// 创建一个响应式状态存储 toast 状态
const state = reactive({
  queue: [], // 消息队列
  visibleToasts: [], // 当前可见的消息
  nextId: 0, // 用于生成唯一ID
});

// 默认配置 - 调整为更适合 VisionOS 风格的配置
const defaultOptions = {
  duration: 4000, // VisionOS 风格倾向于稍长的显示时间
  type: 'info', // 消息类型：info, success, warning, error
  position: 'top', // 位置：top, bottom
  preventDuplicates: true, // 防止重复消息
};

export default {
  // 向队列添加消息
  show(message, options = {}) {
    // 如果启用防止重复且消息已存在，则不添加新消息
    if (options.preventDuplicates !== false && 
        state.visibleToasts.some(t => t.message === message && t.type === (options.type || defaultOptions.type))) {
      return -1;
    }
    
    const id = state.nextId++;
    const toast = {
      id,
      message,
      ...defaultOptions,
      ...options,
      visible: true,
      createdAt: Date.now(),
    };
    
    // 添加到队列
    state.queue.push(toast);
    
    // 添加到可见列表
    state.visibleToasts.push(toast);
    
    // 设置超时自动关闭
    setTimeout(() => {
      this.hide(id);
    }, toast.duration);
    
    return id;
  },
  
  // 隐藏指定ID的消息
  hide(id) {
    const index = state.visibleToasts.findIndex(toast => toast.id === id);
    if (index !== -1) {
      state.visibleToasts.splice(index, 1);
    }
  },
  
  // 快捷方法：成功消息
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  },
  
  // 快捷方法：错误消息
  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error' });
  },
  
  // 快捷方法：警告消息
  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning' });
  },
  
  // 快捷方法：信息消息
  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  },
  
  // 获取当前可见消息列表
  getVisibleToasts() {
    return state.visibleToasts;
  },
  
  // 清除所有消息
  clear() {
    state.visibleToasts.length = 0;
  }
};
