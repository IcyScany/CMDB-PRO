<script setup>
/**
 * 模块用于顶部导航栏登录用户的用户名、头像
 * **/
import { userCommonMessageStore } from '@/stores/user';
import {useRoute, useRouter} from "vue-router";

let userCommonStore = userCommonMessageStore();
let currentUsername = computed(() => userCommonStore?.username); // 获取当前登录的用户
let currentUserInfo = computed(() => userCommonStore?.loginUserInfo); // 当前登录用户的详细信息

let router = useRouter();
let route = useRoute();


// 用户的登出处理
const handleLoginOut = () => {
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
};

/* onMounted(async () => {
    await userCommonStore.getUserInfo();
}); */

</script>

<template>
    <a-dropdown>
        <a class="ant-dropdown-link"  @click.prevent >
            <template v-if="currentUserInfo?.images && currentUserInfo?.images.startsWith('http')">
					<a-avatar :src="currentUserInfo?.images" />
				</template>
				<a-avatar v-else>
					<template #icon>
						<img src="/src/assets/images/defaultAvator.png" alt="CMDB">
					</template>
				</a-avatar>
                &nbsp;
				<label>{{ currentUsername }}</label>
                <DownOutlined />
        </a>
        <template #overlay>
            <a-menu>
                <a-menu-item>
                    <a href="javascript:;">
                        个人中心
                    </a>
                </a-menu-item>
                <a-menu-item>
                    <a @click.prevent="handleLoginOut">
                        退出系统
                    </a>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>

</template>



<style scoped>
.user-picture {
    width: 27px;
    height: 27px;
    margin: 0 2px;
}
</style>
