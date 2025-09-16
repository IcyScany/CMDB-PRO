<script setup>

import commonApi from "@/api/common";

let props = defineProps({
    uri: {
        type: String,
        required: true,
        default: '',
    },
});

let {uri} = toRefs(props);
/* let basePrefix = `/cloud-sync/v2/`;
const syncUri = {
    "cloud-server": basePrefix + `servers/cloud-server/add_ecs`, // 同步ECS数据-新增更新
    "cloud-vpc": basePrefix + `network/cloud-vpc`, // 云VPC数据同步-新增更新
    "cloud-nat": basePrefix + `network/cloud-nat/add_nat`, // 云NAT数据同步-新增更新
    "cloud-route": basePrefix +`network/cloud-route/add_route`,
    "cloud-dns": basePrefix +`network/outside-domain`,
    "sync_kv_store_instance": basePrefix + `db/task/database_app/sync_kv_store_instance`,
    "sync_rds_instance": basePrefix + "db/task/database_app/sync_rds_instance",
    "cloud_waf_sync":  basePrefix + "security/cloud_waf_sync",
    "cloud-cdn":  basePrefix + "network/cloud-cdn",
    "cloud-account": basePrefix + "cloud-manage/cloud-account",
}; */


let syncLoading = ref(false);
let syncMsgVisible = ref(false);

let syncMessage = reactive({
    loading: false,
    msg: '',
    visible: false,
});
let timer = null;
const handleClickDataSync = async () => {
    clearTimeout(timer);
    if (uri.value) {
        syncLoading.value = true;
        commonApi.getSyncData(uri.value).then(async (res)  => {
            syncLoading.value = false;
            syncMessage.msg = res?.msg;
            syncMsgVisible.value = true;

        }).catch(() => {
            syncLoading.value = false;
            syncMessage.visible = false;
            syncMsgVisible.value = false;
        });
        timer = setTimeout(() => {
            syncMsgVisible.value = false;
        }, 3000);
    }

};

onMounted(() => {
    syncMessage = {
        loading: false,
        msg: '',
        visible: false,
    };
    syncLoading.value = false;
    syncMsgVisible.value = false;
});

</script>
<template>
    <a-tooltip v-model:open="syncMsgVisible" trigger="" arrow-point-at-center :color="'green'" :overlay-style="{'zIndex': 0}">
        <template #title>
            {{syncMessage.msg}}
        </template>
        <vxe-button :loading="syncLoading" content="数据同步" status="primary" @click="handleClickDataSync"/>
    </a-tooltip>
</template>



<style scoped>

</style>
