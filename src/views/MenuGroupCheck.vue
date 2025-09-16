<template>
    <a-layout class="modern-dashboard">
      <!-- 顶部导航栏 -->
      <a-layout-header class="dashboard-header">
        <div class="logo-container">
          <img src="/src/assets/images/OpsCenter_logo.png" alt="logo" height="40">
        </div>
        <!-- 顶部菜单栏区域 -->
        <a-menu
          mode="horizontal"
          class="main-menu"
          :style="{ backgroundColor: 'transparent', border: 'none' }"
        >
          <a-menu-item
            v-for="item in MENU_GROUP"
            :key="item.value"
            @mouseenter="hoverEffect(item.value)"
            @mouseleave="resetEffect(item.value)"
          >
            <div class="menu-item-content">
              {{ item.label }}
              <div class="hover-effect"></div>
            </div>
          </a-menu-item>
        </a-menu>
        <div class="user-controls">
          <a-button type="text" class="control-btn search-btn">
            <template #icon>
              <SearchOutlined />
            </template>
          </a-button>
          <a-badge count="3" class="notification-badge">
            <a-button type="text" class="control-btn notification-btn">
              <template #icon>
                <BellOutlined />
              </template>
            </a-button>
          </a-badge>
          <a-dropdown>
            <a-avatar src="/assets/avatar.png" class="user-avatar" />
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">个人中心</a-menu-item>
                <a-menu-item key="2">设置</a-menu-item>
                <a-menu-item key="3">退出</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
  
      <!-- 主内容区域 -->
      <a-layout-content class="dashboard-content">
        <!-- 产品展示区域 -->
        <div class="products-section">
          <h2 class="section-title">产品展示</h2>
          <a-row :gutter="[16, 16]">
            <a-col :span="6">
              <div class="product-card-3d">
                <a-card
                  hoverable
                  class="product-card"
                  :bordered="false"
                  @mouseenter="cardHover('cloud')"
                  @mouseleave="cardLeave('cloud')"
                >
                  <template #cover>
                    <div class="product-image">
                      <img
                        alt="云管平台"
                        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGsnxlzKdXfLzXccio.svg"
                      />
                    </div>
                  </template>
                  <a-card-meta title="云管平台">
                    <template #description>
                      <p>统一管理云资源，提升运维效率</p>
                    </template>
                  </a-card-meta>
                  <div class="product-footer">
                    <a-tag color="blue">热门</a-tag>
                    <a-button type="text" class="product-btn">了解详情</a-button>
                  </div>
                </a-card>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="product-card-3d">
                <a-card
                  hoverable
                  class="product-card"
                  :bordered="false"
                  @mouseenter="cardHover('monitor')"
                  @mouseleave="cardLeave('monitor')"
                >
                  <template #cover>
                    <div class="product-image">
                      <img
                        alt="监控告警"
                        src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                      />
                    </div>
                  </template>
                  <a-card-meta title="监控告警">
                    <template #description>
                      <p>实时监控系统状态，及时发现异常</p>
                    </template>
                  </a-card-meta>
                  <div class="product-footer">
                    <a-tag color="green">推荐</a-tag>
                    <a-button type="text" class="product-btn">了解详情</a-button>
                  </div>
                </a-card>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="product-card-3d">
                <a-card
                  hoverable
                  class="product-card"
                  :bordered="false"
                  @mouseenter="cardHover('security')"
                  @mouseleave="cardLeave('security')"
                >
                  <template #cover>
                    <div class="product-image">
                      <img
                        alt="安全管理"
                        src="https://gw.alipayobjects.com/zos/rmsportal/nywPxKxWMHPcAeO.svg"
                      />
                    </div>
                  </template>
                  <a-card-meta title="安全管理">
                    <template #description>
                      <p>全方位保障系统安全，防止数据泄露</p>
                    </template>
                  </a-card-meta>
                  <div class="product-footer">
                    <a-tag color="orange">新上线</a-tag>
                    <a-button type="text" class="product-btn">了解详情</a-button>
                  </div>
                </a-card>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="product-card-3d">
                <a-card
                  hoverable
                  class="product-card"
                  :bordered="false"
                  @mouseenter="cardHover('permission')"
                  @mouseleave="cardLeave('permission')"
                >
                  <template #cover>
                    <div class="product-image">
                      <img
                        alt="用户权限"
                        src="https://gw.alipayobjects.com/zos/rmsportal/siCrBbdgKHfKbqgYXAsJ.svg"
                      />
                    </div>
                  </template>
                  <a-card-meta title="用户|权限">
                    <template #description>
                      <p>精细化管理用户权限，确保操作合规</p>
                    </template>
                  </a-card-meta>
                  <div class="product-footer">
                    <a-tag color="purple">基础版</a-tag>
                    <a-button type="text" class="product-btn">了解详情</a-button>
                  </div>
                </a-card>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-layout-content>
  
      <!-- 页脚 -->
      <a-layout-footer class="dashboard-footer">
        <div class="footer-content">
          <p>© 2025 多云管理平台</p>
          <div class="footer-links">
            <a-link href="#">帮助中心</a-link>
            <a-link href="#">隐私政策</a-link>
            <a-link href="#">联系我们</a-link>
          </div>
        </div>
      </a-layout-footer>
    </a-layout>
  </template>
  
