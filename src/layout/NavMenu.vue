<script setup>
import { userCommonMessageStore } from '@/stores/user';
let userCommonStore = userCommonMessageStore();
let currentMenus = computed(() => userCommonStore.menuList || {});
import { uniq } from 'xe-utils';

defineProps({
    searchKeys: {
        type: String,
        default: ''
    }
});

const handleImageError = (e) => {
    e.target.src = '/images/default.png';
};


let searchResult = reactive({
    selectedKeys: [],
    openKeys: [],
});

const handleSearch = (value) => {
    if(value) { 
        for(let menu_1 of Object.values(currentMenus.value)) {
            for(let menu_2 of menu_1.submenu) {
                let idx = searchResult.openKeys.indexOf(menu_1.sid);
                if(menu_2.menu_name.toLowerCase().indexOf(value) > -1) {
                    searchResult.selectedKeys.push(menu_2.sid);
                    searchResult.openKeys.push(menu_1.sid);
                } else {
                    if(idx > -1) {
                        searchResult.openKeys.splice(idx, 1);
                    }
                }
            }
        }
    } else {
        searchResult.selectedKeys = [];
        searchResult.openKeys = [];
    }
    
    return {
        selectedKeys: uniq(searchResult.selectedKeys),
        openKeys: uniq(searchResult.openKeys)
    };
};

const  highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;

    // 转义正则表达式中的特殊字符
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 创建大小写不敏感的正则表达式
    const regex = new RegExp(escapedTerm, 'gi');
    
    // 替换匹配项为高亮文本
    return text.replace(regex, (match) => {
        // 返回高亮的 span，保留原文的大小写
        return `<span style="color: red;">${match}</span>`;
    });
};

defineExpose({
    handleSearch
});
</script>

<template>

    <template v-for="menu_1 in $utils.orderBy(Object.values(currentMenus), [['sorting', 'asc']])" :key="menu_1.sid || menu_1?.vue_url">
        <a-sub-menu v-if="menu_1?.submenu.length" :key="menu_1.sid || menu_1?.vue_url">
        <template #title>
            <span class="menu-item-content">
                <img :src="`/images/${menu_1.icon}.png`" style="width: 25px;height: 25px;" @error="handleImageError"/>
                <span>{{ menu_1.menu_name }}</span>
            </span>
        </template>
        <template v-if="menu_1?.submenu">
          
            <template v-for="leve2 in menu_1?.submenu" :key="leve2.sid || leve2?.vue_url">
              
                <a-menu-item v-if="!leve2.hidden" :key="leve2.sid || leve2?.vue_url">
                    <router-link :to="leve2?.vue_url" class="menu-item-content">
                        <img :src="`/images/${leve2.icon}.png`" style="width: 16px;height: 16px;" @error="handleImageError"/>
                        <span v-if="searchKeys && leve2.menu_name.toLowerCase().indexOf(searchKeys.trim().toLowerCase()) > -1" v-html="highlightText(leve2.menu_name, searchKeys.trim())">
                            
                        </span>
                        <span v-else>
                            {{ leve2.menu_name }}
                        </span>
                       
                

                        
                    </router-link>
                </a-menu-item>
            </template>
        </template>
    </a-sub-menu>
    </template>
    
</template>

<style>
.menu-item-content {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

/* 二级菜单图标样式 */
.submenu-icon {
    width: 1.8rem;
    height: 1.4rem;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 4px;
    padding: 4px;
}

/* 一级菜单图标样式 */
.xy-level1-icon {
    width: 2.2rem;
    height: 1.8rem;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 4px;
    padding: 5px;
}

/* 暗色主题下的图标背景 */
.ant-menu-dark .xy-level1-icon,
.ant-menu-dark .submenu-icon {
    background-color: rgba(255, 255, 255, 0.08);
}

/* 选中状态下的图标背景 */
.ant-menu-item-selected .submenu-icon,
.ant-menu-submenu-selected .xy-level1-icon {
    background-color: var(--primary-1);
}

/* 深色主题下选中状态的图标背景 */
.ant-menu-dark .ant-menu-item-selected .submenu-icon,
.ant-menu-dark .ant-menu-submenu-selected .xy-level1-icon {
    background-color: rgba(255, 255, 255, 0.15);
}

/* 保持原有样式 */
.ant-menu-light.ant-menu-horizontal > .ant-menu-submenu-selected {
    background-color: var(--primary-1) !important;
}

.ant-menu-dark.ant-menu-horizontal > .ant-menu-submenu-selected {
    background-color: var(--primary-5) !important;
}

.ant-menu-light.ant-menu-horizontal > .ant-menu-item-selected {
    background-color: unset !important;
}

.ant-menu-dark.ant-menu-horizontal > .ant-menu-item-selected {
    background-color: var(--primary-5) !important;
}

.xy-pd20 {
    padding: 20px;
}
</style>
