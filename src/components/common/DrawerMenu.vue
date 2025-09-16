<script setup>
import { userCommonMessageStore } from '@/stores/user';
import {orderBy} from "xe-utils";


let userCommonStore = userCommonMessageStore();
let isOpen = ref(false); // 用于头部的header 是否打开
let userMenus = ref({}); // 获取当前用户有那一些菜单的权限
let leftAnthorItems = ref([]); // 左侧菜单栏的绘制
let getMenuLoading = ref(false); // 获取菜单的loading
let getMenuErrorMessage = ref(null); // 获取菜单时返回的错误信息
let searchText = ref(''); // 搜索关键字
let searchResults = ref([]); // 搜索结果
let highlightedCard = ref(null); // 当前高亮的卡片

// 获取当前登录用户的菜单权限
const handleGetUserMenu = () =>  {
    leftAnthorItems.value = [];
    getMenuLoading.value = true;
    getMenuErrorMessage.value = null;

    userCommonStore.getUserMenusList()
        .then(res => {
            if (res) {
                getMenuLoading.value = false;
                userMenus.value = res;
                let result = orderBy(Object.values(res), [['sorting', 'asc']]);
                for (let item in result) {
                    let {menu_name, sid} = result[item];
                    leftAnthorItems.value.push({
                        key: `menu_level1_${sid}`,
                        href: `#menu_level1_${sid}`,
                        title: menu_name,
                    });
                }
            }
        })
        .catch((error) => {
            getMenuErrorMessage.value = error?.response?.data?.msg;
            getMenuLoading.value = false;
        });
};

/** 用于头部的header 是否打开 --Start**/
// 处理打开
const handleSystemMenuOpen = () => {
    isOpen.value = !isOpen.value;
};
// 处理抽屉弹窗关闭
const handleSystemMenuClose = () => {
    isOpen.value = false;
};
/** 用于头部的header 是否打开 --End**/

// 弹窗中的左侧菜单滚动的容器
const handleLeftMenuScroll = () => {
    return document.getElementById('menu_components_container');
};

const handleDrawerContainer = () => {
    return document.getElementById('page_components_container');
};

