<template>
  <div class="visionos-container">
    <!-- 左侧工具栏 -->
    <div class="sidebar">
      <div class="menu-button" 
           v-for="(menu, index) in menus" 
           :key="index" 
           :class="{ active: activeMenu === menu.id }"
           @click="switchMenu(menu.id)">
        <div class="menu-icon">
          <i :class="menu.icon"></i>
        </div>
        <div class="menu-label">{{ menu.label }}</div>
      </div>
    </div>
    
    <!-- 主体内容区域 -->
    <div class="content">
      <!-- 主页内容 -->
      <div v-if="activeMenu === 'home'" class="home-page">
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
      
      <!-- JSON工具内容 -->
      <div v-else-if="activeMenu === 'json'" class="feature-page">
        <h2>JSON 工具</h2>
        <p>JSON格式化、验证、压缩和转换工具</p>
        <!-- JSON工具具体实现 -->
      </div>
      
      <!-- 时间戳工具内容 -->
      <div v-else-if="activeMenu === 'timestamp'" class="feature-page">
        <h2>时间戳转换工具</h2>
        <p>在不同时间格式之间快速转换</p>
        <!-- 时间戳工具具体实现 -->
      </div>
      
      <!-- Java工具内容 -->
      <div v-else-if="activeMenu === 'java'" class="feature-page">
        <h2>Java 工具</h2>
        <p>Java相关的开发辅助工具</p>
        <!-- Java工具具体实现 -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      activeMenu: 'home',
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
  methods: {
    switchMenu(menuId) {
      this.activeMenu = menuId;
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
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 80px;
  padding: 20px 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 100;
}

.menu-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 10px;
}

.menu-button:hover {
  background-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
}

.menu-button.active {
  background-color: rgba(0, 122, 255, 0.15);
  color: #007AFF;
}

.menu-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.menu-label {
  font-size: 10px;
  font-weight: 500;
}

/* 主要内容区域 */
.content {
  flex: 1;
  padding: 40px 40px 40px 120px; /* 左侧增加空间以适应固定菜单栏 */
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  text-align: left;
}

/* 主页样式 */
.home-page {
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
}

.home-page h1 {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #777;
  margin-bottom: 40px;
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
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

.card-icon {
  font-size: 24px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  border-radius: 15px;
  background: rgba(0, 122, 255, 0.1);
  color: #007AFF;
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
  overflow-y: auto;
  padding-right: 10px;
}

.feature-page h2 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
}

.feature-page p {
  color: #666;
  margin-bottom: 30px;
}
</style>
