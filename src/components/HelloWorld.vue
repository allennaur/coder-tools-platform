<template>
  <div class="visionos-container">
    <!-- 左侧工具栏 -->
    <div class="sidebar">
      <div class="active-bg-indicator" :style="activeIndicatorStyle"></div>
      <div class="menu-button" 
           v-for="(menu, index) in menus" 
           :key="index" 
           :class="{ active: activeMenu === menu.id }"
           :id="`menu-button-${menu.id}`"
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
      activeMenuIndex: 0, 
      menus: [
        {
          id: 'home',
          label: '主页',
          icon: 'fas fa-home', // 保持原有图标
          description: '平台主页'
        },
        {
          id: 'json',
          icon: 'fas fa-code-branch', // 更新为可用的JSON相关图标
          label: 'JSON',
          description: 'JSON格式化、验证、压缩和转换工具，帮助开发者更高效地处理JSON数据'
        },
        {
          id: 'timestamp',
          label: '时间戳',
          icon: 'fas fa-clock', // 保持原有图标
          description: '时间戳与日期格式互转，支持多种时间格式和时区转换'
        },
        {
          id: 'java',
          label: 'Java 工具',
          icon: 'fas fa-code', // 保持更通用的代码图标
          description: 'Java相关工具，包括代码格式化、类结构分析等功能'
        }
      ]
    }
  },
  computed: {
    activeIndicatorStyle() {
      const menuIndex = this.menus.findIndex(menu => menu.id === this.activeMenu);
      if (menuIndex === -1) return {};
      
      // 微调位置确保完美对齐，调整按钮大小
      const buttonHeight = 44; // 按钮高度从48px减小到44px
      const gap = 16; // 保持相同的间距
      const topPadding = 16; // 保持相同的顶部内边距
      const offsetY = topPadding + menuIndex * (buttonHeight + gap);
      
      return {
        top: `${offsetY}px`,
        opacity: 1
      };
    }
  },
  methods: {
    // 添加新方法来更新活动菜单索引
    updateActiveMenuIndex() {
      this.activeMenuIndex = this.menus.findIndex(menu => menu.id === this.activeMenu);
    },
    
    switchMenu(menuId) {
      this.activeMenu = menuId;
      // 在状态更新后调用方法更新索引
      this.$nextTick(() => {
        this.updateActiveMenuIndex();
        
        const activeBtn = this.$el.querySelector('.menu-button.active');
        if (activeBtn) {
          // 根据实际按钮位置调整指示器位置
          const rect = activeBtn.getBoundingClientRect();
          const sidebar = this.$el.querySelector('.sidebar');
          const sidebarRect = sidebar.getBoundingClientRect();
          const top = rect.top - sidebarRect.top;
          
          // 更新指示器样式
          const indicator = this.$el.querySelector('.active-bg-indicator');
          if (indicator) {
            indicator.style.top = `${top}px`;
          }
        }
      });
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
  background: linear-gradient(135deg, rgba(240,240,250,0.8) 0%, rgba(230,230,250,0.7) 100%); /* 调整背景，更符合VisionOS的柔和风格 */
  position: relative;
  overflow: hidden; /* 确保内容不会溢出 */
}

/* 侧边栏样式 - 调整为更窄的宽度 */
.sidebar {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 56px; /* 减小宽度，从64px改为56px */
  padding: 16px 6px; /* 减小内边距，从16px 8px改为16px 6px */
  background: rgba(255, 255, 255, 0.4);
  border-radius: 28px; /* 稍微减小圆角，从32px改为28px */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.6);
  height: auto;
  min-height: fit-content;
  max-height: 80vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 隐藏Webkit浏览器的滚动条 */
.sidebar::-webkit-scrollbar {
  display: none;
}

/* 修改活动指示器样式 - 调整大小适应更窄的工具栏 */
.active-bg-indicator {
  position: absolute;
  width: 44px; /* 从48px减小到44px */
  height: 44px; /* 从48px减小到44px */
  border-radius: 50%; /* 圆形指示器 */
  /* 使用纯色渐变，不含透明度 */
  background: linear-gradient(135deg, rgb(254, 75, 197) 0%, rgb(152, 47, 246) 100%);
  transition: top 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  opacity: 1;
  left: 50%;
  transform: translateX(-50%);
  z-index: -1;
  /* 更精致的阴影效果 */
  box-shadow: 0 5px 15px rgba(254, 75, 197, 0.3), 0 0 30px rgba(152, 47, 246, 0.2);
  /* 添加内部光晕效果 */
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* 菜单按钮样式 - 调整大小 */
.menu-button {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px; /* 从48px减小到44px */
  height: 44px; /* 从48px减小到44px */
  border-radius: 50%; /* 使用圆形按钮，与指示器匹配 */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); /* 更平滑的过渡 */
  z-index: 2;
  /* 移除默认背景和边框 */
  background: transparent;
  border: none;
}

.menu-button:hover {
  background: transparent;
  border: none;
  box-shadow: none;
  transform: none; /* 移除整体缩放 */
}

.menu-button:hover .menu-icon {
  transform: scale(1.15); /* 仅放大图标 */
  /* 使用更柔和的颜色过渡 */
  color: rgba(115, 103, 240, 0.9);
}

.menu-icon {
  font-size: 18px; /* 从20px减小到18px，使图标略微小一些 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); /* 更平滑的过渡效果 */
  /* 添加transform-origin以确保放大效果居中 */
  transform-origin: center;
  height: 22px; /* 确保所有图标高度一致 */
  width: 22px; /* 确保所有图标宽度一致 */
}

.menu-icon i {
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 修改菜单按钮活动态样式 - 确保图标颜色与背景色协调 */
.menu-button.active {
  /* 保持图标文本颜色为白色，以便在纯色背景上易于辨认 */
  color: white;
  background: transparent;
  box-shadow: none;
  border: none;
  transform: none;
  z-index: 3; /* 确保图标在指示器上方 */
}

.menu-button.active .menu-icon {
  /* 设置为白色，添加轻微发光效果增强可见性 */
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transform: scale(1.15);
}

/* 工具提示样式 */
.tooltip {
  position: absolute;
  left: 70px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  white-space: nowrap;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-weight: 500;
  color: #333;
  z-index: 1000;
  pointer-events: none;
  display: block;
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

/* 调整内容区域的左侧内边距，以适应更窄的侧边栏 */
.content-wrapper {
  height: 100%;
  width: 100%;
  padding: 0 40px 0 86px; /* 左侧内边距从90px减小到86px */
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
  font-size: 38px; /* 增大标题 */
  font-weight: 600;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #0077FF 0%, #5856D6 100%); /* 更符合苹果色系 */
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.subtitle {
  color: #666;
  margin-bottom: 50px; /* 增加间距 */
  text-align: center;
  font-size: 18px; /* 增大字号 */
  font-weight: 400; /* 调整字重 */
}

/* 卡片样式 */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.tool-card {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 25px; /* 增加内间距 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  transition: all 0.4s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  tabindex: "0";
}

.tool-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.8);
}

/* 优化卡片图标样式 */
.card-icon {
  font-size: 24px;
  width: 60px;
  height: 60px;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  border-radius: 20px;
  background: rgba(0, 122, 255, 0.1);
  color: #0077FF;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 122, 255, 0.2); /* 添加边框 */
}

.tool-card:hover .card-icon {
  background: rgba(0, 122, 255, 0.15);
  transform: scale(1.08);
  box-shadow: 0 5px 15px rgba(0, 122, 255, 0.15);
}

.card-content h3 {
  font-size: 20px; /* 增大标题 */
  margin: 0 0 10px 0;
  font-weight: 600;
}

.card-content p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
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
  font-size: 30px; /* 增大标题 */
  margin-bottom: 12px;
  color: #333;
  background: linear-gradient(135deg, #0077FF 0%, #5856D6 100%);
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

/* 修复菜单按钮焦点样式 */
.menu-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.6);
}

.menu-button.active:focus {
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

/* 工具卡片焦点样式 */
.tool-card:focus {
  outline: none;
  box-shadow: 0 10px 30px rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.3);
}
</style>
