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
          <button v-if="hasRepairSuggestion" @click="applyRepair" class="tool-button">修复</button>
          <button @click="copyToClipboard" class="tool-button">复制</button>
        </div>
      </div>
      
      <!-- 正常JSON显示 -->
      <div v-if="!jsonError" class="json-viewer-container">
        <div class="json-viewer">
          <div 
            v-for="(item, index) in visibleJsonLines" 
            :key="index" 
            class="json-line" 
            :class="{ 'collapsible': isCollapsible(item.content), 'folded-line': item.folded }"
            @mouseover="handleLineHover(item.originalIndex)"
            @mouseleave="handleLineLeave()"
          >
            <div class="line-controls">
              <span 
                v-if="isCollapsible(item.content) && (hoveredLine === item.originalIndex || isLineCollapsed(item.originalIndex))"
                class="toggle-btn"
                @click.stop="toggleCollapse(item.originalIndex)"
              >{{ isLineCollapsed(item.originalIndex) ? '+' : '–' }}</span>
            </div>
            
            <span 
              v-html="item.content" 
              class="line-content"
            ></span>
            
            <span v-if="item.folded" class="folded-info">
              {{ item.collapsedCount }} 项
            </span>
          </div>
        </div>
      </div>
      
      <!-- 错误提示区域 -->
      <div v-else class="json-error-container">
        <div class="json-error">
          <div class="error-title">JSON 格式不正确</div>
          <div class="error-message">{{ jsonErrorMessage }}</div>
          <div v-if="hasRepairSuggestion" class="repair-suggestion">
            <div class="suggestion-title">修复建议:</div>
            <pre>{{ repairSuggestion }}</pre>
            <button @click="applyRepair" class="tool-button repair-button">应用修复</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 复制成功提示 -->
    <div class="toast-container" :class="{ 'toast-show': showToast }">
      <div class="toast-message">
        <i class="fas fa-check-circle toast-icon"></i>
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonTool',
  data() {
    return {
      jsonInput: '',
      formattedJson: [],
      jsonResult: '',
      jsonError: false,
      jsonErrorMessage: '',
      hasRepairSuggestion: false,
      repairSuggestion: '',
      leftPanelWidth: 50,
      minPanelWidth: 200,
      isResizing: false,
      isHovering: false,
      initialX: 0,
      initialWidth: 0,
      containerWidth: 0,
      collapsedLines: new Set(), // 记录被折叠的行
      showToast: false,
      toastMessage: '',
      collapsibleRanges: [], // 存储可折叠范围 [开始行, 结束行]
      lineTypes: [], // 存储每行的类型 (object-start, array-start, object-end, array-end, key-value)
      hoveredLine: null, // 当前鼠标悬浮的行
      visibleJsonLines: [], // 当前显示的JSON行
      completeJsonString: '' // 完整的JSON字符串（用于复制）
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.containerWidth = this.$el.offsetWidth;
    });
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
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
      const minPercent = (this.minPanelWidth / this.containerWidth) * 100;
      if (this.leftPanelWidth < minPercent) {
        this.leftPanelWidth = minPercent;
      } else if (this.leftPanelWidth > (100 - minPercent)) {
        this.leftPanelWidth = 100 - minPercent;
      }
    },
    isExpandable(line) {
      return line.includes('{') || line.includes('[');
    },
    toggleNode(event) {
      if (!event.target.classList.contains('clickable')) return;
      
      const lineElement = event.target.closest('.json-line');
      if (!lineElement) return;
      
      const nodeId = lineElement.getAttribute('data-node-id');
      if (nodeId) {
        if (this.expandedNodes.has(nodeId)) {
          this.expandedNodes.delete(nodeId);
        } else {
          this.expandedNodes.add(nodeId);
        }
        this.processJson();
      }
    },
    processJson() {
      if (!this.jsonInput.trim()) {
        this.formattedJson = [];
        this.visibleJsonLines = [];
        this.jsonResult = '';
        this.jsonError = false;
        this.hasRepairSuggestion = false;
        return;
      }
      
      try {
        const parsedJson = JSON.parse(this.jsonInput);
        
        this.jsonError = false;
        this.jsonErrorMessage = '';
        this.hasRepairSuggestion = false;
        
        // 保存完整的JSON字符串用于复制
        this.jsonResult = JSON.stringify(parsedJson, null, 2);
        this.completeJsonString = this.jsonResult;
        
        // 格式化并处理显示
        this.formatJsonToHtml(parsedJson);
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        
        this.tryRepairJson();
      }
    },
    formatJsonToHtml(json) {
      // 将JSON格式化为字符串
      const stringified = JSON.stringify(json, null, 2);
      const lines = stringified.split('\n');
      
      // 跟踪每一行的原始索引、内容和缩进级别
      this.formattedJson = lines.map((line, index) => {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[0].length : 0;
        
        // 为每一行标记类型
        let type = 'regular';
        if (index === 0) type = 'root-start';
        else if (index === lines.length - 1) type = 'root-end';
        else if (line.trim().endsWith('{')) type = 'object-start';
        else if (line.trim().endsWith('[')) type = 'array-start';
        else if (line.trim() === '}' || line.trim() === '},') type = 'object-end';
        else if (line.trim() === ']' || line.trim() === '],') type = 'array-end';
        
        // 处理每行的HTML内容
        let formattedLine = line
          .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = 'json-key';
              } else {
                cls = 'json-string';
              }
            } else if (/true|false/.test(match)) {
              cls = 'json-boolean';
            } else if (/null/.test(match)) {
              cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
          });
        
        return {
          originalIndex: index,
          content: formattedLine,
          indent,
          type,
          collapsed: false
        };
      });
      
      // 重置折叠状态
      this.collapsedLines = new Set();
      
      // 处理优化显示
      this.processVisibleLines();
    },
    tryRepairJson() {
      const input = this.jsonInput;
      let suggestion = '';
      
      const openBraces = (input.match(/{/g) || []).length;
      const closeBraces = (input.match(/}/g) || []).length;
      const openBrackets = (input.match(/\[/g) || []).length;
      const closeBrackets = (input.match(/\]/g) || []).length;
      
      if (openBraces > closeBraces) {
        suggestion = input + '}';
        for (let i = 1; i < openBraces - closeBraces; i++) {
          suggestion += '}';
        }
        this.hasRepairSuggestion = true;
        this.repairSuggestion = `可能缺少 ${openBraces - closeBraces} 个结束花括号 "}"`;
      } else if (openBrackets > closeBrackets) {
        suggestion = input + ']';
        for (let i = 1; i < openBrackets - closeBrackets; i++) {
          suggestion += ']';
        }
        this.hasRepairSuggestion = true;
        this.repairSuggestion = `可能缺少 ${openBrackets - closeBrackets} 个结束方括号 "]"`;
      }
      
      const missingQuotesRegex = /([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g;
      if (missingQuotesRegex.test(input)) {
        const fixedInput = input.replace(missingQuotesRegex, '$1"$2"$3');
        if (!this.hasRepairSuggestion) {
          suggestion = fixedInput;
          this.hasRepairSuggestion = true;
          this.repairSuggestion = `属性名需要用双引号括起来`;
        }
      }
      
      const extraCommaRegex = /,(\s*[}\]])/g;
      if (extraCommaRegex.test(input)) {
        const fixedInput = input.replace(extraCommaRegex, '$1');
        if (!this.hasRepairSuggestion) {
          suggestion = fixedInput;
          this.hasRepairSuggestion = true;
          this.repairSuggestion = `JSON中对象或数组的最后一个元素后不能有逗号`;
        }
      }
      
      if (this.hasRepairSuggestion) {
        try {
          JSON.parse(suggestion);
          this.repairSuggestion = `${this.repairSuggestion}。点击"修复"按钮应用修复。`;
        } catch (e) {
          this.hasRepairSuggestion = false;
        }
      }
    },
    applyRepair() {
      if (!this.hasRepairSuggestion) return;
      
      const input = this.jsonInput;
      const openBraces = (input.match(/{/g) || []).length;
      const closeBraces = (input.match(/}/g) || []).length;
      const openBrackets = (input.match(/\[/g) || []).length;
      const closeBrackets = (input.match(/\]/g) || []).length;
      
      let fixedInput = input;
      
      if (openBraces > closeBraces) {
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixedInput += '}';
        }
      }
      
      if (openBrackets > closeBrackets) {
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          fixedInput += ']';
        }
      }
      
      fixedInput = fixedInput.replace(/([{,]\s*)([a-zA-Z0-9_$]+)(\s*:)/g, '$1"$2"$3');
      
      fixedInput = fixedInput.replace(/,(\s*[}\]])/g, '$1');
      
      this.jsonInput = fixedInput;
      this.processJson();
    },
    formatInput() {
      try {
        if (!this.jsonInput.trim()) return;
        
        const parsedJson = JSON.parse(this.jsonInput);
        this.jsonInput = JSON.stringify(parsedJson, null, 2);
        this.processJson();
      } catch (error) {
        this.jsonError = true;
        this.jsonErrorMessage = error.message;
        this.tryRepairJson();
      }
    },
    clearInput() {
      this.jsonInput = '';
      this.formattedJson = [];
      this.jsonResult = '';
      this.jsonError = false;
      this.jsonErrorMessage = '';
      this.hasRepairSuggestion = false;
    },
    copyToClipboard() {
      // 使用完整的JSON字符串进行复制
      const textToCopy = this.jsonError ? '错误: ' + this.jsonErrorMessage : this.completeJsonString;
      
      if (!textToCopy) return;
      
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          this.showToastMessage('复制成功');
        })
        .catch(err => {
          console.error('复制失败:', err);
          this.showToastMessage('复制失败，请手动复制');
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
    startResize(event) {
      this.isResizing = true;
      this.initialX = event.clientX;
      this.initialWidth = this.leftPanelWidth;
      this.containerWidth = this.$el.offsetWidth;
      
      document.addEventListener('mousemove', this.doResize);
      document.addEventListener('mouseup', this.stopResize);
      
      event.preventDefault();
    },
    doResize(event) {
      if (!this.isResizing) return;
      
      const deltaX = event.clientX - this.initialX;
      const deltaPercentage = (deltaX / this.containerWidth) * 100;
      
      const minPercent = (this.minPanelWidth / this.containerWidth) * 100;
      
      let newWidth = this.initialWidth + deltaPercentage;
      newWidth = Math.min(Math.max(newWidth, minPercent), 100 - minPercent);
      
      this.leftPanelWidth = newWidth;
    },
    stopResize() {
      this.isResizing = false;
      this.isHovering = false;
      document.removeEventListener('mousemove', this.doResize);
      document.removeEventListener('mouseup', this.stopResize);
    },
    // 显示自定义提示消息
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
      
      // 3秒后自动隐藏
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    
    // 检查行是否可折叠
    isCollapsible(line) {
      return (line.includes('": {') || line.includes('": [')) && 
             (line.trim().endsWith('{') || line.trim().endsWith('['));
    },
    
    // 检查行是否处于折叠状态
    isLineCollapsed(index) {
      return this.collapsedLines.has(index);
    },
    
    // 切换折叠状态
    toggleCollapse(index) {
      if (this.collapsedLines.has(index)) {
        this.collapsedLines.delete(index);
      } else {
        this.collapsedLines.add(index);
      }
      
      this.processVisibleLines();
    },
    
    // 处理可见行
    processVisibleLines() {
      // 创建一个新的行数组，排除根级别的括号（即首尾行）
      let processed = [...this.formattedJson];
      
      // 处理需要隐藏的行（被折叠的内容）
      const newVisibleLines = [];
      let skipUntilIndent = -1;
      let currentCollapsedCount = 0;
      // 移除未使用的变量
      
      for (let i = 0; i < processed.length; i++) {
        const line = processed[i];
        
        // 跳过最外层的大括号（首尾行）
        if (line.type === 'root-start' || line.type === 'root-end') {
          continue;
        }
        
        // 如果当前在跳过折叠内容模式
        if (skipUntilIndent >= 0) {
          if (line.indent <= skipUntilIndent) {
            // 到达折叠区域结束，添加一个折叠信息行
            if (currentCollapsedCount > 0) {
              const lastLine = newVisibleLines[newVisibleLines.length - 1];
              lastLine.folded = true;
              lastLine.collapsedCount = currentCollapsedCount;
              
              currentCollapsedCount = 0;
              skipUntilIndent = -1;
            }
            
            newVisibleLines.push({
              ...line,
              originalIndex: i
            });
          } else {
            currentCollapsedCount++;
          }
        } else {
          // 检查这一行是否被折叠了
          if (this.isCollapsible(line.content) && this.collapsedLines.has(i)) {
            skipUntilIndent = line.indent;
            // 不再使用 lastCollapsedStartIndex
            currentCollapsedCount = 0;
          }
          
          newVisibleLines.push({
            ...line,
            originalIndex: i
          });
        }
      }
      
      this.visibleJsonLines = newVisibleLines;
    },
    
    // 获取行内容（为了处理折叠行）
    getLineContent(line, index) {
      // 如果是折叠了的对象/数组开始行，我们添加一个省略号指示
      if (this.isLineCollapsed(index)) {
        if (line.includes('": {')) {
          return line.replace('{', '{ ... }');
        } else if (line.includes('": [')) {
          return line.replace('[', '[ ... ]');
        }
      }
      return line;
    },
    
    // 获取行的缩进级别
    getLineIndent(line) {
      const match = line.match(/^(\s*)/);
      return match ? match[0].length / 2 : 0;
    },
    handleLineHover(index) {
      if (this.isCollapsible(this.formattedJson[index])) {
        this.hoveredLine = index;
      }
    },
    
    handleLineLeave() {
      this.hoveredLine = null;
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
  min-width: 200px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  white-space: nowrap;
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
  flex-shrink: 0;
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
  width: 4px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.03);
  cursor: default;
  transition: background-color 0.2s ease;
  z-index: 10;
  margin: 0 -2px;
  position: relative;
}

.resize-handle:hover,
.resize-handle.hover {
  cursor: col-resize;
  background-color: rgba(151, 47, 246, 0.2);
}

.resize-handle.active {
  background-color: rgba(151, 47, 246, 0.5);
}

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

/* JSON查看器样式 */
.json-viewer-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.json-viewer {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}

.json-line {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}

/* JSON语法高亮 */
:deep(.json-key) {
  color: #0b75b8;
}

:deep(.json-string) {
  color: #006400;
}

:deep(.json-number) {
  color: #aa00aa;
}

:deep(.json-boolean) {
  color: #1c00cf;
}

:deep(.json-null) {
  color: #808080;
}

/* 可点击节点样式 */
:deep(.clickable) {
  cursor: pointer;
}

:deep(.clickable:hover) {
  background-color: rgba(0, 0, 0, 0.05);
}

/* JSON错误提示样式 */
.json-error-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.json-error {
  color: #d32f2f;
  text-align: left;
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  background-color: rgba(211, 47, 47, 0.05);
}

.error-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
}

