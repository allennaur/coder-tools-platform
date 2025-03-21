<template>
  <div class="timestamp-tool-container" :class="{'fullscreen-mode': isFullScreen}">
    <!-- 顶部控制面板 -->
    <div class="time-control-panel">
      <div class="panel-header with-flex">
        <div class="panel-header-left">
          <h3>时间戳转换工具</h3>
          <button class="fullscreen-btn" @click="toggleFullScreen" :title="isFullScreen ? '退出全屏' : '全屏模式'">
            <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
          </button>
        </div>
        <div class="panel-actions">
          <!-- 添加复制当前时间戳按钮 -->
          <button @click="copyCurrentTimestamp" class="tool-button">
            <i class="fas fa-copy"></i>
            复制当前时间戳
          </button>
          <button @click="getCurrentTime" class="tool-button primary-button">
            <i class="fas fa-sync-alt"></i>
            获取当前时间
          </button>
          <button @click="clearAllFields" class="tool-button">
            <i class="fas fa-eraser"></i>
            清空
          </button>
        </div>
      </div>
      
      <div class="time-display">
        <div class="current-time">
          {{ formattedCurrentTime }}
        </div>
        <div class="auto-update" :class="{'active': autoUpdate}">
          <label class="toggle-switch">
            <input type="checkbox" v-model="autoUpdate">
            <span class="toggle-slider"></span>
          </label>
          <span>自动更新</span>
        </div>
      </div>
    </div>
    
    <!-- 转换卡片区域 -->
    <div class="conversion-cards">
      <!-- 时间戳转日期时间卡片 -->
      <div class="conversion-card">
        <div class="card-header">
          <h4>时间戳 → 日期时间</h4>
        </div>
        <div class="card-body">
          <div class="input-group">
            <div class="input-with-select">
              <input 
                type="text" 
                v-model="timestampInput" 
                @input="handleTimestampInput"
                placeholder="输入秒/毫秒时间戳" 
              />
              <div class="precision-select">
                <select v-model="timestampUnit" @change="handleTimestampInput" class="visionos-select">
                  <option value="seconds">秒</option>
                  <option value="milliseconds">毫秒</option>
                </select>
              </div>
            </div>
          </div>
          <div class="result-container">
            <div class="result-group">
              <div class="result-item">
                <label>本地时间:</label>
                <input type="text" v-model="localDateTimeResult" readonly />
              </div>
              <div class="result-item">
                <label>UTC时间:</label>
                <input type="text" v-model="utcDateTimeResult" readonly />
              </div>
              <div class="result-item">
                <label>ISO格式:</label>
                <input type="text" v-model="isoDateTimeResult" readonly />
              </div>
              <div class="result-item">
                <label>相对时间:</label>
                <input type="text" v-model="relativeDateTimeResult" readonly />
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button 
            @click="copyConversionResult('timestamp')" 
            class="tool-button"
            :disabled="!hasTimestampResult"
            :class="{'disabled': !hasTimestampResult}"
          >
            <i class="fas fa-copy"></i>
            复制结果
          </button>
          <button 
            v-if="isCopyable('timestamp')" 
            @click="clearTimestampInput" 
            class="tool-button"
          >
            清空输入
          </button>
        </div>
      </div>
      
      <!-- 日期时间转时间戳卡片 -->
      <div class="conversion-card">
        <div class="card-header">
          <h4>日期时间 → 时间戳</h4>
        </div>
        <div class="card-body">
          <div class="input-group">
            <div class="date-time-inputs">
              <input 
                type="datetime-local"
                v-model="dateTimeInput" 
                @input="handleDateTimeInput"
                class="visionos-datetime"
              />
            </div>
          </div>
          <div class="result-container">
            <div class="result-group">
              <div class="result-item">
                <label>秒级时间戳:</label>
                <input type="text" v-model="secondsTimestampResult" readonly />
              </div>
              <div class="result-item">
                <label>毫秒级时间戳:</label>
                <input type="text" v-model="millisecondsTimestampResult" readonly />
              </div>
              <div class="result-item">
                <label>ISO格式:</label>
                <input type="text" v-model="isoFromDateTimeResult" readonly />
              </div>
              <div class="result-item">
                <label>Unix格式:</label>
                <input type="text" v-model="unixDateTimeResult" readonly />
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button 
            @click="copyConversionResult('datetime')" 
            class="tool-button"
            :disabled="!hasDateTimeResult"
            :class="{'disabled': !hasDateTimeResult}"
          >
            <i class="fas fa-copy"></i>
            复制结果
          </button>
          <button 
            v-if="isCopyable('datetime')" 
            @click="clearDateTimeInput" 
            class="tool-button"
          >
            清空输入
          </button>
        </div>
      </div>
    </div>
    
    <!-- 时间格式参考卡片 -->
    <div class="reference-section">
      <div class="reference-card">
        <div class="card-header">
          <h4>常用时间格式参考</h4>
        </div>
        <div class="formats-container">
          <div class="format-item" v-for="(format, index) in timeFormats" :key="index">
            <div class="format-name">{{ format.name }}</div>
            <div class="format-value">{{ format.example }}</div>
            <button 
              @click="copyText(format.example)" 
              class="tool-button mini-button"
              :disabled="!format.example"
              :class="{'disabled': !format.example}"
            >
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 时间操作工具区域 -->
    <div class="time-operations">
      <div class="operation-card">
        <div class="card-header">
          <h4>时间计算</h4>
        </div>
        <div class="card-body">
          <div class="operation-form">
            <div class="form-row">
              <div class="form-label">基准时间:</div>
              <div class="form-input">
                <input 
                  type="datetime-local" 
                  v-model="baseTimeInput"
                  @input="calculateTimeOperation"
                  class="visionos-datetime"
                />
                <button @click="useCurrentTimeAsBase" class="tool-button mini-button">
                  使用当前时间
                </button>
              </div>
            </div>
            <div class="form-row">
              <div class="form-label">操作:</div>
              <div class="form-input">
                <select 
                  v-model="timeOperation" 
                  @change="calculateTimeOperation"
                  class="visionos-select"
                >
                  <option value="add">增加时间</option>
                  <option value="subtract">减少时间</option>
                  <option value="difference">计算时间差</option>
                </select>
              </div>
            </div>
            <div class="form-row" v-if="timeOperation !== 'difference'">
              <div class="form-label">时间值:</div>
              <div class="form-input time-value-input">
                <input 
                  type="number" 
                  v-model="timeValue"
                  @input="calculateTimeOperation"
                  min="0"
                  class="visionos-number"
                />
                <select 
                  v-model="timeUnit" 
                  @change="calculateTimeOperation"
                  class="visionos-select"
                >
                  <option value="minutes">分钟</option>
                  <option value="hours">小时</option>
                  <option value="days">天</option>
                  <option value="weeks">周</option>
                  <option value="months">月</option>
                  <option value="years">年</option>
                </select>
              </div>
            </div>
            <div class="form-row" v-if="timeOperation === 'difference'">
              <div class="form-label">结束时间:</div>
              <div class="form-input">
                <input 
                  type="datetime-local" 
                  v-model="endTimeInput"
                  @input="calculateTimeOperation"
                  class="visionos-datetime"
                />
                <button @click="useCurrentTimeAsEnd" class="tool-button mini-button">
                  使用当前时间
                </button>
              </div>
            </div>
            <div class="form-row result-row">
              <div class="form-label">计算结果:</div>
              <div class="form-input">
                <input type="text" v-model="timeOperationResult" readonly />
                <button 
                  @click="copyText(timeOperationResult)" 
                  class="tool-button"
                  :disabled="!timeOperationResult"
                  :class="{'disabled': !timeOperationResult}"
                >
                  <i class="fas fa-copy"></i>
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import timestampToolScript from '@/scripts/TimestampToolScript.js';

export default {
  name: 'TimestampTool',
  mixins: [timestampToolScript]
}
</script>

<style src="@/styles/TimestampToolStyle.css">
/* 样式已移至 /src/styles/TimestampToolStyle.css */
</style>
