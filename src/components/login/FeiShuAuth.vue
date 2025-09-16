<script setup>
import userAPI from "@/api/auth/user";
import {userCommonMessageStore} from "@/stores";
import {useRouter} from 'vue-router';

let feiShuLoading = ref(true);
let feiShuAuthResult = ref(null);
let userCommonStore = userCommonMessageStore();
const router = useRouter();

onMounted(async () => {
    feiShuAuthResult.value = null;
    // 页面加载完成后的操作
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code'); // 获取授权码（code）
    const state = urlParams.get('state'); // 获取授权码（state）
    if (code && state) {
        try {
            let feiShuLogin = await userAPI.userFeiShuLogin(code, state);
            feiShuLoading.value = false;
            userCommonStore.setLoginSuccess(feiShuLogin);
            let { business_list, next_url } = feiShuLogin || {};
            let  businessArr = Object.keys(business_list);
            if (businessArr.length === 1) {
                window.location.href = next_url ? next_url : '/';
            }
            if (businessArr.length > 1) { // 当前登录用户有多个角色时
                await router.push({name: 'checkBusiness'});
            }
        } catch(error) {
            feiShuLoading.value = false;
            feiShuAuthResult.value = `${error?.response?.data?.status_code}: ${error?.response?.data?.msg}`;

        }
    }
    // 在这里执行你需要的操作
});

</script>


<template>
    <a-spin :spinning="feiShuLoading">
        <a-alert
            :message="feiShuLoading ? '飞书登录授权中...' : '飞书授权结果'"
            :description="feiShuAuthResult"
            :type="feiShuAuthResult ? 'error': 'info'"
            show-icon
        >
            <template v-if="feiShuAuthResult" #action>
                <router-link :to="{name: 'Login'}">
                    <a-button size="small" >返回登录页</a-button>
                </router-link>
            </template>
        </a-alert>
    </a-spin>

</template>

<style scoped>

</style>
