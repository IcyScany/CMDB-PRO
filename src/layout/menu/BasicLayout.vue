<script setup>
import NavMenu from "../NavMenu.vue";
import topUserBar from "../topUserBar.vue";
// import Breadcrumb from '@/layout/components/breadcrumb.vue';
import { debounce, uniq } from 'xe-utils';
import ProductDropdown from '@/layout/ProductDropdown.vue';
import OpsRenderTabLayout from "../OpsRenderTabLayout/index.vue";


let props = defineProps({
    layout: { type: String }, // 布局信息
    menuIsCollapse: { type: Boolean }, // 菜单是否折叠
    openKeys: { type: Array },
    selectedKeys: { type: Array },
    breadcrumbOpen: { type: Boolean }, //面包屑
    theme: { type: String },
    
});

let state = reactive({
    openKeys: props.openKeys,
    selectedKeys: props.selectedKeys,
});

const emit = defineEmits(['onSelect', 'onOpenChange', 'menuIsCollapseClick']);
const onSelect = (obj) => {
    emit('onSelect', obj);
};
const onOpenChange = (keys) => {
    emit('onOpenChange', keys);
   
};
const menuIsCollapseClick = () => {
    emit('menuIsCollapseClick');
};


// 搜索
const searchQuery = ref('');
const navMenuRef = ref(null);
let searchResult = reactive({
    selectedKeys: [],
    openKeys: []
});

const handleSearch = debounce(({value}) => {
    let result = value.trim().toLowerCase();
    searchResult = navMenuRef.value.handleSearch(result);
    let newOpenKeys = result ? uniq([...searchResult.openKeys, ...props.openKeys]) : props.openKeys;
    state.openKeys = newOpenKeys;
}, 10);

</script>

<template>
    <a-layout>
        <a-layout-sider :collapsed="menuIsCollapse" theme="light" :trigger="null" collapsible collapsed-width="55">
            <header id="opsHeaderLogo" class="ops-header-logo top-header-theme">
				<div class="ops-header-left">
					<div class="logo-bar">
                        <router-link to="/">
                            <div class="logo" :class="menuIsCollapse ? 'logo-bar-collapse' : ''">
                                <img v-if="!menuIsCollapse" src="/src/assets/images/OpsCenter_logo.png" alt="logo" height="40">
                                <img v-else src="/favicon.ico" alt="logo" height="40">
                            </div>
                        </router-link>
					</div>
				</div>
               
			</header>
            <div :class="menuIsCollapse ? 'admin-ui-side isCollapse' : 'admin-ui-side'" >
                <div class="mt-1 pl-2 pr-2">
                    <vxe-input v-if="!menuIsCollapse" v-model="searchQuery" type="search" placeholder="搜索产品" clearable  style="width: 180px;" @search-click="handleSearch" @change="handleSearch"/>
                    <!-- <i v-else class="vxe-icon vxe-icon-search ml-4 text-primary table-opera-icon"></i> -->
                </div>
				<div class="admin-ui-side-scroll">
                    <a-menu
                        v-model:open-keys="state.openKeys"
                        :selected-keys="selectedKeys"
                        mode="inline"
                        style="height: calc(100vh - 32px -  49px - 10px); overflow-y: scroll; overflow-x: hidden;"
                        @select="onSelect"
                        @open-change="onOpenChange"
                >
                      <NavMenu ref="navMenuRef" v-model:searchKeys="searchQuery"/>
                    </a-menu>
				</div>
			</div>
        </a-layout-sider>

        <a-layout>
            <div id="opsHeader" class="ops-header top-header-theme">
                <div class="ops-header-left xy-pl0">
                    <div class="panel-item hidden-sm-and-down" @click="menuIsCollapseClick">
                        <MenuUnfoldOutlined v-if="menuIsCollapse" />
                        <MenuFoldOutlined v-else />
                    </div>
                    <product-dropdown/>
                </div>
                <div class="ops-header-right">
                    <topUserBar/>
                </div>
            </div>

            <!-- <Breadcrumb /> -->
            
            <a-layout-content class="main-content-wrapper" >
                <div id="admin-ui-main" class="admin-ui-main main-content" :style="{backgroundColor: $route?.meta?.main_content_bg ? $route?.meta?.main_content_bg : 'white'}">
                    
                    <template v-if="$route?.matched?.[$route.matched.length - 2]?.children && $route?.meta?.need_summary">
                        <!-- 渲染二级Tab组件 -->
                        <OpsRenderTabLayout
                            :tab-type="$route?.matched?.[$route.matched.length - 2]?.children"
                        />
                    </template>
                    <router-view />
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<style lang="less" scoped>
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

.logo {
  width: 200px;
  float: left;
    img {
     
      max-height: 2rem;
      vertical-align: middle;
    }
}
:deep(.logo-bar-collapse) {
    clip: rect(0px 47px 40px 0px);
    img {
       
        height: 40px !important;
       
    }
}
:deep(.ant-menu-vertical .ant-menu-inline-collapsed) {
    flex: 0 0 40px !important;
    max-width: 40px !important;
    min-width: 40px !important;
    width: 40px !important;
}
</style>


