import ToastService from '@/utils/ToastService';
import StorageService from '@/utils/StorageService';

export default {
  data() {
    return {
      firstString: '',
      secondString: '',
      resultLines: [],
      isFullScreen: false,
      previousState: null,
      saveStateDebounceTimer: null,
      selectedOperation: 'difference', // 默认选择差集
      operations: [
        {
          id: 'difference',
          label: '差集 A-B',
          icon: 'fas fa-minus-circle',
          description: '在A中但不在B中的元素'
        },
        {
          id: 'intersection',
          label: '交集 A∩B',
          icon: 'fas fa-circle',
          description: '同时在A和B中的元素'
        },
        {
          id: 'union',
          label: '并集 A∪B',
          icon: 'fas fa-object-group',
          description: '在A或B中的所有元素'
        },
        {
          id: 'symmetric',
          label: '对称差 A△B',
          icon: 'fas fa-code-branch',
          description: '在A或在B中，但不同时在A和B中的元素'
        },
        {
          id: 'a_not_b',
          label: 'A中去除B',
          icon: 'fas fa-filter',
          description: '从A中过滤掉在B中出现的元素'
        }
      ],
      operationPerformed: false,
    };
  },

  computed: {
    hasFirstStringContent() {
      return this.firstString.trim().length > 0;
    },
    
    hasSecondStringContent() {
      return this.secondString.trim().length > 0;
    },
    
    canCalculate() {
      // 至少需要一个字符串有内容，对于某些操作（如差集、交集）需要两个字符串都有内容
      if (this.selectedOperation === 'union') {
        return this.hasFirstStringContent || this.hasSecondStringContent;
      } else {
        return this.hasFirstStringContent && this.hasSecondStringContent;
      }
    },
    
    hasResult() {
      return this.operationPerformed;
    },
    
    calculationButtonText() {
      const operation = this.operations.find(op => op.id === this.selectedOperation);
      return `计算${operation ? operation.label : ''}`;
    },
    
    resultStats() {
      if (!this.operationPerformed) {
        return '';
      }
      return `${this.resultLines.length} 项`;
    },
    
    currentOperationLabel() {
      const operation = this.operations.find(op => op.id === this.selectedOperation);
      return operation ? operation.label : '';
    }
  },

  mounted() {
    // 恢复上次的状态
    this.restoreJavaToolState();
    
    // 添加ESC键退出全屏
    document.addEventListener('keydown', this.handleEscKey);
    
    // 添加窗口关闭前保存状态
    window.addEventListener('beforeunload', this.saveJavaToolState);
  },

  beforeUnmount() {
    if (this.isFullScreen) {
      document.body.style.overflow = '';
    }
    
    // 移除事件监听器
    document.removeEventListener('keydown', this.handleEscKey);
    window.removeEventListener('beforeunload', this.saveJavaToolState);
    
    // 确保在组件销毁前保存一次状态
    this.saveJavaToolState();
  },

  methods: {
    // 处理输入变化
    processInput() {
      this.debounceSaveState();
    },
    
    // 选择操作
    selectOperation(operationId) {
      this.selectedOperation = operationId;
      this.debounceSaveState();
    },
    
    // 计算结果
    calculateOperation() {
      if (!this.canCalculate) {
        return;
      }
      
      // 将字符串按行分割为数组
      const setA = new Set(this.firstString.trim() ? this.firstString.trim().split('\n').filter(line => line.trim() !== '') : []);
      const setB = new Set(this.secondString.trim() ? this.secondString.trim().split('\n').filter(line => line.trim() !== '') : []);
      
      // 根据选择的操作计算结果
      let result = new Set();
      
      switch (this.selectedOperation) {
        case 'difference':
          // 差集：在A中但不在B中的元素
          result = new Set([...setA].filter(x => !setB.has(x)));
          break;
        
        case 'intersection':
          // 交集：同时在A和B中的元素
          result = new Set([...setA].filter(x => setB.has(x)));
          break;
        
        case 'union':
          // 并集：在A或B中的所有元素
          result = new Set([...setA, ...setB]);
          break;
        
        case 'symmetric':
          // 对称差：在A或在B中，但不同时在A和B中的元素
          result = new Set(
            [...setA].filter(x => !setB.has(x)).concat(
              [...setB].filter(x => !setA.has(x))
            )
          );
          break;
        
        case 'a_not_b':
          // A中存在但B中每一项都不包含的元素
          result = new Set([...setA].filter(lineA => {
            // 检查B中的每一行是否包含在A的这一行中
            for (const lineB of setB) {
              if (lineA.includes(lineB)) {
                return false;
              }
            }
            return true;
          }));
          break;
      }
      
      // 更新结果
      this.resultLines = [...result];
      this.operationPerformed = true;
      
      // 显示提示
      ToastService.success(`已完成${this.currentOperationLabel}计算`);
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 复制结果到剪贴板
    copyResultToClipboard() {
      if (!this.hasResult) {
        return;
      }
      
      const textToCopy = this.resultLines.join('\n');
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          ToastService.success('结果已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          ToastService.error('复制失败，请手动复制');
        });
    },
    
    // 下载结果
    downloadResult() {
      if (!this.hasResult || this.resultLines.length === 0) {
        return;
      }
      
      // 创建文件内容
      const content = this.resultLines.join('\n');
      
      // 创建Blob对象
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      
      // 创建下载链接
      const timestamp = new Date().getTime();
      const filename = `string_operation_result_${timestamp}.txt`;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        ToastService.success(`已下载为 ${filename}`);
      }, 100);
    },
    
    // 示例数据
    loadExample() {
      this.firstString = `商品A\n商品B\n商品C\n商品D\n商品E\n商品F\n测试商品G\n测试商品H`;
      this.secondString = `商品C\n商品E\n商品F\n商品G\n测试商品H\n测试商品I\n测试商品J`;
      
      // 显示提示
      ToastService.info('已加载示例数据');
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 清空第一个字符串
    clearFirstString() {
      if (!this.hasFirstStringContent) {
        return;
      }
      
      this.firstString = '';
      
      // 保存状态
      this.debounceSaveState();
    },
    
    // 清空第二个字符串
    clearSecondString() {
      if (!this.hasSecondStringContent) {
        return;
      }
      
      this.secondString = '';
      
      // 保存状态
      this.debounceSaveState();
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
        this.saveJavaToolState();
      }, 500); // 500ms防抖延迟
    },
    
    // 保存Java工具的状态
    saveJavaToolState() {
      // 保存状态
      const javaToolState = {
        firstString: this.firstString,
        secondString: this.secondString,
        selectedOperation: this.selectedOperation,
        isFullScreen: this.isFullScreen,
      };
      
      // 保存到本地存储
      StorageService.updateSection('javaTool', javaToolState);
    },
    
    // 恢复Java工具的状态
    restoreJavaToolState() {
      const savedState = StorageService.getSection('javaTool');
      
      if (savedState) {
        // 恢复字符串输入
        if (typeof savedState.firstString === 'string') {
          this.firstString = savedState.firstString;
        }
        
        if (typeof savedState.secondString === 'string') {
          this.secondString = savedState.secondString;
        }
        
        // 恢复选择的操作
        if (savedState.selectedOperation && this.operations.some(op => op.id === savedState.selectedOperation)) {
          this.selectedOperation = savedState.selectedOperation;
        }
        
        // 恢复全屏状态
        if (savedState.isFullScreen) {
          // 延迟进入全屏，确保内容已渲染
          setTimeout(() => {
            this.enterFullScreen();
          }, 300);
        }
      }
    }
  }
};
