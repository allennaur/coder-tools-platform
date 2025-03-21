/**
 * 本地存储服务
 * 负责处理应用状态的持久化和恢复
 */
const STORAGE_KEY = 'coder-tools-platform-state';

const StorageService = {
  /**
   * 保存应用状态到localStorage
   * @param {Object} state 应用状态对象
   */
  saveState(state) {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (error) {
      console.error('无法保存状态到localStorage:', error);
    }
  },

  /**
   * 从localStorage加载应用状态
   * @returns {Object|null} 恢复的状态对象，如果没有则返回null
   */
  loadState() {
    try {
      const serializedState = localStorage.getItem(STORAGE_KEY);
      if (serializedState === null) {
        return null;
      }
      return JSON.parse(serializedState);
    } catch (error) {
      console.error('无法从localStorage加载状态:', error);
      return null;
    }
  },

  /**
   * 更新应用状态中的某个部分
   * @param {String} section 部分名称
   * @param {Object} sectionState 该部分的状态对象
   */
  updateSection(section, sectionState) {
    try {
      const currentState = this.loadState() || {};
      currentState[section] = sectionState;
      this.saveState(currentState);
    } catch (error) {
      console.error(`无法更新${section}部分的状态:`, error);
    }
  },

  /**
   * 获取应用状态中的某个部分
   * @param {String} section 部分名称
   * @returns {Object|null} 该部分的状态对象，如果没有则返回null
   */
  getSection(section) {
    try {
      const currentState = this.loadState() || {};
      return currentState[section] || null;
    } catch (error) {
      console.error(`无法获取${section}部分的状态:`, error);
      return null;
    }
  },

  /**
   * 清除所有存储的状态
   */
  clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('无法清除状态:', error);
    }
  }
};

export default StorageService;
