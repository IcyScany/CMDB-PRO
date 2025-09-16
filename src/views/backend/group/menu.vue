<script setup>
import MenuConfig from './MenuConfig.vue';
//import TitleGroup from './TitleGroup.vue';
import FirstMenu from './FirstMenu.vue';

const activeTab = ref('firstMenu');
</script>

<template>
  <a-tabs v-model:activeKey="activeTab" class="h-full">
     <a-tab-pane key="firstMenu" tab="一级菜单">
        <FirstMenu />
     </a-tab-pane>
      <a-tab-pane key="menu" tab="二级菜单">
        <MenuConfig />
      </a-tab-pane>
     <!--  <a-tab-pane key="titleGroup" tab="Title分组">
        <TitleGroup />
      </a-tab-pane> -->
    </a-tabs>
</template>

<style scoped>

:deep(.ant-tabs-content) {
    height: 100%;
}
</style>