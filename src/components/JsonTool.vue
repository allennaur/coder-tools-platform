<template>
  <div class="json-tool-container" :class="{'fullscreen-mode': isFullScreen}">
    <!-- 左侧输入框 -->
    <div class="json-panel json-input-panel" :style="{ width: leftPanelWidth + '%', minWidth: minPanelWidth + 'px' }">
      <div class="panel-header">
        <div style="display: flex; align-items: center;">
          <h3>JSON 输入</h3>
          <!-- 更新全屏按钮图标，动态根据全屏状态变化 -->
          <button class="fullscreen-btn" @click="toggleFullScreen" :title="isFullScreen ? '退出全屏' : '全屏模式'">
            <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
        </div>
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
  </div>
</template>

<script>
import jsonToolScript from '@/scripts/JsonToolScript.js';

export default {
  name: 'JsonTool',
  mixins: [jsonToolScript]
}
</script>

<style src="@/styles/JsonToolStyle.css">
/* 样式已移至 /src/styles/JsonToolStyle.css */
</style>

<style scoped>
/* 添加进入全屏的初始状态样式 */
.entering-fullscreen {
  transform: scale(0.92);
  opacity: 0.8;
  transition: none !important;
}

/* 改进退出全屏动画样式 */
.exiting-fullscreen {
  transform: scale(0.95);
  opacity: 0.9;
  transition: all 0.45s cubic-bezier(0.2, 1, 0.3, 1) !important;
}
</style>
