<template>
  <div class="json-tool-container">
    <!-- 左侧输入框 -->
    <div class="json-panel json-input-panel" :style="{ width: leftPanelWidth + '%', minWidth: minPanelWidth + 'px' }">
      <div class="panel-header">
        <h3>JSON 输入</h3>
        <div class="panel-actions">
          <button @click="insertExample" class="tool-button">示例</button>
          <button 
            @click="clearInput" 
            class="tool-button" 
            :class="{ 'disabled': !hasInputContent }"
            :disabled="!hasInputContent"
          >清空</button>
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
    
    <!-- 拖拽调整区域 - 视觉反馈优化 -->
    <div 
      class="resize-handle" 
      @mousedown="startResize"
      @mouseover="handleHover"
      @mouseleave="handleLeave"
      :class="{ 'active': isResizing, 'hover': isHovering }"
    >
      <div class="handle-grip"></div>
      <div class="resize-feedback" v-if="isResizing"></div>
    </div>
    
    <!-- 右侧结果显示框 -->
    <div class="json-panel json-result-panel" :style="{ width: (100 - leftPanelWidth) + '%', minWidth: minPanelWidth + 'px' }">
      <div class="panel-header">
        <h3>
          处理结果
          <span v-if="currentFormat !== 'JSON'" class="format-indicator">
            ({{ currentFormat }})
          </span>
        </h3>
        <div class="panel-actions">
          <button v-if="hasRepairSuggestion" @click="applyRepair" class="tool-button">修复</button>
          <button 
            @click="compressJson" 
            class="tool-button compress-button"
            :class="{ 'disabled': !hasInputContent }" 
            :disabled="!hasInputContent"
          >压缩</button>
          <button 
            @click="formatJson" 
            class="tool-button format-button"
            :class="{ 'disabled': !hasInputContent }"
            :disabled="!hasInputContent"
          >格式化</button>
          <button 
            @click="convertToXml" 
            class="tool-button xml-button"
            :class="{ 'disabled': !hasInputContent }"
            :disabled="!hasInputContent"
          >转换XML</button>
          <button 
            @click="convertToYaml" 
            class="tool-button yaml-button"
            :class="{ 'disabled': !hasInputContent }"
            :disabled="!hasInputContent"
          >转换YAML</button>
          <button 
            @click="convertToCsv" 
            class="tool-button csv-button"
            :class="{ 'disabled': !hasInputContent }"
            :disabled="!hasInputContent"
          >转换CSV</button>
          <button 
            @click="copyToClipboard" 
            class="tool-button"
            :class="{ 'disabled': !hasOutputContent }"
            :disabled="!hasOutputContent"
          >复制</button>
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
    
    <!-- 移除局部 Toast 组件 -->
  </div>
</template>

<script>
import jsonToolScript from '@/scripts/JsonToolScript.js';

export default {
  name: 'JsonTool',
  mixins: [jsonToolScript]
}
</script>

<style scoped>
.json-tool-container {
  display: flex;
  height: 100%;
  position: relative;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 20px; /* 调整为更符合VisionOS的圆角 */
  overflow: hidden;
  backdrop-filter: blur(30px); /* 增强毛玻璃效果，符合VisionOS风格 */
  -webkit-backdrop-filter: blur(30px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); /* 柔和的阴影效果 */
  transform: translateZ(0);
  -webkit-font-smoothing: subpixel-antialiased;
  border: 1px solid rgba(255, 255, 255, 0.5); /* 添加边框增强深度感 */
}

.json-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.25s cubic-bezier(0.215, 0.61, 0.355, 1); 
  will-change: width;
  min-width: 200px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px; /* 增加内间距 */
  background: rgba(255, 255, 255, 0.55); /* 降低面板头部的不透明度 */
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  white-space: nowrap;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500; /* VisionOS倾向于使用中等粗细字体 */
  color: #333;
}