// 搜索处理函数
const handleSearch = (value) => {
    searchText.value = value;
    if (!value) {
        searchResults.value = [];
        return;
    }
  
    // 搜索所有二级菜单
    const results = [];
    Object.values(userMenus.value).forEach(level1 => {
        level1.submenu?.forEach(menu => {
            if (menu.menu_name.toLowerCase().includes(value.toLowerCase())) {
                results.push({
                    level1Id: level1.sid,
                    menu
                });
            }
        });
    });
    searchResults.value = results;
  
    // 如果有搜索结果，滚动到第一个结果并高亮
    if (results.length > 0) {
        const firstResult = results[0];
        const element = document.getElementById(`menu_${firstResult.menu.sid}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightCard(firstResult.menu.sid);
        }
    }
};

// 高亮卡片效果
const highlightCard = (menuId) => {
    highlightedCard.value = menuId;
    setTimeout(() => {
        highlightedCard.value = null;
    }, 2000); // 2秒后取消高亮
};

onMounted(async () => {
    await handleGetUserMenu();
});

</script>
<template>
    <a-button size="small" ghost @click="handleSystemMenuOpen">
        <template #icon>
            <CloseOutlined v-if="isOpen"/>
            <MenuOutlined v-else/>
        </template>
    </a-button>
    <a-drawer
        :get-container="handleDrawerContainer()"
        :root-style="{ position: 'absolute' }"
        :width="1268"
        placement="left"
        :open="isOpen"
        @close="handleSystemMenuClose"
    >
        <template #title>

        </template>
        <a-spin :spinning="getMenuLoading">
            <a-flex justify="space-between">
                <a-flex flex="5em" vertical>
                    <div style="margin-bottom: 1em; font-size: 16px">
                        <i class="vxe-icon-custom-column"></i> 所有服务
                    </div>
                    <a-anchor
                        :affix="false"
                        :style="{ height: 'calc(100vh - 64px - 35px)' }"
                        :items="leftAnthorItems"
                        :get-container="handleLeftMenuScroll"
                    >
                    </a-anchor>
                </a-flex>
                <a-flex vertical  flex="60%">
                    <div style="position: sticky; top: 0px; z-index: 1; background: white; padding: 16px 0;">
                        <a-input 
                            v-model:value="searchText"
                            placeholder="搜索二级菜单" 
                            style="width: 100%"
                            allow-clear
                            @change="(e) => handleSearch(e.target.value)"
                        >
                            <template #prefix>
                                <SearchOutlined />
                            </template>
                        </a-input>
                        <!-- 搜索结果提示 -->
                        <div v-if="searchResults.length" class="search-results">
                            找到 {{ searchResults.length }} 个匹配结果
                        </div>
                    </div>
                    <div id="menu_components_container">
                        <template v-for="{sid, menu_name, submenu} in $utils.orderBy(Object.values(userMenus), [['sorting', 'asc']])" :key="`menu_level1_${sid}`">
                            <a-card 
                                :id="`menu_level1_${sid}`" 
                                :title="menu_name" 
                                :bordered="false"
                                class="menu-section"
                            >
                                <template v-for="menu in submenu" :key="menu.sid">
                                    <a-card-grid 
                                        :id="`menu_${menu.sid}`"
                                        :class="[
                                            'menu-grid',
                                            { 'highlight-card': highlightedCard === menu.sid }
                                        ]"
                                        style="width: 24%; margin-bottom: 5px; margin-right: 5px"
                                    >
                                        <router-link :to="{path:  menu.vue_url}" @click="isOpen = false;">
                                            <a-flex justify="space-between" align="center">
                                                <SvgIcon 
                                                    :iconname="menu.icon" 
                                                    class="menu-icon" 
                                                    style="font-size: 50px; margin-right: 12px;"
                                                />
                                                <a-flex 
                                                    vertical 
                                                    align="flex-start" 
                                                    justify="center" 
                                                    style="flex: 1;"
                                                >
                                                    <h3 style="margin: 0;">{{menu?.menu_name}}</h3>
                                                </a-flex>
                                            </a-flex>
                                        </router-link>
                                    </a-card-grid>
                                </template>
                            </a-card>
                        </template>
                        <template v-if="leftAnthorItems.length === 0">
                            <a-empty>
                                <template #description>
                                    该业态无菜单权限数据
                                </template>
                            </a-empty>
                        </template>
                    </div>
                </a-flex>
            </a-flex>
            <a-tag v-if="getMenuErrorMessage" color="error">{{getMenuErrorMessage}}</a-tag>
        </a-spin>
    </a-drawer>
</template>


<style scoped lang="less">
.ant-card-grid {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .menu-icon {
    color: var(--primary-color);
    transition: all 0.3s ease;
  }

  &:hover .menu-icon {
    transform: scale(1.1);
  }

  h3 {
    color: var(--text-color);
    font-size: 16px;
    line-height: 1.4;
  }

  a {
    text-decoration: none;
    display: block;
    height: 100%;
  }
}

// 确保卡片内容垂直居中
:deep(.ant-card-grid) {
  display: flex;
  align-items: center;
  padding: 16px;
  height: 90px;
}

.menu-section {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:not(:last-child) {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 98%;
      height: 1px;
      background: var(--border-color-split);
    }
  }
}

.search-results {
  margin-top: 8px;
  padding: 4px 0;
  color: var(--text-color-secondary);
  font-size: 13px;
}

.menu-grid {
  transition: all 0.3s ease;
  background: #fff;
  
  &.highlight-card {
    animation: highlight 2s ease-in-out;
  }
}

@keyframes highlight {
  0%, 100% {
    background: #fff;
  }
  50% {
    background: rgba(var(--primary-color), 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
</style>
