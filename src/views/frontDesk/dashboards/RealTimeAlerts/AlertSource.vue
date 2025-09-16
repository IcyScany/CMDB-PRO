<script setup>
import realTimeAlertsApi from '@/api/dashboards/realTimeAlerts';

let { getSourceData } = realTimeAlertsApi;

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
let sourceData = ref(null);
let sourceLoading = ref(false);
let errorMsg = ref('');

function handleCancel() {
    emits('update:open', false);
}

async function getSource() {
    errorMsg.value = '';
    sourceLoading.value = true;
    try {
        const res = await getSourceData(sid.value);
        sourceData.value = res;
    } catch (error) {
        errorMsg.value = error?.response?.message || error?.response?.data?.msg + '【' + error?.response?.status + '】';
    } finally {
        sourceLoading.value = false;
    }
}

</script>

<template>
    <ops-form-container
        :open="open"
        width="80%"
        @after-open-change="getSource"
        @close="handleCancel"
    >
        <template #title>
            告警日志NO.{{sid}}源数据
        </template>
        <a-spin :spinning="sourceLoading">
            <template v-if="sourceData">
                <a-card bordered>
                    <a-descriptions title="基础信息" bordered column="2" size="small">
                        <a-descriptions-item label="ID">{{ sourceData.id }}</a-descriptions-item>
                        <a-descriptions-item label="告警源">{{ sourceData.alert_source }}</a-descriptions-item>
                        <a-descriptions-item label="告警等级">{{ sourceData.alert_level }}</a-descriptions-item>
                        <a-descriptions-item label="告警状态">{{ sourceData.alert_status === 0 ? '告警' : '恢复' }}</a-descriptions-item>
                       
                        <a-descriptions-item label="业务ID">{{ sourceData.business_id }}</a-descriptions-item>
                        <a-descriptions-item label="创建时间">{{ sourceData.create_time }}</a-descriptions-item>
                        <a-descriptions-item label="更新时间">{{ sourceData.update_time }}</a-descriptions-item>
                    </a-descriptions>
                    <a-divider />
                    <a-row :gutter="16">
                        <a-col :span="12">
                            <a-card title="" size="small" :body-style="{padding: '12px'}">
                                <a-collapse>
                                    <a-collapse-panel key="1" header="格式化数据 (alert_data)">
                                        <pre style="height:calc(100vh - 300px);overflow:auto;background:#f6f6f6;padding:12px;border-radius:4px;">
                                            {{ JSON.stringify(sourceData.alert_data, null, 2) }}
                                        </pre>
                                    </a-collapse-panel>
                                </a-collapse>
                            </a-card>
                        </a-col>
                        <a-col :span="12">
                            <a-card title="" size="small" :body-style="{padding: '12px'}">
                                <a-collapse>
                                    <a-collapse-panel key="2" header="原始数据 (source_data)">
                                        <pre style="height:calc(100vh - 300px);overflow:auto;background:#f6f6f6;padding:12px;border-radius:4px;">{{ JSON.stringify(sourceData.source_data, null, 2) }}</pre>
                                    </a-collapse-panel>
                                </a-collapse>
                            </a-card>
                        </a-col>
                    </a-row>
                </a-card>
            </template>
            <a-empty v-else>
                <template #description>
                    {{errorMsg || '无源数据'}}
                </template>
            </a-empty>
        </a-spin> 
    </ops-form-container>
</template>