.panel-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 重新设计基本按钮样式，使其与面板背景更加区分 */
.tool-button {
  padding: 6px 12px;
  border-radius: 12px; /* 保持圆角 */
  background: rgba(210, 210, 245, 0.7); /* 更深的背景色，与面板头部形成对比 */
  color: #444;
  font-size: 12px;
  font-weight: 500; 
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  backdrop-filter: blur(8px); /* 保留模糊效果 */
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(240, 240, 255, 0.7); /* 更明显的边框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03); /* 添加微妙阴影增强立体感 */
}

.tool-button:hover {
  background: rgba(220, 220, 250, 0.9); /* 悬停时加深背景色 */
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08); /* 增强悬停时的阴影效果 */
}

/* 特别优化 "示例"、"清空" 和 "复制" 按钮样式 */
.panel-actions .tool-button:not(.format-button):not(.compress-button):not(.xml-button):not(.yaml-button):not(.csv-button) {
  background: linear-gradient(135deg, rgba(125, 122, 232, 0.2) 0%, rgba(115, 142, 247, 0.2) 100%); /* 使用渐变背景 */
  color: #4a4a8a; /* 更深的文字颜色 */
  border: 1px solid rgba(125, 122, 232, 0.3); /* 协调的边框色 */
}

.panel-actions .tool-button:not(.format-button):not(.compress-button):not(.xml-button):not(.yaml-button):not(.csv-button):hover {
  background: linear-gradient(135deg, rgba(125, 122, 232, 0.3) 0%, rgba(115, 142, 247, 0.3) 100%); /* 悬停时加深 */
  color: #3a3a7a; /* 悬停时文字颜色略深 */
  box-shadow: 0 3px 12px rgba(125, 122, 232, 0.15); /* 特殊阴影效果 */
}

/* 针对具体按钮添加独特样式 */
.panel-actions button:nth-child(1) {
  background: linear-gradient(135deg, rgba(99, 125, 255, 0.2) 0%, rgba(82, 113, 229, 0.2) 100%); /* "示例"按钮 */
  border-color: rgba(82, 113, 229, 0.3);
}

.panel-actions button:nth-child(1):hover {
  background: linear-gradient(135deg, rgba(99, 125, 255, 0.3) 0%, rgba(82, 113, 229, 0.3) 100%);
}

.panel-actions button:nth-child(2) {
  background: linear-gradient(135deg, rgba(255, 111, 97, 0.15) 0%, rgba(224, 85, 95, 0.15) 100%); /* "清空"按钮 */
  border-color: rgba(224, 85, 95, 0.25);
  color: #af4448;
}

.panel-actions button:nth-child(2):hover {
  background: linear-gradient(135deg, rgba(255, 111, 97, 0.25) 0%, rgba(224, 85, 95, 0.25) 100%);
}

/* 调整复制按钮样式 */
.panel-actions button:last-child:not(.format-button):not(.compress-button):not(.xml-button):not(.yaml-button):not(.csv-button) {
  background: linear-gradient(135deg, rgba(121, 83, 226, 0.2) 0%, rgba(103, 58, 183, 0.2) 100%); /* 复制按钮 */
  border-color: rgba(103, 58, 183, 0.3);
  color: #5c3a94;
}

.panel-actions button:last-child:not(.format-button):not(.compress-button):not(.xml-button):not(.yaml-button):not(.csv-button):hover {
  background: linear-gradient(135deg, rgba(121, 83, 226, 0.3) 0%, rgba(103, 58, 183, 0.3) 100%);
}

/* 保持特有按钮样式，但调整为符合VisionOS的风格 */
.tool-button.format-button {
  background: rgba(0, 122, 255, 0.15);
  color: #0077FF;
  border: 1px solid rgba(0, 122, 255, 0.3);
}

.tool-button.format-button:hover {
  background: rgba(0, 122, 255, 0.25);
}

