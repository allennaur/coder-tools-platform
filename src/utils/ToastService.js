let toastQueue = [];
let nextId = 1;
let isToastCreated = false;

const ToastService = {
  /**
   * 显示一个提示信息
   * @param {string} message 提示内容
   * @param {string} type 提示类型：success, error, warning, info
   * @param {Object} options 其他选项
   */
  show(message, type = 'info', options = {}) {
    const toast = {
      id: nextId++,
      message,
      type,
      position: options.position || 'top',
      timeout: options.timeout !== undefined ? options.timeout : 3000
    };
    
    toastQueue.push(toast);
    this._notifyListeners();
    
    if (toast.timeout > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.timeout);
    }
    
    return toast.id;
  },
  
  /**
   * 显示成功提示
   * @param {string} message 提示内容
   * @param {Object} options 其他选项
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  },
  
  /**
   * 显示错误提示
   * @param {string} message 提示内容
   * @param {Object} options 其他选项
   */
  error(message, options = {}) {
    return this.show(message, 'error', options);
  },
  
  /**
   * 显示警告提示
   * @param {string} message 提示内容
   * @param {Object} options 其他选项
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  },
  
  /**
   * 显示信息提示
   * @param {string} message 提示内容
   * @param {Object} options 其他选项
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  },
  
  /**
   * 移除指定的提示
   * @param {number} id 提示ID
   */
  remove(id) {
    const index = toastQueue.findIndex(toast => toast.id === id);
    if (index !== -1) {
      toastQueue.splice(index, 1);
      this._notifyListeners();
    }
  },
  
  /**
   * 获取当前可见的提示列表
   * @returns {Array} 提示列表
   */
  getVisibleToasts() {
    return [...toastQueue];
  },
  
  /**
   * 清空所有提示
   */
  clearAll() {
    toastQueue = [];
    this._notifyListeners();
  },
  
  // 私有方法，通知监听器
  _notifyListeners() {
    if (window && !isToastCreated) {
      // 将ToastService暴露为全局可访问
      window.$toast = this;
      isToastCreated = true;
    }
    
    // 这里可以添加其他通知机制，如事件发射等
  }
};

export default ToastService;
