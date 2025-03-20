<template>
  <div class="json-tool-container">
    <!-- 左侧输入框 -->
    <div class="json-panel json-input-panel" :style="{ width: leftPanelWidth + '%' }">
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
      ></textarea>
    </div>
    
    <!-- 拖拽调整区域 -->
    <div 
      class="resize-handle" 
      @mousedown="startResize"
      :class="{ 'active': isResizing }"
    ></div>
    
    <!-- 右侧结果显示框 -->
    <div class="json-panel json-result-panel" :style="{ width: (100 - leftPanelWidth) + '%' }">
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
      isResizing: false,
      initialX: 0,
      initialWidth: 0
    }
  },
  methods: {
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
          // 可以添加复制成功的提示
          console.log('结果已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
        });
    },
    // 拖拽调整宽度的方法
    startResize(event) {
      this.isResizing = true;
      this.initialX = event.clientX;
      this.initialWidth = this.leftPanelWidth;
      
      document.addEventListener('mousemove', this.doResize);
      document.addEventListener('mouseup', this.stopResize);
    },
    doResize(event) {
      if (!this.isResizing) return;
      
      // 计算水平方向移动的百分比
      const containerWidth = event.currentTarget.offsetWidth || document.querySelector('.json-tool-container').offsetWidth;
      const deltaX = event.clientX - this.initialX;
      const deltaPercentage = (deltaX / containerWidth) * 100;
      
      // 调整左侧面板宽度，限制在10%到90%之间
      let newWidth = this.initialWidth + deltaPercentage;
      newWidth = Math.min(Math.max(newWidth, 10), 90);
      
      this.leftPanelWidth = newWidth;
    },
    stopResize() {
      this.isResizing = false;
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
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  width: 6px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  cursor: col-resize;
  transition: background-color 0.2s ease;
  z-index: 10;
}

.resize-handle:hover,
.resize-handle.active {
  background-color: rgba(151, 47, 246, 0.5);
}

.resize-handle::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 11;
}

.json-input-panel,
.json-result-panel {
  overflow: hidden;
}
</style>
