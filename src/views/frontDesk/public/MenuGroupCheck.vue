<script setup>
import { userCommonMessageStore } from '@/stores/user';
import { useRouter } from 'vue-router';

const userCommonStore = userCommonMessageStore();
let menuGroupList = computed(() => userCommonStore.menuGroupList || []); // 菜单组
const router = useRouter();

const handleClick = (name) => {
    userCommonStore.setCheckedMenuGroup(name);
    router.push({ name: 'homePage' });
};

</script>

<template>
  <div class="product-cloud-container">
    <div class="content-wrapper">
      <div class="section-header">
        <!-- <h1 class="main-title">产品类别</h1> -->
        <p class="subtitle">选择您需要的产品，开启云服务之旅</p>
      </div>
      
      <div class="products-grid">
        <template v-if="menuGroupList && menuGroupList.length">
          <div class="product-cards">
            <div v-for="{name, cn_name, describe} in menuGroupList" 
                 :key="name" 
                 class="product-card"
                 @click="handleClick(name)">
              <div class="card-background">
                <img :alt="cn_name" :src="$CONFIG?.MENU_GROUP_TYPE[name]?.imgUrl" />
                <div class="overlay"></div>
              </div>
              <div class="card-content">
                <div class="product-info">
                  <h3 class="product-title">{{ cn_name }}</h3>
                  <p class="product-description">{{ describe }}</p>
                  <div class="product-footer">
                    <a-tag :color="$CONFIG?.MENU_GROUP_TYPE[name]?.tag.type" class="product-tag">
                      {{ $CONFIG?.MENU_GROUP_TYPE[name]?.tag.label }}
                    </a-tag>
                    <a-button type="link" class="learn-more">
                      了解详情
                      <span class="arrow">→</span>
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <a-empty v-else></a-empty>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-cloud-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 40px 0;
}

.content-wrapper {
 
  margin: 0 auto;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.main-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 25px;
  color: #666;
  margin: 0;
}

.products-grid {
  width: 100%;
}

.product-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin: 0 auto;
}

.product-card {
  position: relative;
  height: auto;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-background {
  position: relative;
  width: 100%;
  height: 200px;
}

.card-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.3)
  );
}

.card-content {
  position: relative;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
}

.product-info {
  color: #333;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.product-description {
  font-size: 14px;
  line-height: 1.6;
  
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 50px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.product-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.learn-more {
  color: #2d8cf0 !important;
  font-size: 14px;
  padding: 0;
  height: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow {
  transition: transform 0.3s ease;
}

.learn-more:hover .arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .product-cards {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
  
  .content-wrapper {
    padding: 0 16px;
  }
  
  .main-title {
    font-size: 24px;
  }
  
  .card-background {
    height: 180px;
  }
}
</style>