import ToastService from '@/utils/ToastService';
import StorageService from '@/utils/StorageService';

export default {
  data() {
    return {
      // 全屏状态
      isFullScreen: false,
      previousState: null,
      
      // 自动更新设置
      autoUpdate: true,
      autoUpdateInterval: null,
      currentTime: new Date(),
      
      // 时间戳转日期时间
      timestampInput: '',
      timestampUnit: 'seconds', // 'seconds' 或 'milliseconds'
      localDateTimeResult: '',
      utcDateTimeResult: '',
      isoDateTimeResult: '',
      relativeDateTimeResult: '',
      
      // 日期时间转时间戳
      dateTimeInput: '',
      secondsTimestampResult: '',
      millisecondsTimestampResult: '',
      isoFromDateTimeResult: '',
      unixDateTimeResult: '',
      
      // 常用时间格式
      timeFormats: [
        { name: 'ISO 8601', example: '' },
        { name: 'RFC 2822', example: '' },
        { name: '中国标准格式', example: '' },
        { name: '美国日期格式', example: '' },
        { name: '紧凑型日期', example: '' },
      ],
      
      // 时间计算功能
      baseTimeInput: '',
      endTimeInput: '',
      timeOperation: 'add', // 'add', 'subtract', 'difference'
      timeValue: 1,
      timeUnit: 'days',
      timeOperationResult: '',
      
      // 防抖计时器
      saveStateDebounceTimer: null,
    };
  },

  computed: {
    formattedCurrentTime() {
      const now = this.currentTime;
      const localDate = now.toLocaleDateString();
      const localTime = now.toLocaleTimeString();
      const timestamp = Math.floor(now.getTime() / 1000);
      
      return `${localDate} ${localTime} (${timestamp})`;
    },
    
    // 添加检测结果是否存在的计算属性
    hasTimestampResult() {
      return !!this.localDateTimeResult;
    },
    
    hasDateTimeResult() {
      return !!this.secondsTimestampResult;
    },
    
    // 获取当前时间戳（秒）
    currentTimestamp() {
      return Math.floor(this.currentTime.getTime() / 1000);
    },
    
    // 获取当前时间戳（毫秒）
    currentTimestampMs() {
      return this.currentTime.getTime();
    }
  },
  
  mounted() {
    // 初始化当前时间
    this.getCurrentTime();
    
    // 设置自动更新功能
    if (this.autoUpdate) {
      this.startAutoUpdate();
    }
    
    // 更新时间格式示例
    this.updateTimeFormatExamples();
    
    // 恢复上次的状态
    this.restoreTimestampToolState();
    
    // 添加ESC键监听
    document.addEventListener('keydown', this.handleEscKey);
    
    // 添加窗口关闭前保存状态
    window.addEventListener('beforeunload', this.saveTimestampToolState);
  },
  
  beforeUnmount() {
    // 停止自动更新
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
    
    // 恢复滚动
    if (this.isFullScreen) {
      document.body.style.overflow = '';
    }
    
    // 移除事件监听器
    document.removeEventListener('keydown', this.handleEscKey);
    window.removeEventListener('beforeunload', this.saveTimestampToolState);
    
    // 确保在组件销毁前保存一次状态
    this.saveTimestampToolState();
  },
  
  watch: {
    autoUpdate(newValue) {
      if (newValue) {
        this.startAutoUpdate();
      } else {
        this.stopAutoUpdate();
      }
      
      // 保存状态
      this.debounceSaveState();
    }
  },

  methods: {
    // 获取当前时间
    getCurrentTime() {
      this.currentTime = new Date();
      
      // 如果有打开的时间选择，也更新它们
      if (!this.dateTimeInput) {
        const now = new Date();
        // 调整格式以适应datetime-local输入
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        this.dateTimeInput = `${year}-${month}-${day}T${hours}:${minutes}`;
        this.handleDateTimeInput();
      }
      
      // 更新时间格式示例
      this.updateTimeFormatExamples();
    },
    
    // 开始自动更新
    startAutoUpdate() {
      this.stopAutoUpdate(); // 确保不会创建多个定时器
      this.autoUpdateInterval = setInterval(() => {
        this.getCurrentTime();
      }, 1000);
    },
    
    // 停止自动更新
    stopAutoUpdate() {
      if (this.autoUpdateInterval) {
        clearInterval(this.autoUpdateInterval);
        this.autoUpdateInterval = null;
      }
    },
    
    // 更新时间格式示例
    updateTimeFormatExamples() {
      const now = new Date();
      
      // ISO 8601 格式
      this.timeFormats[0].example = now.toISOString();
      
      // RFC 2822 格式
      this.timeFormats[1].example = now.toUTCString();
      
      // 中国标准格式 (yyyy-MM-dd HH:mm:ss)
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      this.timeFormats[2].example = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      
      // 美国日期格式 (MM/dd/yyyy hh:mm:ss a)
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      const hours12 = (now.getHours() % 12 || 12).toString().padStart(2, '0');
      this.timeFormats[3].example = `${month}/${day}/${year} ${hours12}:${minutes}:${seconds} ${ampm}`;
      
      // 紧凑型日期格式 (yyyyMMddHHmmss)
      this.timeFormats[4].example = `${year}${month}${day}${hours}${minutes}${seconds}`;
    },
    
    // 处理时间戳输入
    handleTimestampInput() {
      try {
        if (!this.timestampInput) {
          this.clearTimestampResults();
          return;
        }
        
        let timestamp = parseInt(this.timestampInput.trim());
        
        // 检查时间戳的有效性
        if (isNaN(timestamp)) {
          throw new Error('Invalid timestamp');
        }
        
        // 根据单位转换为毫秒
        const timestampMs = this.timestampUnit === 'seconds' ? timestamp * 1000 : timestamp;
        
        // 检查时间戳范围
        if (timestampMs < -8640000000000000 || timestampMs > 8640000000000000) {
          throw new Error('Timestamp out of valid range');
        }
        
        const date = new Date(timestampMs);
        
        // 检查日期的有效性
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        
        // 设置结果
        this.localDateTimeResult = this.formatLocalDateTime(date);
        this.utcDateTimeResult = this.formatUTCDateTime(date);
        this.isoDateTimeResult = date.toISOString();
        this.relativeDateTimeResult = this.getRelativeTime(date);
        
        // 保存状态
        this.debounceSaveState();
      } catch (error) {
        console.error('Error processing timestamp:', error);
        this.clearTimestampResults();
        ToastService.error('无效的时间戳');
      }
    },
    
    // 处理日期时间输入
    handleDateTimeInput() {
      try {
        if (!this.dateTimeInput) {
          this.clearDateTimeResults();
          return;
        }
        
        const date = new Date(this.dateTimeInput);
        
        // 检查日期的有效性
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        
        // 设置结果
        this.secondsTimestampResult = Math.floor(date.getTime() / 1000).toString();
        this.millisecondsTimestampResult = date.getTime().toString();
        this.isoFromDateTimeResult = date.toISOString();
        this.unixDateTimeResult = date.toUTCString();
        
        // 保存状态
        this.debounceSaveState();
      } catch (error) {
        console.error('Error processing date:', error);
        this.clearDateTimeResults();
        ToastService.error('无效的日期时间');
      }
    },
    
    // 格式化本地日期时间
    formatLocalDateTime(date) {
      return date.toLocaleString();
    },
    
    // 格式化UTC日期时间
    formatUTCDateTime(date) {
      return date.toUTCString();
    },
    
    // 获取相对时间描述
    getRelativeTime(date) {
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(Math.abs(diffMs) / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      const isPast = diffMs > 0;
      const prefix = isPast ? '前' : '后';
      
      if (diffSecs < 60) {
        return `${diffSecs}秒${prefix}`;
      } else if (diffMins < 60) {
        return `${diffMins}分钟${prefix}`;
      } else if (diffHours < 24) {
        return `${diffHours}小时${prefix}`;
      } else if (diffDays < 30) {
        return `${diffDays}天${prefix}`;
      } else {
        // 超过30天就返回具体日期
        return this.formatLocalDateTime(date);
      }
    },
    
    // 清空时间戳转换结果
    clearTimestampResults() {
      this.localDateTimeResult = '';
      this.utcDateTimeResult = '';
      this.isoDateTimeResult = '';
      this.relativeDateTimeResult = '';
    },
    
    // 清空日期时间转换结果
    clearDateTimeResults() {
      this.secondsTimestampResult = '';
      this.millisecondsTimestampResult = '';
      this.isoFromDateTimeResult = '';
      this.unixDateTimeResult = '';
    },
    
    // 复制转换结果
    copyConversionResult(type) {
      let text = '';
      
      if (type === 'timestamp') {
        // 复制时间戳转换结果
        if (!this.localDateTimeResult) {
          ToastService.warning('没有可以复制的结果');
          return;
        }
        
        text = `本地时间: ${this.localDateTimeResult}\nUTC时间: ${this.utcDateTimeResult}\nISO格式: ${this.isoDateTimeResult}\n相对时间: ${this.relativeDateTimeResult}`;
      } else if (type === 'datetime') {
        // 复制日期时间转换结果
        if (!this.secondsTimestampResult) {
          ToastService.warning('没有可以复制的结果');
          return;
        }
        
        text = `秒级时间戳: ${this.secondsTimestampResult}\n毫秒级时间戳: ${this.millisecondsTimestampResult}\nISO格式: ${this.isoFromDateTimeResult}\nUnix格式: ${this.unixDateTimeResult}`;
      }
      
      this.copyText(text);
    },
    
    // 复制当前时间戳
    copyCurrentTimestamp() {
      const timestamp = this.currentTimestamp; // 使用秒级时间戳
      this.copyText(timestamp.toString());
      ToastService.success('已复制当前时间戳: ' + timestamp);
    },
    
    // 复制文本到剪贴板
    copyText(text) {
      if (!text) {
        ToastService.warning('没有可以复制的内容');
        return;
      }
      
      navigator.clipboard.writeText(text)
        .then(() => {
          ToastService.success('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          ToastService.error('复制失败，请手动复制');
        });
    },
    
    // 检查是否有可复制的内容
    isCopyable(type) {
      if (type === 'timestamp') {
        return !!this.timestampInput;
      } else if (type === 'datetime') {
        return !!this.dateTimeInput;
      }
      return false;
    },
    
    // 清空时间戳输入
    clearTimestampInput() {
      this.timestampInput = '';
      this.clearTimestampResults();
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 清空日期时间输入
    clearDateTimeInput() {
      this.dateTimeInput = '';
      this.clearDateTimeResults();
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 清空所有字段
    clearAllFields() {
      this.clearTimestampInput();
      this.clearDateTimeInput();
      this.clearTimeOperationFields();
      
      ToastService.info('已清空所有字段');
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 使用当前时间作为基准时间
    useCurrentTimeAsBase() {
      const now = new Date();
      const formattedDate = this.formatDateForInput(now);
      this.baseTimeInput = formattedDate;
      
      // 触发计算
      this.calculateTimeOperation();
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 使用当前时间作为结束时间
    useCurrentTimeAsEnd() {
      const now = new Date();
      const formattedDate = this.formatDateForInput(now);
      this.endTimeInput = formattedDate;
      
      // 触发计算
      this.calculateTimeOperation();
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 格式化日期以适应datetime-local输入
    formatDateForInput(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    
    // 清空时间操作相关字段
    clearTimeOperationFields() {
      this.baseTimeInput = '';
      this.endTimeInput = '';
      this.timeValue = 1;
      this.timeOperationResult = '';
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 计算时间操作
    calculateTimeOperation() {
      try {
        if (this.timeOperation === 'difference') {
          this.calculateTimeDifference();
        } else {
          this.calculateTimeAddSubtract();
        }
        
        // 保存状态
        this.debounceSaveState();
      } catch (error) {
        console.error('Error in time operation:', error);
        this.timeOperationResult = '计算错误，请检查输入';
      }
    },
    
    // 计算时间差
    calculateTimeDifference() {
      if (!this.baseTimeInput || !this.endTimeInput) {
        this.timeOperationResult = '';
        return;
      }
      
      const startDate = new Date(this.baseTimeInput);
      const endDate = new Date(this.endTimeInput);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date');
      }
      
      const diffMs = endDate - startDate;
      const diffSeconds = Math.floor(Math.abs(diffMs) / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      const sign = diffMs >= 0 ? '' : '-';
      
      const remainingHours = diffHours % 24;
      const remainingMinutes = diffMinutes % 60;
      const remainingSeconds = diffSeconds % 60;
      
      this.timeOperationResult = `${sign}${diffDays}天 ${remainingHours}小时 ${remainingMinutes}分钟 ${remainingSeconds}秒`;
    },
    
    // 计算时间加减
    calculateTimeAddSubtract() {
      if (!this.baseTimeInput || !this.timeValue) {
        this.timeOperationResult = '';
        return;
      }
      
      const date = new Date(this.baseTimeInput);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      const value = parseInt(this.timeValue);
      
      if (isNaN(value)) {
        throw new Error('Invalid value');
      }
      
      // 根据操作和单位调整日期
      const isAdd = this.timeOperation === 'add';
      const multiplier = isAdd ? 1 : -1;
      
      switch (this.timeUnit) {
        case 'minutes':
          date.setMinutes(date.getMinutes() + value * multiplier);
          break;
        case 'hours':
          date.setHours(date.getHours() + value * multiplier);
          break;
        case 'days':
          date.setDate(date.getDate() + value * multiplier);
          break;
        case 'weeks':
          date.setDate(date.getDate() + value * 7 * multiplier);
          break;
        case 'months':
          date.setMonth(date.getMonth() + value * multiplier);
          break;
        case 'years':
          date.setFullYear(date.getFullYear() + value * multiplier);
          break;
      }
      
      // 格式化结果
      this.timeOperationResult = this.formatLocalDateTime(date);
    },
    
    // 全屏相关方法
    toggleFullScreen() {
      if (this.isFullScreen) {
        this.exitFullScreen();
      } else {
        this.enterFullScreen();
      }
      
      // 保存状态
      this.debounceSaveState();
    },
    
    enterFullScreen() {
      // 保存当前状态
      this.previousState = {
        containerRect: this.$el.getBoundingClientRect()
      };
      
      // 防止滚动
      document.body.style.overflow = 'hidden';
      
      // 应用进入全屏前的初始缩小状态
      requestAnimationFrame(() => {
        // 先添加临时类实现初始缩小状态
        this.$el.classList.add('entering-fullscreen');
        this.$el.style.transform = 'scale(0.92)';
        this.$el.style.opacity = '0.8';
        
        // 强制重绘
        void this.$el.offsetWidth;
        
        // 启动进入动画
        setTimeout(() => {
          // 移除初始类，添加全屏类，实现放大动画
          this.$el.classList.remove('entering-fullscreen');
          this.$el.style.transform = '';
          this.$el.style.opacity = '';
          this.isFullScreen = true;
          
          // 通知用户
          ToastService.info('已进入全屏模式');
        }, 30);
      });
    },
    
    exitFullScreen() {
      // 恢复滚动
      document.body.style.overflow = '';
      
      // 应用退出动画
      requestAnimationFrame(() => {
        // 添加退出动画类
        this.$el.classList.add('exiting-fullscreen');
        
        // 改变状态，移除全屏标记
        this.isFullScreen = false;
        
        // 动画完成后清理
        setTimeout(() => {
          this.$el.classList.remove('exiting-fullscreen');
          
          // 通知用户
          ToastService.info('已退出全屏模式');
        }, 450);
      });
    },
    
    // ESC键处理函数
    handleEscKey(event) {
      if (event.key === 'Escape' && this.isFullScreen) {
        this.exitFullScreen();
      }
    },
    
    // 使用防抖保存状态
    debounceSaveState() {
      if (this.saveStateDebounceTimer) {
        clearTimeout(this.saveStateDebounceTimer);
      }
      
      this.saveStateDebounceTimer = setTimeout(() => {
        this.saveTimestampToolState();
      }, 500); // 500ms防抖延迟
    },
    
    // 保存时间戳工具的状态
    saveTimestampToolState() {
      const timestampToolState = {
        autoUpdate: this.autoUpdate,
        timestampInput: this.timestampInput,
        timestampUnit: this.timestampUnit,
        dateTimeInput: this.dateTimeInput,
        baseTimeInput: this.baseTimeInput,
        endTimeInput: this.endTimeInput,
        timeOperation: this.timeOperation,
        timeValue: this.timeValue,
        timeUnit: this.timeUnit,
        isFullScreen: this.isFullScreen
      };
      
      // 保存状态
      StorageService.updateSection('timestampTool', timestampToolState);
    },
    
    // 恢复时间戳工具的状态
    restoreTimestampToolState() {
      const savedState = StorageService.getSection('timestampTool');
      
      if (savedState) {
        // 恢复自动更新设置
        if (typeof savedState.autoUpdate === 'boolean') {
          this.autoUpdate = savedState.autoUpdate;
        }
        
        // 恢复时间戳输入
        if (typeof savedState.timestampInput === 'string') {
          this.timestampInput = savedState.timestampInput;
        }
        
        // 恢复时间戳单位
        if (savedState.timestampUnit) {
          this.timestampUnit = savedState.timestampUnit;
        }
        
        // 恢复日期时间输入
        if (typeof savedState.dateTimeInput === 'string') {
          this.dateTimeInput = savedState.dateTimeInput;
        }
        
        // 恢复时间计算输入
        if (typeof savedState.baseTimeInput === 'string') {
          this.baseTimeInput = savedState.baseTimeInput;
        }
        
        if (typeof savedState.endTimeInput === 'string') {
          this.endTimeInput = savedState.endTimeInput;
        }
        
        if (savedState.timeOperation) {
          this.timeOperation = savedState.timeOperation;
        }
        
        if (typeof savedState.timeValue === 'number') {
          this.timeValue = savedState.timeValue;
        }
        
        if (savedState.timeUnit) {
          this.timeUnit = savedState.timeUnit;
        }
        
        // 恢复全屏状态
        if (savedState.isFullScreen) {
          // 延迟进入全屏，确保内容已渲染
          setTimeout(() => {
            this.enterFullScreen();
          }, 300);
        }
        
        // 处理输入以更新结果
        if (this.timestampInput) {
          this.handleTimestampInput();
        }
        
        if (this.dateTimeInput) {
          this.handleDateTimeInput();
        }
        
        if ((this.baseTimeInput && this.timeOperation !== 'difference') || 
            (this.baseTimeInput && this.endTimeInput && this.timeOperation === 'difference')) {
          this.calculateTimeOperation();
        }
      }
    }
  }
};
