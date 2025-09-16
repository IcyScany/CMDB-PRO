<!-- ** 证书更新日志 ** -->
<script setup>
import certManageApi from '@/api/monitor/certManage';
import tableRender from "@/composables/table/tableRender";

defineProps({
    service: {
        type: String
        
    }
});
const {
    getCertOneUpdateLog,
    postCertUpdateLog,
    getCertUpdateLogOne,
} = certManageApi;

let updateCertOpen = ref(false);
let serverTableRef = ref(null);
let updateLogState = reactive({
    initColumn: [],
    initTitleData: {},
    titleFieldSearch: [],
    tableOrder: {},
    current_step_domain: [],
    current_step_log: [],

});

const diffStatusText = {
    1: '成功',
    0: '失败',
    2: '该域名没有执行更新操作'
    
};

const handleUpdateCertLog = () => {
    updateCertOpen.value = true;
};

// 表格的列
const initTableColumns = computed(() => {
    for (let col of updateLogState.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'result':
                col.slots = {
                    default: field
                };
                break;
            
        }
    }
    return updateLogState.initColumn;
});
// 关闭弹窗
const handleClose = () => {
    updateCertOpen.value = false;
};

// 数据的获取
const handleQueryData = async () => {
    serverTableRef.value && serverTableRef.value.serverTableRef.commitProxy('query');
};
// 弹窗打开后
const handleAfterOpenChange = async () => {
    if (updateCertOpen.value) {
        let {
            title_data,
            order,
            columns: tableColumns,
            title_field_search,
        } = await tableRender.setColumn({layer: 5, tableType: 'server'});
        updateLogState.initColumn = tableColumns?.value || [];
        updateLogState.initTitleData = title_data.value;
        updateLogState.titleFieldSearch = title_field_search.value || [];
        updateLogState.tableOrder = order.value ?  order.value : {};

        await handleQueryData();

    }
   
};

let currentCertVerifyStep = ref(null); // 当前证书验证的步骤

// 获取某一步证书更新的日志
const handleOneStepLog = async ({item = {}, index, domain_id}) => {
    currentCertVerifyStep.value = index;
    getCertUpdateLogOne({task_id:item.task_id,  domain_id})
        .then(res => {
            updateLogState.current_step_log = res?.param|| [];
        })
        .catch(err => {
            console.log(err);
        });
};  
const handleOneStepDomain = async (item = {}, idx) => {
    getCertOneUpdateLog({task_id:item.task_id})
        .then(res => {
            updateLogState.current_step_domain = res || []; 
            if(idx === 0 ) {
                handleOneStepLog({item, index: idx,domain_id: updateLogState.current_step_domain[idx].domain});
            }
        })
        .catch(err => {
            console.log(err);
        });
};

// 查看日志
let canLookLog = ref(false);
let canLookLogData = ref({});
let logModalRef = ref(null);
const handleLookLog = (row) => {
    canLookLog.value = true;
    canLookLogData.value = row;
    handleOneStepDomain(row, 0);
  
    
};
const handleModelOpen = async () => {
    logModalRef.value && logModalRef.value?.$el?.scrollTo(0, 0);
    
};

// 关闭日志弹窗
const handleModelClose = () => {
    canLookLog.value = false;
    currentCertVerifyStep.value = null;
};


