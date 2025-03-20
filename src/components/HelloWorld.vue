<template>
  <div class="visionos-container">
    <!-- 左侧工具栏 -->
    <div class="sidebar">
      <div class="active-bg-indicator" :style="activeIndicatorStyle"></div>
      <div class="menu-button" 
           v-for="(menu, index) in menus" 
           :key="index" 
           :class="{ active: activeMenu === menu.id }"
           @click="switchMenu(menu.id)">
        <div class="menu-icon">
          <i :class="menu.icon"></i>
        </div>
        <span class="tooltip">{{ menu.label }}</span>
      </div>
    </div>
    
    <!-- 主体内容区域 -->
    <div class="content">
      <!-- 使用Vue的过渡组件包装内容 -->
      <transition name="fade-transform" mode="out-in">
        <!-- 主页内容 -->
        <div v-if="activeMenu === 'home'" class="content-wrapper" key="home">
          <div class="home-page">
            <h1>欢迎使用 Coder Tools Platform</h1>
            <p class="subtitle">专为开发者打造的高效工具集</p>
            
            <div class="cards-container">
              <div class="tool-card" v-for="(menu, index) in menus.filter(m => m.id !== 'home')" :key="index" @click="switchMenu(menu.id)">
                <div class="card-icon">
                  <i :class="menu.icon"></i>
                </div>
                <div class="card-content">
                  <h3>{{ menu.label }}</h3>
                  <p>{{ menu.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- JSON工具内容 -->
        <div v-else-if="activeMenu === 'json'" class="content-wrapper" key="json">
          <div class="feature-page json-feature-page">
            <div class="feature-header">
              <h2>JSON 工具</h2>
              <p>JSON格式化、验证、压缩和转换工具</p>
            </div>
            <JsonTool />
          </div>
        </div>
        
        <!-- 时间戳工具内容 -->
        <div v-else-if="activeMenu === 'timestamp'" class="content-wrapper" key="timestamp">
          <div class="feature-page">
            <h2>时间戳转换工具</h2>
            <p>在不同时间格式之间快速转换</p>
            <!-- 时间戳工具具体实现 -->
          </div>
        </div>
        
        <!-- Java工具内容 -->
        <div v-else-if="activeMenu === 'java'" class="content-wrapper" key="java">
          <div class="feature-page">
            <h2>Java 工具</h2>
            <p>Java相关的开发辅助工具</p>
            <!-- Java工具具体实现 -->
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import JsonTool from './JsonTool.vue';

export default {
  name: 'HelloWorld',
  components: {
    JsonTool
  },
  props: {
    msg: String
  },
  data() {
    return {
      activeMenu: 'home',
      hoverMenu: null,
      menus: [
        {
          id: 'home',
          label: '主页',
          icon: 'fas fa-home',
          description: '平台主页'
        },
        {
          id: 'json',
          label: 'JSON',
          icon: 'fas fa-code',
          description: 'JSON格式化、验证、压缩和转换工具，帮助开发者更高效地处理JSON数据'
        },
        {
          id: 'timestamp',
          label: '时间戳',
          icon: 'fas fa-clock',
          description: '时间戳与日期格式互转，支持多种时间格式和时区转换'
        },
        {
          id: 'java',
          label: 'Java 工具',
          icon: 'fab fa-java',
          description: 'Java相关工具，包括代码格式化、类结构分析等功能'
        }
      ]
    }
  },
  computed: {
    activeIndicatorStyle() {
      const menuIndex = this.menus.findIndex(menu => menu.id === this.activeMenu);
      if (menuIndex === -1) return {};
      
      // 计算当前选中按钮的位置 (每个按钮高度 + 间距)
      const buttonHeight = 45; // 按钮高度
      const gap = 15; // 按钮之间的间距
      const offsetY = menuIndex * (buttonHeight + gap); // 不再加上顶部padding
      
      return {
        transform: `translateY(${offsetY}px) translateX(-50%)`,
        opacity: 1
      };
    }
  },
  methods: {
    switchMenu(menuId) {
      this.activeMenu = menuId;
    },
    handleMouseEnter(menuId) {
      this.hoverMenu = menuId;
    },
    handleMouseLeave() {
      this.hoverMenu = null;
    }
  }
}
</script>

<style scoped>
/* VisionOS 风格的基础样式 */
.visionos-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', 'Helvetica Neue', sans-serif;
  color: #333;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,250,0.9) 100%);
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 55px;
  padding: 15px 5px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.7);
  /* 确保容器大小完全由内容决定 */
  height: auto;
  min-height: fit-content;
  max-height: 80vh; /* 限制最大高度为视窗高度的80% */
  overflow-y: auto; /* 内容过多时显示滚动条 */
  /* 隐藏滚动条但保持功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* 隐藏Webkit浏览器的滚动条 */
.sidebar::-webkit-scrollbar {
  display: none;
}

.active-bg-indicator {
  position: absolute;
  width: 45px;
  height: 45px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255,76,197,0.9) 0%, rgba(151,47,246,0.9) 100%);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  opacity: 0;
  /* 修改定位方式，确保水平居中 */
  left: 50%;
  top: 15px; /* 顶部padding */
  transform: translateX(-50%);
  z-index: -1;
  box-shadow: 0 4px 15px rgba(255,76,197,0.3);
}

