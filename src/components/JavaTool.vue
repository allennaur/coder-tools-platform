<template>
  <div class="java-tool-container" :class="{'fullscreen-mode': isFullScreen}">
    <!-- 上部输入区域 -->
    <div class="string-input-area">
      <div class="input-panels">
        <!-- 第一个字符串输入面板 -->
        <div class="input-panel first-string-panel">
          <div class="panel-header">
            <div style="display: flex; align-items: center;">
              <h3>字符串 A</h3>
              <!-- 全屏按钮 -->
              <button class="fullscreen-btn" @click="toggleFullScreen" :title="isFullScreen ? '退出全屏' : '全屏模式'">
                <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
              </button>
            </div>
            <div class="panel-actions">
              <button @click="loadExample" class="tool-button">示例</button>
              <button 
                @click="clearFirstString" 
                class="tool-button" 
                :class="{ 'disabled': !hasFirstStringContent }"
                :disabled="!hasFirstStringContent"
              >清空</button>
            </div>
          </div>
          <textarea 
            v-model="firstString" 
            class="string-textarea" 
            placeholder="请输入第一个字符串（一行一项）..."
            spellcheck="false"
            @input="processInput"
          ></textarea>
        </div>

        <!-- 操作区域，显示运算符选择 -->
        <div class="operation-panel">
          <div class="operation-selector">
            <button 
              v-for="(op, index) in operations" 
              :key="index"
              @click="selectOperation(op.id)"
              :class="['operation-button', { 'active': selectedOperation === op.id }]"
              :title="op.description"
            >
              <i :class="op.icon"></i>
              <span>{{ op.label }}</span>
            </button>
          </div>
        </div>
        
        <!-- 第二个字符串输入面板 -->
        <div class="input-panel second-string-panel">
          <div class="panel-header">
            <h3>字符串 B</h3>
            <div class="panel-actions">
              <button 
                @click="clearSecondString" 
                class="tool-button" 
                :class="{ 'disabled': !hasSecondStringContent }"
                :disabled="!hasSecondStringContent"
              >清空</button>
            </div>
          </div>
          <textarea 
            v-model="secondString" 
            class="string-textarea" 
            placeholder="请输入第二个字符串（一行一项）..."
            spellcheck="false"
            @input="processInput"
          ></textarea>
        </div>
      </div>
      
      <!-- 计算按钮区域 -->
      <div class="calculate-area">
        <button 
          @click="calculateOperation" 
          class="calculate-button"
          :class="{ 'disabled': !canCalculate }"
          :disabled="!canCalculate"
        >
          {{ calculationButtonText }}
        </button>
      </div>
    </div>

    <!-- 底部结果区域 -->
    <div class="result-area">
      <div class="result-panel">
        <div class="panel-header">
          <h3>计算结果 <span v-if="operationPerformed" class="operation-indicator">({{ currentOperationLabel }})</span></h3>
          <div class="panel-actions">
            <div class="result-stats" v-if="operationPerformed">
              <span class="stats-badge">{{ resultStats }}</span>
            </div>
            <button 
              @click="copyResultToClipboard" 
              class="tool-button"
              :class="{ 'disabled': !hasResult }"
              :disabled="!hasResult"
            >复制</button>
            <button 
              @click="downloadResult" 
              class="tool-button download-button"
              :class="{ 'disabled': !hasResult }"
              :disabled="!hasResult"
            >下载</button>
          </div>
        </div>
        <div class="result-content" ref="resultContent">
          <div class="result-placeholder" v-if="!operationPerformed">
            <div class="placeholder-content">
              <i class="fas fa-code-branch"></i>
              <p>在上方输入两个字符串并选择操作后，点击计算按钮显示结果</p>
            </div>
          </div>
          <div v-else-if="resultLines.length === 0" class="empty-result">
            <div class="empty-result-content">
              <i class="fas fa-filter"></i>
              <p>计算结果为空</p>
            </div>
          </div>
          <div v-else class="result-lines">
            <div v-for="(line, index) in resultLines" :key="index" class="result-line">
              {{ line }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import javaToolScript from '@/scripts/JavaToolScript.js';

export default {
  name: 'JavaTool',
  mixins: [javaToolScript]
}
</script>

<style src="@/styles/JavaToolStyle.css">
/* 样式已移至 /src/styles/JavaToolStyle.css */
</style>
