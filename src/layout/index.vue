<script setup>
import BasicLayout from '@/layout/menu/BasicLayout.vue';
import MixedLayout from '@/layout/menu/MixedLayout.vue';
import TopLayout from '@/layout/menu/TopLayout.vue';
import { useGlobalStore, userCommonMessageStore } from '@/stores';
import { primaryColor }  from '@/assets/less/variable.module.less';
// import systemConfig from '@/config/index';
import { generate } from '@ant-design/colors';
import { useRoute } from 'vue-router';
import HomeLayout from "@/layout/frontDesk/HomeLayout.vue";
import { orderBy } from "xe-utils";



let userCommonStore = userCommonMessageStore();
let checkBusData = computed(() => userCommonStore?.loginCurrentBus || userCommonStore?.globalShareCheckBus);
let loginSucceess = computed(() => userCommonStore.loginSucceess);
let systemThemColor = computed(() => checkBusData.value && loginSucceess.value?.business_list?.[checkBusData.value] ?  loginSucceess.value.business_list?.[checkBusData.value][1] : primaryColor);
const store = useGlobalStore();
const routes = useRoute();
let currentMenuGroup = computed(() => userCommonStore.checkedMenuGroup); // 当前选中的菜单组

// computed计算方法 - start
const layout = computed(() => {
    return store.layout;
});


const menuIsCollapse = computed(() => {
    return store.menuIsCollapse;
});
const breadcrumbOpen = computed(() => {
    return store.breadcrumbOpen;
});


const selectedKeys = ref([]);
const openKeys =  ref([]);
// 当菜单被选中时
const onSelect = (obj) => {
    // 设置选中
    selectedKeys.value = obj.selectedKeys;
};
// 当前选择的一级菜单
const doublerowSelectedKey = ref((routes?.matched?.[2]?.meta?.parent_id && [routes.matched[2]?.meta?.parent_id]) ||  (routes?.matched?.[1]?.path && [routes?.matched?.[1]?.path]) || []);

const showMenu2 = (menu1) => {
    doublerowSelectedKey.value = [menu1.sid];
};
// 菜单展开/关闭的回调
const onOpenChange = (keys) => {
    openKeys.value = keys;
};
const menuIsCollapseClick = () => {
    store.toggleConfig('menuIsCollapse');
};

const currentRouteHighLight = async () => {
    nextTick(() => {
        // 获取当前路由的完整路径
        const currentPath = routes.path;
        
        // 遍历菜单找到匹配的路由
        const findMatchedMenu = (menus) => {
            for (const key in menus) {
                const menu = menus[key];
                // 检查子菜单
                if (menu.submenu) {
                    for (const subMenu of menu.submenu) {
                        if (subMenu.vue_url === currentPath) {
                            // 找到匹配的菜单，设置选中状态
                            selectedKeys.value = [subMenu.sid];
                            openKeys.value = [menu.sid];
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        // 从 store 中获取菜单数据并查找匹配
        const menuList = userCommonStore.menuList;
        if (menuList && Object.keys(menuList).length > 0) {
            findMatchedMenu(menuList);
        }

        // 如果是首页，清空选中状态
        if (routes.name === 'homePage') {
            selectedKeys.value = [];
            openKeys.value = [];
        }
    });
};

// 监听路由变化
watch(
    () => routes.path,
    () => {
        currentRouteHighLight();
    }
);

// 布局 变更的时候也需重置当前的菜单高亮
watch(() => layout.value, () => {
    currentRouteHighLight();
});

// 格式化菜单转为数组
let formatMenuList = computed(() => {
    let menuList = userCommonStore.menuList || {};
    let arrMenuList = orderBy(Object.values(menuList), [['sorting', 'asc']]).filter((item) => {
        return item?.submenu?.length > 0;
    }) ;
    return arrMenuList;
});


// 监听菜单组变更
watch(currentMenuGroup, async () => {
    //await userCommonStore.getUserMenusList();
   
    if(routes.name !== 'homePage' && routes.name !== 'productPage') {
        if(!formatMenuList.value?.length) return;
       
    }
});

onMounted(async () => {
    changeColor(systemThemColor.value).then();
    await userCommonStore.getUserInfo();
    await userCommonStore.getUserMenusList();
    await currentRouteHighLight();
});

const changeColor = (newPrimaryColor) => {
    return new Promise((resolve) => {
        const themeEleId = 'ops-theme-var';
        const themeEle = document.querySelector(`#${themeEleId}`);
        if (themeEle && themeEle.parentNode) {
            themeEle.parentNode.removeChild(themeEle);
        }
    
        if (newPrimaryColor) {
            const colors = generate(newPrimaryColor, {});
            const rootClass = ':root';
            const styleElement = document.createElement('style');
            styleElement.id = themeEleId;
            styleElement.setAttribute('type', 'text/css');
            styleElement.innerHTML = `${rootClass}{${colors
                .map((c, i) => {
                    return `--primary-${i + 1}:${c};`;
                })
                .concat([`--primary-color:${newPrimaryColor};`])
                .join('')}}`;
            document.head.appendChild(styleElement);
        } else {
            document.body.removeAttribute('ops-theme');
        }
    
        resolve();
    });
};

</script>

<template>
    <template v-if="$route?.meta?.layout === 'homeLayout'">
        <home-layout/>
    </template>
    <template v-else>
        <BasicLayout
            v-if="layout === $CONFIG.SYSTEM_SET.LAYOUT_ENUM.BASIC"
            :layout="layout"
            :menu-is-collapse="menuIsCollapse"
            :open-keys="openKeys"
            :selected-keys="selectedKeys"
            :breadcrumb-open="breadcrumbOpen"
            :theme="systemThemColor"
            @on-select="onSelect"
            @on-open-change="onOpenChange"
            @menu-is-collapse-click="menuIsCollapseClick"
        />

        <MixedLayout
            v-if="layout === $CONFIG.SYSTEM_SET.LAYOUT_ENUM.MIXED"
            :layout="layout"
            :open-keys="openKeys"
            :selected-keys="selectedKeys"
            :breadcrumb-open="breadcrumbOpen"
            :menu-is-collapse="menuIsCollapse"
            :theme="systemThemColor"
            :doublerow-selected-key="doublerowSelectedKey"
            @on-select="onSelect"
            @show-menu="showMenu2"
        />
       
        <TopLayout
            v-if="layout === $CONFIG.SYSTEM_SET.LAYOUT_ENUM.TOP"
            :layout="layout"
            :open-keys="openKeys"
            :selected-keys="selectedKeys"
            :breadcrumb-open="breadcrumbOpen"
            :menu-is-collapse="menuIsCollapse"
            :theme="systemThemColor"
            @on-select="onSelect"
            @on-open-change="onOpenChange"
        />
    </template>

</template>