.menu-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45px;
  height: 45px;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.7);
  transform: scale(1.08);
}

.menu-button.active {
  color: white;
  background-color: transparent;
  box-shadow: none;
  transform: scale(1.08);
}

.menu-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 彻底重写工具提示样式 */
.tooltip {
  position: absolute;
  left: 60px;
  background: rgba(255, 255, 255, 0.95);
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  font-weight: 500;
  color: #333;
  z-index: 1000;
  pointer-events: none;
  display: block; /* 确保元素显示为块级元素 */
}

.menu-button:hover .tooltip {
  opacity: 1; 
  visibility: visible;
  transform: translateX(0);
}

.menu-button.active:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

/* 主要内容区域 */
.content {
  flex: 1;
  padding: 0;
  overflow: hidden;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.content-wrapper {
  height: 100%;
  width: 100%;
  padding: 0 40px 0 90px; /* 左侧增加空间以适应固定菜单栏 */
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 主页样式 */
.home-page {
  height: 100%;
  width: 100%;
  max-width: 1200px;
  overflow-y: auto;
  padding: 40px 20px;
  box-sizing: border-box;
}

.home-page h1 {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.subtitle {
  color: #777;
  margin-bottom: 40px;
  text-align: center;
}

/* 卡片样式 */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.tool-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

/* 优化卡片图标样式 */
.card-icon {
  font-size: 24px;
  width: 56px;
  height: 56px; /* 增加高度，确保为正方形 */
  min-width: 56px; /* 确保最小宽度 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  border-radius: 18px; /* 增加圆角使其更加柔和 */
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
  transition: all 0.3s ease;
}

.tool-card:hover .card-icon {
  background: rgba(0, 122, 255, 0.2); /* 悬停时背景色更深 */
  transform: scale(1.05); /* 轻微放大效果 */
}

.card-content h3 {
  font-size: 18px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.card-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 功能页面样式 */
.feature-page {
  height: 100%;
  width: 100%;
  max-width: 1200px;
  overflow-y: auto;
  padding: 40px 20px;
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
}

/* JSON 工具页面特殊样式 */
.json-feature-page {
  max-width: 90%;
  padding: 20px;
}

.feature-header {
  margin-bottom: 15px;
}

.json-feature-page h2 {
  font-size: 24px;
  margin-bottom: 5px;
}

.json-feature-page p {
  margin-bottom: 10px;
  font-size: 14px;
}

.feature-page h2 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
  background: linear-gradient(135deg, rgba(255,76,197,1) 0%, rgba(151,47,246,1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.feature-page p {
  color: #666;
  margin-bottom: 20px;
}

/* 功能工具占据剩余空间 */
.feature-page > :last-child {
  flex: 1;
  margin-top: 10px;
}

/* 添加页面过渡效果 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