.tool-button.compress-button {
  background: rgba(255, 149, 0, 0.15);
  color: #FF9500;
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.tool-button.compress-button:hover {
  background: rgba(255, 149, 0, 0.25);
}

.tool-button.xml-button {
  background: rgba(175, 82, 222, 0.15);
  color: #AF52DE;
  border: 1px solid rgba(175, 82, 222, 0.3);
}

.tool-button.xml-button:hover {
  background: rgba(175, 82, 222, 0.25);
}

.tool-button.yaml-button {
  background: rgba(52, 199, 89, 0.15);
  color: #34C759;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.tool-button.yaml-button:hover {
  background: rgba(52, 199, 89, 0.25);
}

.tool-button.csv-button {
  background: rgba(88, 86, 214, 0.15);
  color: #5856D6;
  border: 1px solid rgba(88, 86, 214, 0.3);
}

.tool-button.csv-button:hover {
  background: rgba(88, 86, 214, 0.25);
}

/* 更新禁用按钮样式以符合VisionOS风格 */
.tool-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  background: rgba(0, 0, 0, 0.05) !important;
  color: #999 !important;
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.json-textarea {
  flex: 1;
  width: 100%;
  padding: 16px;
  border: none;
  resize: none;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background-color: rgba(255, 255, 255, 0.3); /* 轻微的背景色 */
  outline: none;
  overflow-y: auto;
  border-radius: 12px; /* 内部元素也增加圆角 */
  margin: 10px; /* 添加边距使文本区域不贴边 */
  backdrop-filter: blur(5px); /* 文本区域的模糊效果 */
  -webkit-backdrop-filter: blur(5px);
}

/* 优化拖拽手柄样式，符合VisionOS风格 */
.resize-handle {
  width: 12px;
  height: 100%;
  background-color: transparent;
  cursor: col-resize;
  z-index: 10;
  margin: 0 -6px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none;
}

.handle-grip {
  width: 4px; /* 略微加粗 */
  height: 80px; /* 默认更长 */
  background: rgba(0, 0, 0, 0.1); /* 更轻柔的颜色 */
  border-radius: 4px;
  transition: all 0.2s ease;
}

.resize-handle:hover .handle-grip,
.resize-handle.hover .handle-grip {
  height: 120px;
  background: rgba(0, 0, 0, 0.15);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.resize-handle.active .handle-grip {
  height: 160px; /* 拖动时更长 */
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

/* 修改折叠按钮为VisionOS风格 */
.toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 16px;
  font-weight: 400; /* VisionOS使用较轻的字重 */
  cursor: pointer;
  user-select: none;
  color: #0077FF; /* 使用苹果标准蓝色 */
  background-color: rgba(0, 122, 255, 0.1);
  border-radius: 10px; /* 圆形按钮 */
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 122, 255, 0.2);
}

.toggle-btn:hover {
  background-color: rgba(0, 122, 255, 0.2);
  transform: scale(1.1);
}

/* 更新格式指示器样式 */
.format-indicator {
  font-size: 14px;
  font-weight: normal;
  color: #666;
  margin-left: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
  vertical-align: middle;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* ...保留其他未更改的样式... */
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

/* 优化拖拽手柄样式 */
.resize-handle {
  width: 12px; /* 增加宽度以便更容易点击 */
  height: 100%;
  background-color: transparent;
  cursor: col-resize;
  z-index: 10;
  margin: 0 -6px;  /* 相应调整负边距 */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none; /* 优化触摸设备上的响应 */
}

.handle-grip {
  width: 2px;
  height: 40px;
  background: rgba(151, 47, 246, 0.3);
  border-radius: 3px;
  transition: height 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
  will-change: height, background-color, transform; /* 优化动画性能 */
}

.resize-handle:hover .handle-grip,
.resize-handle.hover .handle-grip {
  height: 60px;
  background: rgba(151, 47, 246, 0.5);
}

.resize-handle.active .handle-grip {
  height: 100px;
  background: rgba(151, 47, 246, 0.7);
  box-shadow: 0 0 12px rgba(151, 47, 246, 0.4);
}

/* 拖动时的视觉反馈元素 */
.resize-feedback {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(151, 47, 246, 1);
  box-shadow: 0 0 8px rgba(151, 47, 246, 0.8);
  animation: pulse 1.5s infinite;
  z-index: 1000;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
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
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* 优化iOS滚动 */
}

.json-viewer {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  padding-left: 8px;
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
  align-items: center; /* 居中显示错误框 */
  justify-content: flex-start;
  width: 100%;
}

.json-error {
  color: #d32f2f;
  text-align: left;
  width: 95%; /* 设置为95%宽度 */
  padding: 15px;
  border-radius: 8px;
  background-color: rgba(211, 47, 47, 0.05);
  max-width: 95%; /* 确保不会超出容器 */
  box-sizing: border-box;
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
  transform: translateY(-1px);
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

/* 添加按钮差异化样式 */
.tool-button.format-button {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(3, 169, 244, 0.1) 100%);
  color: #0277bd;
}

.tool-button.format-button:hover {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(3, 169, 244, 0.2) 100%);
}

.tool-button.compress-button {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
  color: #e65100;
}

.tool-button.compress-button:hover {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%);
}

