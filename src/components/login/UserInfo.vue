<script setup>
/**
 * 组件用于处理顶部导航栏业态切换
 * **/
import { userCommonMessageStore } from '@/stores';
import { cookie } from 'xe-utils';

defineProps({
    role: {
        type: String,
        default: '',
    }
});

let userCommonStore = userCommonMessageStore();
let currentUserBusiness = ref(null); // 当前用户所属的业态
let getCurrentBusinessList = computed(() => userCommonStore?.loginSucceess.business_list);// 获取当前用户所属的业态列表
let checkBusData = computed(() => userCommonStore?.loginCurrentBus || userCommonStore?.globalShareCheckBus);

onMounted(() => {
    currentUserBusiness.value = checkBusData.value; // 当选择了业态时给予业态的初始值
});

// 用于处理顶部导航栏业态切换的change事件
const handleChangeBusiness = (val) => {
    userCommonStore.handleToggleBusTheme(getCurrentBusinessList.value?.[val]?.[1]);
    userCommonStore.handleSetCurrentBus(val);
    cookie('CMDB_CHECK_BUSINESS', val);

    // 先清空历史记录
    window.history.replaceState(null, '', '/home');
    // 再添加一条新的历史记录
    window.history.pushState(null, '', '/home');
    // 强制刷新页面
    window.location.href = '/home';
    

};

</script>
<template>
    <div v-if="getCurrentBusinessList && typeof getCurrentBusinessList === 'object' && Object.keys(getCurrentBusinessList).length > 1 && $route.name !== 'productPage'" class="business-select">
        <a-select
            :value="checkBusData"
            :show-search="true"
            option-filter-prop="label"
            style="width: 200px"
            :dropdown-style="{zIndex: 99999}"
            @change="handleChangeBusiness"
        >
            <template #placeholder>
                切换所属业态
            </template>
            <a-select-option v-for="(name, key) in getCurrentBusinessList" :key="key" :label="name">
                 <span class="custom-item" :style="{color: name?.[1]}">
                            <b class="vxe-icon-company"></b>: {{ name[0] }}</span>
            </a-select-option>
        </a-select>
    </div>

</template>



<style scoped lang="less">
.business-select {
    position: relative;
}

</style>
