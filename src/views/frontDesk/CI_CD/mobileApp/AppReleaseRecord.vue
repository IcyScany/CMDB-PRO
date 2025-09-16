<script setup>
import tableRender from "@/composables/table/tableRender";
import mobileAppApi from '@/api/ci_cd/mobileApp';
import subPage from "@/composables/subPage";
import { useRoute } from "vue-router";
import AppReleaseProcess from './AppReleaseProcess.vue';

const TITLE_LAYER = 3;
const route = useRoute();

// 状态管理
const tableRef = ref(null);
const appDetail = inject('appDetail', {});
const state = reactive({
    initColumn: [],
    subPageColumns: [],
    initButton: [],
    initTitleData: [],
    titleFieldSearch: [],
   
});
// 通用状态颜色映射（Ant Tag 颜色）
const statusColor = (status) => {
    const map = {
        success: 'success',
        failed: 'error',
        error: 'error',
        processing: 'primary',
        running: 'primary',
        in_progress: 'primary',
        pending: 'default',
        cancelled: 'default',
        rolled_back: 'warning',
        partial: 'warning',
        null: 'default',
    };
    return map[status] || 'default';
};

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'build_status':
            case 'build_config__name':
                col.slots = {
                    default: field
                };
                break;  
            case 'build_progress':
                col.minWidth = 200;
                col.slots = {
                    default: field
                };
                delete col.showOverflow;
                break;  
        

            case "deployment_targets":
                col.minWidth = 200;
                col.slots = {
                    default: field
                };
                delete col.showOverflow;
                break;  
        }
    }
    return state.initColumn;
});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    return state.initButton.reduce((acc, btn) => {
        acc[btn.field] = btn;
        return acc;
    }, {});
});

onMounted(async () => {
    const { button, columns, title_data, title_field_search, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER, tableType:'server' });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.titleFieldSearch = title_field_search.value || [];
    state.subPageColumns = sub_page_columns || [];

    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        if(route?.query?.appId || appDetail.value.id) {
            tableRef.value.queryCondition = [...defaultQueryCondition.value, ...(tableRef.value?.queryCondition || [])];
        }
        await tableRef.value.serverTableRef.commitProxy('query');
    }
};
// 默认搜索字段 当前有app_id
const defaultQueryCondition = computed(() => ([
    {
        field: 'app__id',
        condition: '=', 
        value: Number(route?.query?.appId || appDetail.value.id),
        field_name: '应用',
        disableClose: true

    }
]));

const deployStepStatus = (data) => {
    // 部署步骤状态
    if (data.build_status !== 'success') return 'wait';
                    
    const deployments = data.m2m_deployment_targets;
    if (deployments.length === 0) return 'finish';
                    
    // 检查所有部署是否都成功
    const allSuccess = deployments.every(item => item.deployment_status === 'success');
    if (allSuccess) return 'finish';
                    
    // 检查是否有部署失败
    const hasError = deployments.some(item => item.deployment_status === 'error');
    if (hasError) return 'error';
                    
    // 检查是否有部署正在进行
    const inProgress = deployments.some(item => 
        item.deployment_status === 'in_progress' || item.deployment_status === null);
    if (inProgress) return 'process';
                    
    return 'wait';
};
const buildStepStatus = (data) => {
    // 构建步骤状态
    if (data.build_status === 'success') return 'finish';
    if (data.build_status === 'error') return 'error';
    return 'process';
};

const currentStep = (data) => {
    // 构建成功则进入第1步（部署），否则停留在第0步（构建）
    return data.build_status !== 'success' ? 0 : 1;
};

const statusMap = {
    null: '未部署',
    process: '部署中',
    success: '已部署',
    error: '部署失败',
};


// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

// 查看流程
let releaseProcessOpen = ref(false);
let releaseProcessRow = ref(null);
const handleViewProcess = (row) => {
    releaseProcessOpen.value = true;
    releaseProcessRow.value = row;
};

defineExpose({
    handleDataRefresh,
});

provide('canUserAction', canUserAction);
provide('statusColor', statusColor);
</script>

