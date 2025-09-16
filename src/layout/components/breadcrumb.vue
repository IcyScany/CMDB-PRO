<script setup>
import { userCommonMessageStore } from '@/stores';
import { groupBy } from 'xe-utils';
let userCommonStore = userCommonMessageStore();

let currentSelectedMenu = computed(() => userCommonStore.current_user_menu);
let currentGroupMenu = computed(() => groupBy(userCommonStore.menuGroupList, 'name'));



</script>

<template>
	<div v-if="$route.name !== 'homePage'" class="admin-ui-breadcrumb">
		<div class="left-panel">
			<a-breadcrumb >
				<template v-for="(item, index) in $route.matched" :key="item.name">
					<template v-if="item.name === 'role-base'">
						<a-breadcrumb-item>
							<router-link :to="{name: 'homePage'}"> <home-outlined /></router-link>
						</a-breadcrumb-item>
						<a-breadcrumb-item v-if="currentSelectedMenu?.current_menu?.menu_group">
							{{currentGroupMenu?.[currentSelectedMenu?.current_menu?.menu_group]?.[0]?.cn_name }}
						</a-breadcrumb-item>
					</template>
					<a-breadcrumb-item v-else>
					<router-link :to="{name: item.name}"> {{currentSelectedMenu?.[index === 1 ? 'current_parent_menu' : 'current_menu']?.menu_name || item?.meta?.title}} </router-link>
				</a-breadcrumb-item>
				</template>
			</a-breadcrumb>
		</div>
		<div class="center-panel"></div>
		<div class="right-panel">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped lang="less">
.left-panel {
	font-size: 16px;
	:deep(.ant-breadcrumb .ant-breadcrumb-link a ) {
		color: var(--breadcrumb-link) !important;
	}
	
}

	.admin-ui-breadcrumb {
		padding-left: 15px;
		background: var(--breadcrumb-background);
		min-height: 40px;
		display: flex;
		border-bottom: 1px solid var(--header-bottom);
	}
	.admin-ui-breadcrumb .left-panel {
		display: flex;
		align-items: center;
	}
	.admin-ui-breadcrumb .right-panel {
		display: flex;
		align-items: center;
	}
</style>