/* XML转换按钮样式 */
.tool-button.xml-button {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(103, 58, 183, 0.1) 100%);
  color: #6a1b9a;
}

.tool-button.xml-button:hover {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(103, 58, 183, 0.2) 100%);
}

/* YAML转换按钮样式 */
.tool-button.yaml-button {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(46, 125, 50, 0.1) 100%);
  color: #2e7d32;
}

.tool-button.yaml-button:hover {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(46, 125, 50, 0.2) 100%);
}

/* CSV转换按钮样式 */
.tool-button.csv-button {
  background: linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(48, 63, 159, 0.1) 100%);
  color: #303f9f;
}

.tool-button.csv-button:hover {
  background: linear-gradient(135deg, rgba(63, 81, 181, 0.2) 0%, rgba(48, 63, 159, 0.2) 100%);
}

/* XML语法高亮 */
:deep(.xml-tag) {
  color: #0b75b8;
}

:deep(.xml-attr) {
  color: #d7ba7d;
}

:deep(.xml-text) {
  color: #006400;
}

:deep(.xml-comment) {
  color: #808080;
  font-style: italic;
}

/* YAML语法高亮 */
:deep(.yaml-key) {
  color: #0b75b8;
}

:deep(.yaml-value) {
  color: #006400;
}

:deep(.yaml-string) {
  color: #006400;
}

:deep(.yaml-number) {
  color: #aa00aa;
}

:deep(.yaml-boolean) {
  color: #1c00cf;
}

:deep(.yaml-null) {
  color: #808080;
}

:deep(.yaml-array-marker) {
  color: #d7ba7d;
}

/* CSV语法高亮 */
:deep(.csv-header) {
  font-weight: bold;
  color: #0b75b8;
}

:deep(.csv-field) {
  color: #333;
}

/* 添加格式指示器样式 */
.format-indicator {
  font-size: 14px;
  font-weight: normal;
  color: #666;
  margin-left: 8px;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
  vertical-align: middle;
}

/* 添加禁用状态的按钮样式 */
.tool-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  background: rgba(0, 0, 0, 0.05) !important;
  color: #999 !important;
  box-shadow: none !important;
}

/* 确保禁用状态的按钮悬停时不会有交互效果 */
.tool-button.disabled:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 增强文本区域的焦点状态样式 */
.json-textarea:focus {
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(0, 122, 255, 0.3);
  border: none;
}

/* 按钮焦点样式 */
.tool-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
}

/* 确保禁用按钮没有焦点效果 */
.tool-button.disabled:focus {
  outline: none;
  box-shadow: none;
  border-color: rgba(0, 0, 0, 0.05);
}

/* 修复按钮重新开始的焦点样式问题 */
.tool-button.format-button:focus {
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.5);
}

.tool-button.compress-button:focus {
  box-shadow: 0 0 0 2px rgba(255, 149, 0, 0.2);
  border-color: rgba(255, 149, 0, 0.5);
}

.tool-button.xml-button:focus {
  box-shadow: 0 0 0 2px rgba(175, 82, 222, 0.2);
  border-color: rgba(175, 82, 222, 0.5);
}

.tool-button.yaml-button:focus {
  box-shadow: 0 0 0 2px rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.5);
}

.tool-button.csv-button:focus {
  box-shadow: 0 0 0 2px rgba(88, 86, 214, 0.2);
  border-color: rgba(88, 86, 214, 0.5);
}

/* 修复折叠按钮的焦点样式 */
.toggle-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}
</style>