</script>
<template id="cert-update-log">
    <a-button type="primary" class="ml-2" @click="handleUpdateCertLog">证书更新日志</a-button>
        <ops-form-container
            :open="updateCertOpen"
            width="100%"
            height="100vh"
            @close="handleClose"
            @after-open-change="handleAfterOpenChange"
        
        >
        <template #title>
            {{service === 'huawei_cert_update' ? '华为云证书更新日志': '阿里云证书更新日志'}}
        </template>

            <div class="h-full min-h-[500px]" >
                <server-table 
                    ref="serverTableRef"
                    :table-column="initTableColumns" 
                    :query-api="postCertUpdateLog"
                    :title-field-search="updateLogState.titleFieldSearch"
                    :order="updateLogState.tableOrder"   
                >
                <template #result="{ row }">
                    <a-tooltip>
                        <template #title>
                            查看日志
                        </template>
                        <vxe-button :content="row.result ? '成功' : '失败'" size="mini" :status="row.result ? 'success': 'danger'" @click="handleLookLog(row)"/>
                    </a-tooltip>
                
                
                    
                </template>
            </server-table>
            </div>
        </ops-form-container>
        <vxe-modal
            ref="logModalRef"
            :model-value="canLookLog" 
            width="80%" 
            height="80%" 
            :mask-closable="true"
            :esc-closable="true"
            show-zoom
            show-footer
            resize
            @close="handleModelClose"
            @hide="handleModelClose"
            @show="handleModelOpen"
        >
        <template #title>
            [NO.{{ canLookLogData.id }}]证书日志
        
        </template>
        <template #left>
            <div style="height:100%; width: 250px; border-right: 1px solid #f0f0f0;" class="pl-2 pt-2"> 
                    <a-steps
                        v-model:current="currentCertVerifyStep"
                        direction="vertical"
                        size="small"
                        @change="(current) => handleOneStepLog({item: canLookLogData, index: current, domain_id: updateLogState.current_step_domain[current]?.domain?.domain?.[0] ? 'demo' : updateLogState.current_step_domain[current].domain})"
                        
                    >

                    <template v-for="(item, idx ) in updateLogState.current_step_domain"  :key="idx" >
                            <a-step
                                :status="item.status ? item.status === 2 ? 'wait': 'success': 'error'"
                                :description="item.msg" 
                                :disabled="item.status === 2"
                            
                                
                            >
                                <template  #icon>
                                    <CloseCircleOutlined v-if="item.status === 0" class="text-base"/>
                                    <CheckCircleOutlined v-if="item.status === 1" class="text-base"/>
                                    <StopOutlined v-if="item.status === 2" class="text-base"/>
                                   
                                </template>
                                <template #title>
                                    {{item.domain?.domain?.[0] || item.domain}}
                                </template>
                                <template #subTitle>

                                <div>
                                    {{ diffStatusText?.[item.status] }}
                                </div>


                                </template>
                            </a-step>
                        </template>
                    </a-steps>
                    
                </div>

        </template>
        <template #default>
            
            <div style="height:100%;" class="pl-2 pt-2"> 
                <div class="part-box" style="margin-bottom: 2rem">
                    <table class="custom-table custom-table-bordered">
                        <thead>
                        <th>任务ID</th>
                        <th>域名</th>
                        <th>产品</th>
                        <th>操作者</th>
                        </thead>
                        <tbody>
                        <tr>
                            <td>{{canLookLogData?.['task_id']}}</td>
                            <td>{{canLookLogData?.['domain']}}</td>
                            <td>{{canLookLogData?.['service']}}</td>
                            <td>{{canLookLogData?.['username']}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <a-timeline mode="left">
                            <a-timeline-item v-for="item in updateLogState.current_step_log" :key="item.id" :color="item.status ? 'green' : 'red'">
                                <template #dot>
                                    <CheckCircleOutlined v-if="item.status" class="text-base"/>
                                    <CloseCircleOutlined v-else class="text-base"/>
                                </template>
                                <span :style="{color: item.status ? 'var(--success-color)' : 'var(--error-color)'}">【{{item.create_time}}】{{item.run_action}}</span> <br/>

                                &nbsp;&nbsp;{{item.msg}}<br/>
                                &nbsp;&nbsp;{{item.describe}}
                            </a-timeline-item>
                        </a-timeline>
            </div>

            
        </template>
    </vxe-modal>
   
</template>


<style scoped>

:deep(.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}

:deep(.ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon) {
    color:  var(--success-color) !important;
}
:deep(.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color:var(--success-color)  !important;
}

:deep(.ant-steps-item-error > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}
:deep(.ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}

:deep(.ant-steps-item-submit .ant-steps-item-icon > .ant-steps-icon) {
    color: orange !important;
}
:deep(.ant-steps-item-submit > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: orange !important;
}
:deep(.ant-steps-item-stop > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}
:deep(.ant-steps-item-stop .ant-steps-item-icon > .ant-steps-icon) {
    color: #ccc !important;
}
:deep(.ant-steps-item-stop > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: #ccc !important;
}
:deep(.ant-steps-item-custom.ant-steps-item-active .ant-steps-item-icon > .ant-steps-icon) {
    color: var(--primary-color) !important;
}
:deep(.ant-steps-item-custom.ant-steps-item-active  .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: var(--primary-color) !important;
}
:deep(.ant-steps-item-custom.ant-steps-item-active  .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}
:deep(.ant-steps-item-custom.ant-steps-item-active) {
    background-color: #46cccf5c;

}
</style>