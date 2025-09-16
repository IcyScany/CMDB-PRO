<script  setup>
//import NavMenu from "../NavMenu.vue";
import topUserBar from "../topUserBar.vue";
// import Breadcrumb from '@/layout/components/breadcrumb.vue';
//import ProductCategory from "../ProductCategory.vue"; // 引入产品分类组件
import ProductDropdown from "../ProductDropdown.vue"; // 引入产品分类组件
import OpsRenderTabLayout from "../OpsRenderTabLayout/index.vue";



defineProps({
    layout: { type: String }, // 布局信息
    openKeys: { type: Array },
    menuIsCollapse: { type: Boolean }, // 菜单是否折叠
    selectedKeys: { type: Array },
    breadcrumbOpen: { type: Boolean }, //面包屑
    theme: { type: String },
});
/* let { selectedKeys, openKeys } = toRefs(props);
const emit = defineEmits(['onSelect', 'onOpenChange']);
const onSelect = (obj) => {
    emit('onSelect', obj);
};
const onOpenChange = (keys) => {
    emit('onOpenChange', keys);
}; */

// 控制菜单是否折叠
const isMenuCollapsed = ref(false);


// 监听窗口大小变化
const handleResize = () => {
    isMenuCollapsed.value = window.innerWidth < 1350;
};

// 组件挂载时添加监听
onMounted(() => {
    handleResize(); // 初始化时执行一次
    window.addEventListener('resize', handleResize);
  
});

// 组件卸载时移除监听
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});





</script>

<template>
    <a-layout>
        <a-layout class="layout">
            <div id="opsHeader" class="ops-header top-ops-header top-header-theme">
                <div class="ops-header-left xy-pl0">
                    <header id="opsHeaderLogo" class="ops-header-logo">
                        <div class="ops-header-left">
                            <div class="logo-bar">
                                <router-link to="/">
                                    <logo/>
                                </router-link>
                            </div>
                        </div>
                    </header>
                    <product-dropdown/>
                </div>
                   <!-- <product-category mode="inline"/> -->
                  
               
                   
                <div class="ops-header-right">
                    <topUserBar/>
                </div>
            </div>

            <!-- <Breadcrumb v-if="breadcrumbOpen"/> -->
            <a-layout-content class="main-content-wrapper">
                <div id="admin-ui-main" class="admin-ui-main main-content" :style="{backgroundColor: $route?.meta?.main_content_bg ? $route?.meta?.main_content_bg : 'white'}">
                    <template v-if="$route?.meta?.need_summary">
                        <!-- 渲染二级Tab组件 -->
                            <template v-if="$route?.matched?.[$route.matched.length - 2]?.children">
                                <OpsRenderTabLayout
                                :tab-type="$route?.matched?.[$route.matched.length - 2]?.children || []"
                            />
                        </template>
                      
                    </template>
                    <template v-else-if="$route?.matched && $route?.matched?.[$route.matched.length - 1] ">
                         <!-- 渲染二级Tab组件 -->
                         <OpsRenderTabLayout
                            :tab-type="[$route?.matched?.[$route.matched.length - 1]] || []"
                        />
                    </template>
                    <router-view />
                   
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>

</template>

<style scoped lang="less">
.main-content {
	padding: 0 24px;
	background-color: white;
	border-radius: 8px;
    margin-top: 40px;
    height: calc(100% - 40px);  // 预留顶部总览菜单栏位置

    // 表格部分高度自适应
    :deep(.table-section) {
        flex: auto;
        min-height: 0;
    }
}

.xy-color-fff {
    color: #fff;
}
.xy-pdl25 {
    padding-left: 11px;
}
.xy-menu-line {
    text-align: center;
    height: auto;
    line-height: 20px;
    flex: none;
    display: block;
    padding: 12px 0 !important;
}
.xy-navmenu-line {
    min-width: 0;
    flex: 1 1 0%;
    overflow: hidden;
}
.xy-bb0 {
    border-bottom: none;
    position: relative;
}
.ant-layout-content {
    display: flex;
    flex-direction: column;
}
.xy-pd1180 {
    padding: 10px 150px 0 150px;
}
.xy-pd050 {
    padding: 0 50px;
}
.xy-pl10 {
    padding-left: 10px;
}
.xy-mg050 {
    margin: 0px 150px;
}

</style>