.error-message {
  margin-bottom: 15px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

/* 修复建议样式 */
.repair-suggestion {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  border-left: 4px solid #4caf50;
}

.suggestion-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.repair-button {
  margin-top: 10px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(27, 94, 32, 0.2) 100%) !important;
  color: #2e7d32 !important;
}

.repair-button:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(27, 94, 32, 0.3) 100%) !important;
}

/* 添加折叠按钮样式 */
.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 5px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  color: #0b75b8;
  background-color: rgba(11, 117, 184, 0.1);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background-color: rgba(11, 117, 184, 0.2);
  transform: scale(1.1);
}

.toggle-placeholder {
  display: inline-block;
  width: 18px;
  margin-right: 5px;
}

/* 隐藏折叠的行 */
.json-line.hidden {
  display: none;
}

/* 复制提示样式 */
.toast-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(-100px);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.toast-container.toast-show {
  transform: translateX(-50%) translateY(0);
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
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.toast-icon {
  color: #4caf50;
}

/* JSON查看器样式优化 */
.json-viewer {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
}

.json-line {
  display: flex;
  align-items: flex-start;
  min-height: 24px;
}

.line-content {
  flex: 1;
}

/* JSON语法高亮 */
:deep(.json-key) {
  color: #0b75b8;
}

:deep(.json-string) {
  color: #006400;
}

:deep(.json-number) {
  color: #aa00aa;
}

:deep(.json-boolean) {
  color: #1c00cf;
}

:deep(.json-null) {
  color: #808080;
}

/* 改进的行样式 */
.json-line {
  display: flex;
  align-items: flex-start;
  min-height: 24px;
  padding: 1px 0;
  position: relative;
}

.json-line:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
}

.line-controls {
  width: 18px;
  display: flex;
  justify-content: center;
  position: relative;
}

.line-content {
  padding-left: 2px;
}

/* 折叠按钮改进 */
.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  color: #0b75b8;
  background-color: rgba(11, 117, 184, 0.1);
  border-radius: 3px;
  transition: all 0.15s ease;
}

.toggle-btn:hover {
  background-color: rgba(11, 117, 184, 0.2);
  transform: scale(1.1);
}

/* 被折叠行的样式 */
.folded-line {
  position: relative;
}

.folded-info {
  margin-left: 5px;
  font-size: 12px;
  color: #888;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0 6px;
  border-radius: 10px;
  display: inline-block;
}

/* JSON查看器样式 */
.json-viewer-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.json-viewer {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  padding-left: 8px;
}
</style>