<script setup>
import { ref, onMounted } from 'vue';
import {
    SearchOutlined,
    BellOutlined
} from '@ant-design/icons-vue';
    
const MENU_GROUP = [
    { label: '云管平台', value: 'cloud' },
    { label: '监控告警', value: 'monitor' },
    { label: '安全管理', value: 'security' },
    { label: '用户|权限', value: 'permission' }
];
    
const currentDate = ref('');
    
onMounted(() => {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    currentDate.value = now.toLocaleDateString('zh-CN', options);
});
    
const hoverEffect = (menuValue) => {
    console.log(`Hovering over ${menuValue}`);
};
    
const resetEffect = (menuValue) => {
    console.log(`Leaving ${menuValue}`);
};
    
const cardHover = (cardType) => {
    console.log(`Hovering over ${cardType} card`);
};
    
const cardLeave = (cardType) => {
    console.log(`Leaving ${cardType} card`);
};
</script>
  
  <style scoped>
  :root {
    --primary-color: #1890ff;
    --secondary-color: #52c41a;
    --accent-color: #f5222d;
    --text-color: #333;
    --light-text: #666;
    --bg-color: #f5f7fa;
    --card-bg: #fff;
    --border-color: #e8e8e8;
    --transition: all 0.3s ease;
  }
  
  .modern-dashboard {
    min-height: 100vh;
  }
  
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px !important;
    background-color: var(--card-bg) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  }
  
  .logo-container {
    display: flex;
    align-items: center;
    margin-right: 20px;
  }
  
  .logo {
    height: 32px;
    margin-right: 12px;
  }
  
  .main-menu {
    flex: 1;
    max-width: 600px;
    margin: 0 16px;
  }
  
  .menu-item-content {
    position: relative;
  }
  
  .hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.2), transparent);
    opacity: 0;
    transition: var(--transition);
  }
  
  .menu-item-content:hover .hover-effect {
    opacity: 1;
    transform: translateX(-5px);
  }
  
  .user-controls {
    display: flex;
    align-items: center;
  }
  
  .control-btn {
    font-size: 20px;
    margin-left: 16px;
  }
  
  .notification-badge {
    margin-left: 16px;
  }
  
  .user-avatar {
    margin-left: 16px;
  }
  
  .dashboard-content {
    padding: 24px;
    background-color: var(--bg-color);
  }
  
  .products-section {
    margin-bottom: 24px;
  }
  
  .section-title {
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 500;
  }
  
  /* 3D效果产品卡片 */
  .product-card-3d {
    perspective: 1000px;
    height: 100%;
  }
  
  .product-card {
    transition: var(--transition);
    height: 100%;
    transform-style: preserve-3d;
    position: relative;
  }
  
  .product-card:hover {
    transform: translateY(-10px) rotateY(5deg);
    box-shadow: var(--shadow);
  }
  
  .product-image {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 160px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
    border-radius: 8px;
    padding: 20px;
  }
  
  .product-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }
  
  .product-btn {
    padding: 0;
  }
  
  .dashboard-footer {
    background-color: var(--card-bg);
    padding: 16px 24px;
    border-top: 1px solid var(--border-color);
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .footer-links a {
    color: var(--light-text);
    margin-left: 16px;
    text-decoration: none;
  }
  
  .footer-links a:hover {
    color: var(--primary-color);
  }
  </style>