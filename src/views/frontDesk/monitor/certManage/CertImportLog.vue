<script setup>
import certManageApi from '@/api/monitor/certManage';
import tableRender from "@/composables/table/tableRender";

defineProps({
    service: {
        type: String
        
    }
});

const service_cn_name = {
    'ali_cert_update': '阿里云',
    'huawei_cert_update': '华为云',
};



let importCertLogState = reactive({
    initColumn: [],
    initTitleData: [],
});

let tableRef = ref(null);

const {
    getCertImportLog,
} = certManageApi;
const TITLE_LAYER = 4;
let importLogOpen = ref(false);
// 证书的上传日志
const handleCertImport = async () => {
    importLogOpen.value = true;
    console.log(importCertLogState);
   
};

// 关闭弹窗
const handleClose = () => {
    importLogOpen.value = false;
};

// 打开弹窗

const handleAfterOpenChange = async (open) => {
    if (open) {
        const { columns, title_data } = await tableRender.setColumn({ layer: TITLE_LAYER });
        importCertLogState.initColumn = columns.value || [];
        importCertLogState.initTitleData = title_data.value || [];
        for(let item of importCertLogState.initColumn) {
            let { field } = item;
            switch(field) {
                case 'cloud_master_account_id':
                    item.slots = {
                        default: item.field
                    };
                    item.showOverflow = false;
                    break;
                
            }
        }
        tableRef.value && tableRef.value?.commitRequest(); 
    }
};







</script>

<template>
    <a-button type="primary" @click="handleCertImport">证书上传日志</a-button>
    <ops-form-container
        :open="importLogOpen"
        width="80%"
        @close="handleClose"
        @after-open-change="handleAfterOpenChange"
    
    >
    <template #title>
        服务： {{ service_cn_name?.[service] }} 证书上传日志
    </template>

        <ops-table 
            ref="tableRef"
            :columns="importCertLogState.initColumn" 
           
            :request-config="{
                api: getCertImportLog,
                params: {
                    service: service_cn_name?.[service]
                }
            }"
        >
            <template #cloud_master_account_id="{ row }">
                
                <a-tooltip v-if="importCertLogState.initTitleData?.cloud_master_account_id && $utils.groupBy(importCertLogState.initTitleData?.cloud_master_account_id, 'id')?.[row?.cloud_master_account_id]" placement="topLeft" class="mb-2">
                        <template #title>
                            <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ $utils.groupBy(importCertLogState.initTitleData?.cloud_master_account_id, 'id')?.[row?.cloud_master_account_id]?.[0]?.access_key || ''
                                }}</a-typography-paragraph>
                        </template>
                        <a-tag class="xy-tag-2">
                            <cloud-type-icon :type="$utils.groupBy(importCertLogState.initTitleData?.cloud_master_account_id, 'id')?.[row?.cloud_master_account_id]?.[0]?.cloud_type" class="xy-w-2"></cloud-type-icon>
                            {{ $utils.groupBy(importCertLogState.initTitleData?.cloud_master_account_id, 'id')?.[row?.cloud_master_account_id]?.[0]?.page_display || ''  }} 
                            {{ $utils.groupBy(importCertLogState.initTitleData?.cloud_master_account_id, 'id')?.[row?.cloud_master_account_id]?.[0]?.username || ''  }}
                        </a-tag>
                    </a-tooltip> 
                <template v-else>
                    {{ row.cloud_master_account_id }}
                </template>
            </template>
        </ops-table>

    </ops-form-container>
    
</template>