<template>
     <!-- 标签页 -->
     <h3 class="text-lg mt-6">发布记录</h3>
     <div   class=" bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col  p-4 min-h-[calc(100vh-200px)]">
        
        <!-- 主表格部分 -->
        <server-table
            ref="tableRef"
            :table-column="initTableColumns"
            :auth-btn="canUserAction"
            :query-api="mobileAppApi.postReleaseList"
            :title-field-search="state.titleFieldSearch"
            :default-query-condition="defaultQueryCondition"
            :min-height="500"

        >
            <!-- 表格插槽 -->
            <template #id="{row}">
                <a-tooltip placement="topLeft">
                    <template #title>             
                        <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.security_group_id }}</a-typography-paragraph>
                    </template>
                    <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
                </a-tooltip>
            </template>
            <template #other_operation="{row}">
                <a-steps
                    style="margin-top: 8px"
                    progress-dot
                    size="small"
                    type="inline"
                    :disabled="true"
                    :current="currentStep(row)"
                    :status="row.build_status === 'success' ?  deployStepStatus(row) : buildStepStatus(row)"
                    
                    :items="[
                            {
                                title: '构建',
                                description: row.build_status === 'success' ? '构建成功' : (row.build_status === 'error' ? '构建失败' : (row.build_status === 'in_progress' ? '构建中' : '待构建')),
                            },
                            {
                                title: '部署',
                                description: row.build_status === 'success' && (row.m2m_deployment_targets.length === 0 || row.m2m_deployment_targets.every(item => item.deployment_status === 'success')) ? '全部部署成功' : (row.m2m_deployment_targets.some(item => item.deployment_status === 'error') ? '部分部署失败' : (row.m2m_deployment_targets.some(item => item.deployment_status === 'in_progress') ? '部署中' : '待部署')),
                            }
                        ]"
                    @click="handleViewProcess(row)" />
            </template>
            <template #build_status="{row}">
               
                <vxe-tag :status="statusColor(row.build_status)">{{ row.build_status }}</vxe-tag>
            </template>
            <template #build_progress="{row}">
                <a-progress :percent="row?.build_progress || 0"  size="small" stroke-color="var(--primary-color)" />
                
                
            </template>
            <template #build_config__name="{row}">
                <span>{{ row?.build_config?.name || '--' }}</span>
            </template>
            <template #deployment_targets="{row}">
                <template v-if="row?.m2m_deployment_targets && row?.m2m_deployment_targets?.length > 0">
                    <template v-for="item in row?.m2m_deployment_targets" :key="item.id">
                        <a-tooltip placement="topLeft">
                            <template #title>             
                             {{ statusMap?.[item?.deployment_status] || item?.deployment_status || '待部署' }}
                            </template>
                            <template v-if="!item.deployment_status">
                            <a-tag color="default" class="mb-4 border-none">
                                {{ row?.deployment_targets?.find(target => target.id === item.deployment_target_id)?.name }}
                            </a-tag>
                        </template>
                        <vxe-tag v-else :status="statusColor(item.deployment_status)" :content="row?.deployment_targets?.find(target => target.id === item.deployment_target_id)?.name " class="mb-4"/> 
                        </a-tooltip>
                       


                    </template>
                   
                </template>

                
            </template>

           

        
        </server-table>
    </div>
    

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        :row-data="subPageRow"
        :title="subPageRow?.name"
        :basic-config="{
            api: mobileAppApi.getReleaseList,
            sid: subPageRow?.id,
            title: '发布记录信息',
            columns: state.subPageColumns,
        }"
    >
        
    </ops-sub-page>

    <!-- 发布流程 -->
    <AppReleaseProcess v-model:open="releaseProcessOpen" :row="releaseProcessRow" />
   
</template>

<style scoped lang="less">
.copy-text {
    color:white; 
    font-size: 12px;
    margin-bottom: 0 !important;
}

:deep(.ant-steps.ant-steps-inline .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon .ant-steps-icon-dot) {
    background-color: var(--success-color) !important;
}
</style>
