<script setup>

import realTimeAlertsApi from '@/api/dashboards/realTimeAlerts';


let { getHistoryStage} = realTimeAlertsApi;
let props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    sid: {
        type: Number,
        default: 0
    }
});
let { open, sid } = toRefs(props);

let emits = defineEmits(['update:open']);
let alertState = inject('alertState');
let historyMessage = ref([]);
let historyLoading = ref(false);



function getHistoryMessage() {
    historyMessage.value = [];
    if (sid.value) {
        historyLoading.value = true;
        getHistoryStage(sid.value)
            .then((res) => {
                historyMessage.value = res ? res : [];
                historyLoading.value = false;
            })
            .catch(() => {
                historyLoading.value = false;
            });
    }

}

function handleCancel() {
    emits('update:open', false);
}
let reverse = ref(true);
function handleReverse() {
    reverse.value = !reverse.value;
}

</script>
<template>
     <ops-form-container
        :open="open"
        @after-open-change="getHistoryMessage"
        @close="handleCancel"
    >
        <template #title>
            ID【{{sid}}】历史告警状态   <a-button @click="handleReverse">{{reverse ? '降序': '升序'}}</a-button>
        </template>
        <a-spin :spinning="historyLoading">
            <a-empty v-if="!historyMessage.length">
                <template #description>
                    无历史告警数据
                </template>
            </a-empty>
            <template v-else>
                <a-timeline  :reverse="reverse">
                    <template v-for="(history) in historyMessage" :key="history.id">
                        <a-timeline-item >
                            <p>{{history.create_time}} ({{history.id}}) </p>
                            <p>当前状态: {{history.status ? `(${history.status})${alertState?.alert_segment?.[history.status] ? alertState?.alert_segment?.[history.status] : ''}` : ''}}</p>
                            <p>动作：{{history.msg}}</p>
                            <p>告警时间： {{history.alert_time}}</p>
                        </a-timeline-item>
                    </template>
                </a-timeline>
            </template>
        </a-spin>

    </ops-form-container>

</template>

<style scoped>
:deep(.ant-timeline-item:not(.ant-timeline-item-last)) {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0px;
    border-bottom-left-radius: 8px
}
:deep(.ant-timeline .ant-timeline-item-head) {
    background-color: #1677ff;
}

</style>