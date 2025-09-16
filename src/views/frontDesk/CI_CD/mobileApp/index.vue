


<script setup>
import MyApp from './MyApp.vue';
import AppDeployment from './AppDeployment.vue';

const activeKey = ref('mobile_app');
const handleTabChange = (key) => {
    activeKey.value = key;
};


</script>








<template>
    <a-tabs key="mobile_app" v-model:active-key="activeKey" :destroy-nactive-tab-pane="true" @tab-change="handleTabChange">
        <a-tab-pane key="mobile_app" tab="我的应用" name="mobile_app" class="min-h-[300px]">
            <my-app />
        </a-tab-pane>
        <a-tab-pane key="mobile_app_target" tab="部署目标" name="mobile_app_target" >   
            <app-deployment  />
        </a-tab-pane>
    </a-tabs>
</template>

<style scoped>
:deep(.ant-tabs-content) {
    height: 100% !important;
}

</style>
