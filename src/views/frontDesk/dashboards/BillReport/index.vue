<script setup>
import { userCommonMessageStore } from '@/stores/user';

let userCommonStore = userCommonMessageStore();

let currentUserInfo = computed(() => userCommonStore?.loginUserInfo); // 当前登录用户的详细信息

</script>

<template>
    <iframe 
        :src="`https://grafana.iblidc.com/d/aeqwh54ypdou8c/789fbe0?orgId=1&from=now-30d&to=now&timezone=Asia%2FShanghai&var-business_id=${currentUserInfo?.curr_tenant_id}&var-cloud_source=华为云&kiosk`"
        frameborder="0"
        style="width: 100%; height: calc(100% - 40px);"
        >
        
        </iframe>
</template>