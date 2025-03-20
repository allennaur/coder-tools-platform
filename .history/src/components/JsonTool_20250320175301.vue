<template>
  <div class="json-tool-container">
    <!-- 左侧输入框 -->
    <div class="json-panel json-input-panel" :style="{ width: leftPanelWidth + '%', minWidth: minPanelWidth + 'px' }">
      <div class="panel-header">
        <h3>JSON 输入</h3>
        <div class="panel-actions">
          <button @click="clearInput" class="tool-button">清空</button>
          <button @click="formatInput" class="tool-button">格式化</button>
        </div>
      </div>
      <textarea 
        v-model="jsonInput" 
        class="json-textarea" 
        placeholder="请输入 JSON 字符串..."
        @input="processJson"
        spellcheck="false"
      ></textarea>
    </div>
    
    <!-- 拖拽调整区域 -->
    <div 
      class="resize-handle" 
      @mousedown="startResize"
      @mouseover="handleHover"
      @mouseleave="handleLeave"
      :class="{ 'active': isResizing, 'hover': isHovering }"
    ></div>
    
    <!-- 右侧结果显示框 -->
    <div class="json-panel json-result-panel" :style="{ width: (100 - leftPanelWidth) + '%', minWidth: minPanelWidth + 'px' }">
      <div class="panel-header">
        <h3>处理结果</h3>
        <div class="panel-actions">
          <button @click="copyToClipboard" class="tool-button">复制</button>
        </div>
      </div>
      <pre class="json-result">{{ jsonResult }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonTool',
  data() {
    return {
      jsonInput: '',
      jsonResult: '',
      leftPanelWidth: 50, // 默认左右各占50%
      minPanelWidth: 200, // 最小面板宽度，单位为像素
      isResizing: false,
      isHovering: false,
      initialX: 0,
      initialWidth: 0,
      containerWidth: 0
    }
  },
  mounted() {
    // 获取容器初始宽度
    this.$nextTick(() => {
      this.containerWidth = this.$el.offsetWidth;
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('mousemove', this.doResize);
    document.removeEventListener('mouseup', this.stopResize);
  },
  methods: {
    handleResize() {
      this.containerWidth = this.$el.offsetWidth;
      this.adjustPanelsWidth();
    },
    adjustPanelsWidth() {
      // 计算当前宽度下的最小百分比
      const minPercent = (this.minPanelWidth / this.containerWidth) * 100;
      
      // 确保两侧面板都不小于最小宽度
      if (this.leftPanelWidth < minPercent) {
        this.leftPanelWidth = minPercent;
      } else if (this.leftPanelWidth > (100 - minPercent)) {
        this.leftPanelWidth = 100 - minPercent;
      }
    },
    processJson() {
      try {
        if (!this.jsonInput.trim()) {
          this.jsonResult = '';
          return;
        }
        
        // 尝试解析 JSON
        const parsedJson = JSON.parse(this.jsonInput);
        // 美化输出
        this.jsonResult = JSON.stringify(parsedJson, null, 2);
      } catch (error) {
        this.jsonResult = `错误: ${error.message}`;
      }
    },
    formatInput() {
      try {
        if (!this.jsonInput.trim()) {
          return;
        }
        
        // 格式化输入的 JSON
        const parsedJson = JSON.parse(this.jsonInput);
        this.jsonInput = JSON.stringify(parsedJson, null, 2);
        this.processJson();
      } catch (error) {
        this.jsonResult = `错误: ${error.message}`;
      }
    },
    clearInput() {
      this.jsonInput = '';
      this.jsonResult = '';
    },
    copyToClipboard() {
      if (!this.jsonResult) return;
      
      navigator.clipboard.writeText(this.jsonResult)
        .then(() => {
          alert('已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          alert('复制失败，请手动复制');
        });
    },
    handleHover() {
      this.isHovering = true;
    },
    handleLeave() {
      if (!this.isResizing) {
        this.isHovering = false;
      }
    },
    // 拖拽调整宽度的方法
    startResize(event) {
      this.isResizing = true;
      this.initialX = event.clientX;
      this.initialWidth = this.leftPanelWidth;
      this.containerWidth = this.$el.offsetWidth;
      
      document.addEventListener('mousemove', this.doResize);
      document.addEventListener('mouseup', this.stopResize);
      
      // 阻止默认事件，防止选中文本等
      event.preventDefault();
    },
    doResize(event) {
      if (!this.isResizing) return;
      
      // 计算水平方向移动的百分比
      const deltaX = event.clientX - this.initialX;
      const deltaPercentage = (deltaX / this.containerWidth) * 100;
      
      // 计算当前宽度下的最小百分比
      const minPercent = (this.minPanelWidth / this.containerWidth) * 100;
      
      // 调整左侧面板宽度，限制在最小值到(100-最小值)之间
      let newWidth = this.initialWidth + deltaPercentage;
      newWidth = Math.min(Math.max(newWidth, minPercent), 100 - minPercent);
      
      this.leftPanelWidth = newWidth;
    },
    stopResize() {
      this.isResizing = false;
      this.isHovering = false;
      document.removeEventListener('mousemove', this.doResize);
      document.removeEventListener('mouseup', this.stopResize);
    }
  }
}
</script>

<style scoped>
.json-tool-container {
  display: flex;
  height: 100%;
  position: relative;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 15px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.json-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.1s ease;
  min-width: 200px; /* 最小宽度保证 */
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0; /* 防止标题区域被压缩 */
  white-space: nowrap; /* 防止文字换行 */
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.panel-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.tool-button {
  padding: 5px 10px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255,76,197,0.1) 0%, rgba(151,47,246,0.1) 100%);
  color: #333;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tool-button:hover {
  background: linear-gradient(135deg, rgba(255,76,197,0.2) 0%, rgba(151,47,246,0.2) 100%);
  transform: translateY(-1px);
}

.json-textarea {
  flex: 1;
  width: 100%;
  padding: 15px;
  border: none;
  resize: none;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: transparent;
  outline: none;
  overflow-y: auto;
}

.json-result {
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 15px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.resize-handle {
  width: 8px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.03);
  cursor: default;
  transition: background-color 0.2s ease, width 0.2s ease;
  z-index: 10;
  margin: 0 -4px; /* 使得可点击区域更大，但视觉上更窄 */
  position: relative;
}

.resize-handle:hover,
.resize-handle.hover {
  cursor: col-resize;
  background-color: rgba(151, 47, 246, 0.2);
  width: 4px; /* 悬浮时变窄一点，更精致 */
}

.resize-handle.active {
  background-color: rgba(151, 47, 246, 0.5);
  width: 4px;
}

/* 拖拽手柄中间的线条 */
.resize-handle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 40px;
  width: 2px;
  background-color: rgba(151, 47, 246, 0.3);
  border-radius: 1px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resize-handle:hover::after,
.resize-handle.hover::after,
.resize-handle.active::after {
  opacity: 1;
}

.json-input-panel,
.json-result-panel {
  overflow: hidden;
}
</style>
