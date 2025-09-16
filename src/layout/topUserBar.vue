<script setup name="layoutUserBar">
import { userCommonMessageStore } from '@/stores';
import setting from './setting.vue';
import {useRouter, useRoute} from 'vue-router';


let userCommonStore = userCommonMessageStore();
let currentUsername = computed(() => userCommonStore?.username); // 获取当前登录的用户
let currentUserInfo = computed(() => userCommonStore?.loginUserInfo); // 当前登录用户的详细信息
const settingDialog = ref(false);
// 设置抽屉
const openSetting = () => {
    settingDialog.value = true;
};
const router = useRouter();
const route = useRoute();

// 用户
const handleUser = (key) => {
    switch (key) {
        case 'outLogin':
            userCommonStore.handleUserLogout()
                .then(res => {
                    if (res.status_code) {
                        // 限制访问的页面要跳转
                        if (!route.meta.noPermission) {
                            router.push({
                                name: 'Login',
                                query: {
                                    next: route.fullPath
                                }
                            });
                        }

                    }
                });
            break;
    }
};


</script>

<template>
	<div class="user-bar">
		<user-info></user-info>
		<a-dropdown class="user panel-item">
			<div class="user-avatar">
				<template v-if="currentUserInfo?.images && currentUserInfo?.images.startsWith('http')">
					<a-avatar :src="currentUserInfo?.images" />
				</template>
				<a-avatar v-else>
					<template #icon>
						<img src="/src/assets/images/defaultAvator.png" alt="CMDB">
					</template>
				</a-avatar>
				<label>{{ currentUsername }}</label>
			</div>
			<template #overlay>
				<a-menu>
					<a-menu-item key="uc" @click="handleUser('uc')">
						<UserOutlined/>
						<span> 个人中心</span>
					</a-menu-item>
					<a-menu-divider />
					<a-menu-item key="outLogin" @click="handleUser('outLogin')">
						<export-outlined/>
						<span> 退出登录</span>
					</a-menu-item>
				</a-menu>
			</template>
		</a-dropdown>
		<div v-if="$route.name !== 'homePage' && $route.name !== 'productPage'" class="setting panel-item" @click="openSetting">
			<layout-outlined />
		</div>
	</div>

	<!-- 整体风格设置抽屉 -->
	<a-drawer v-model:open="settingDialog" :closable="false" width="300">
		<setting />
	</a-drawer>
</template>



<style lang="less" scoped>
	:deep(.ant-modal) {
		top: 20px;
	}
	:deep(.ant-modal-content) {
		border-radius: 10px;
	}
	.user-bar {
		display: flex;
		align-items: center;
		height: 100%;
	}
	.user-bar .user-avatar {
		height: 49px;
		display: flex;
		align-items: center;
	}
	.user-bar .user-avatar label {
		display: inline-block;
		margin-left: 5px;
		cursor: pointer;
	}
	.setting {
		margin-right: 10px;
	}
</style>
