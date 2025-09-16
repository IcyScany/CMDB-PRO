<template>
	<div class="setting-drawer-index-content">
		<div class="scrollbar">

			<h3 class="setting-item-title">整体界面布局</h3>
			<div class="ops-setting-checkbox">
				<a-tooltip v-for="(a, i) in layoutList" :key="i" placement="top">
					<template #title>
						<span>{{ a.tips }}</span>
					</template>

					<div :class="['ops-setting-checkbox-item', a.style]" @click="layoutStyle(a.value)">
						<div class="ops-setting-layout-menu-doublerow-inner" />
						<check-outlined v-if="layout === a.value" class="ops-setting-checkbox-item-select-icon" />
					</div>
				</a-tooltip>
			</div>
			<a-divider />
			
		
			<div class="mb-4 layout-slide">
				<h4 class="setting-item-title">顶栏主题色通栏：</h4>
				<a-switch
					class="xy-fdr"
					:checked="topHeaderThemeColorSpread"
					:disabled="!topHeaderThemeColorOpen || topHeaderThemeColorSpreadDisabled"
					@change="changeTopHeaderThemeColorSpread"
				/>
			</div>

			<a-divider />
			<a-form ref="formRef" class="text-right">
				<a-form-item label="面包屑">
					<a-switch :checked="breadcrumbOpen" disabled @change="toggleState('breadcrumbOpen')" />
				</a-form-item>
				<a-form-item label="折叠菜单">
					<a-switch
						:checked="menuIsCollapse"
						@change="toggleState('menuIsCollapse')"
						
					/>
				</a-form-item>
				
				
			</a-form>
			
		</div>
	</div>
</template>
<script setup>
import { useGlobalStore } from '@/stores';
import systemConfig from '@/config/index';

const store = useGlobalStore();
	
const topHeaderThemeColorSpreadDisabled = ref(false);
const moduleUnfoldDisabled = ref(false);
const menuIsCollapseDisabled = ref(false);
	
	
	
const layoutList = ref([
    {
        tips: '基础布局',
        value: systemConfig.SYSTEM_SET.LAYOUT_ENUM.BASIC,
        style: 'ops-setting-layout-menu-classical'
    },
    {
        tips: '顶部布局',
        value: systemConfig.SYSTEM_SET.LAYOUT_ENUM.TOP,
        style: 'ops-setting-layout-menu-top'
			
    },
    /*  {
        tips: '双排菜单布局',
        value:  systemConfig.SYSTEM_SET.LAYOUT_ENUM.MIXED,
        style: 'ops-setting-layout-menu-doublerow'
			
    } */
]);
	
	
const layout = computed(() => {
    return store.layout;
});
const menuIsCollapse = computed(() => {
    return store.menuIsCollapse;
});
	
	
const breadcrumbOpen = computed(() => {
    return store.breadcrumbOpen;
});
	
const topHeaderThemeColorOpen = computed(() => {
    return store.topHeaderThemeColorOpen;
});
const topHeaderThemeColorSpread = computed(() => {
    return store.topHeaderThemeColorSpread;
});

	
const changeTopHeaderThemeColorSpread = () => {
    toggleState('topHeaderThemeColorSpread');
};
const toggleState = (stateName) => {
    store.toggleConfig(stateName);
};
	
// 设置整体界面布局
const layoutStyle = (value) => {
    store.setLayout(value);
	
    layoutChange(value);
};
	
// 更改布局后设置
const layoutChange = (layout) => {
    // 如果是顶栏布局，限制一些配置
    if (layout === systemConfig.SYSTEM_SET.LAYOUT_ENUM.TOP) {
		
        // 禁用折叠菜单
        menuIsCollapseDisabled.value = true;
		
        topHeaderThemeColorSpreadDisabled.value = true;
    } else {
        moduleUnfoldDisabled.value = false;
        menuIsCollapseDisabled.value = false;
		
    };
};
onMounted(() => {
	
    // 这里主要为了dom销毁后重新打开设置界面，界面上禁用相关
    layoutChange(layout);
});
</script>

<style lang="less" scoped>
	.ops-setting-checkbox {
		display: flex;
		margin-bottom: 20px;
	}
	.ops-setting-checkbox-item {
		position: relative;
		width: 44px;
		height: 36px;
		margin-right: 16px;
		overflow: hidden;
		background-color: #ebeef1;
		border-radius: 2px;
		box-shadow: 0 1px 2.5px 0 rgb(0 0 0 / 18%);
		cursor: pointer;
	}
	.ops-setting-checkbox-item::before {
		position: absolute;
		top: 0;
		left: 0;
		width: 33%;
		height: 100%;
		background-color: #fff;
		content: '';
	}
	.ops-setting-checkbox-item::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.ops-setting-checkbox-item-light {
		background-color: #ebeef1;
		content: '';
	}
	.ops-setting-checkbox-item-light::before {
		background-color: #fff;
		content: '';
	}
	.ops-setting-checkbox-item-light::after {
		background-color: #fff;
	}
	.ops-setting-checkbox-item-dark {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.ops-setting-checkbox-item-dark::before {
		z-index: 1;
		background-color: #001529;
		content: '';
	}
	.ops-setting-checkbox-item-dark::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.ops-setting-checkbox-item-realdark {
		background-color: rgba(0, 21, 41, 0.85);
	}
	.ops-setting-checkbox-item-realdark::before {
		z-index: 1;
		background-color: rgba(0, 21, 41, 0.65);
		content: '';
	}
	.ops-setting-checkbox-item-realdark::after {
		background-color: rgba(0, 21, 41, 0.85);
	}
	.ops-setting-checkbox-item-select-icon {
		position: absolute;
		right: 8px;
		bottom: 8px;
		color: #1677FF;
		font-weight: 700;
		font-size: 14px;
		pointer-events: none;
	}
	.ops-setting-theme-color-colorBlock {
		margin-top: 8px;
		width: 20px;
		height: 20px;
		border-radius: 2px;
		float: left;
		cursor: pointer;
		margin-right: 8px;
		padding-left: 0px;
		padding-right: 0px;
		text-align: center;
		color: #fff;
		font-weight: 700;
	}
	.ops-setting-layout-menu-doublerow {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.ops-setting-layout-menu-doublerow::before {
		z-index: 1;
		width: 16%;
		background-color: #001529;
		content: '';
	}
	.ops-setting-layout-menu-doublerow-inner {
		position: absolute;
		top: 0;
		left: 0;
		display: block;
		width: 33%;
		height: 100%;
		background-color: #fff;
		content: '';
	}
	.ops-setting-layout-menu-doublerow::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.ops-setting-layout-menu-classical {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.ops-setting-layout-menu-classical::before {
		z-index: 1;
		background-color: #001529;
		content: '';
	}
	.ops-setting-layout-menu-classical::after {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #fff;
		content: '';
	}
	.ops-setting-layout-menu-top {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.ops-setting-layout-menu-top::before {
		z-index: 1;
		background-color: #ebeef1;
		content: '';
	}
	.ops-setting-layout-menu-top::after {
		z-index: 2;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 25%;
		background-color: #001529;
		content: '';
	}
	.scrollbar {
		margin: 0 auto;
	}
	.setting-item-title {
		color: var(--font-color);
	}
	:deep(.ant-form-item) {
		margin-bottom: 12px !important;
	}
</style>
