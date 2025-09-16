<script setup>
import scheduledTasksApi  from '@/api/opsCenter/scheduledTasksApi';
import userOperate from "@/composables/form/opsUserOperate";
import edit from "./edit.vue";
import tableRender from "@/composables/table/tableRender";
import { FieldTimeOutlined } from '@ant-design/icons-vue';
import log from "./log/index.vue";

/**
 *  服务器端表格
 *  1、需先获取当前菜单的title
 *  2、获取到当前title后生成column 用于表格的的列绘制,
 * **/


const titleLayer = 1;

const initColumn = ref([]);
const initButton = ref([]);
const initTitleData = ref({});
const titleFieldSearch = ref([]);
const serverTableRef = ref(null);
const tableOrder = ref({}); // 表格的初始排序
const logOpen = ref(false);
const logData = ref({});
const lastTaskResult = ref([]);

onMounted(async () => {
    let {
        title_data,
        order,
        button,
        columns: tableColumns,
        title_field_search,
    } = await tableRender.setColumn({layer: titleLayer, tableType: 'server'});
    initColumn.value = tableColumns?.value || [];
    initButton.value = button.value;
    initTitleData.value = title_data.value;
    titleFieldSearch.value = title_field_search.value || [];
    tableOrder.value = order.value ?  order.value : {};
    await handleQueryData();
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of initColumn.value) {
        let { field }  = col;
        switch (field) {
            case 'run_time':
            case 'run_time_type':
            case 'keyword_success':
            case 'last_task_result':
                col.slots = {
                    default: field
                };
                break;
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
        }
    }
    return initColumn.value;
});
// 用于获取用户的操作权限
let canUserAction = computed(() => {
    let result = {};
    if (initButton.value) {
        for (let btn of initButton.value) {
            let { field } = btn;
            switch (field) {
                case 'edit':
                    result[field] = btn;
                    break;
                case 'add':
                    result[field] = btn;
                    break;
                case 'delete':
                    result['del'] = btn;
                    break;
            }
        }
    }
    return result;
});

// 数据的获取
const handleQueryData = async () => {
    // 获取最后一次任务结果
    serverTableRef.value.gridOption.proxyConfig.ajax.querySuccess = ({ response }) => {
        lastTaskResult.value = response?.last_task_result || [];
    };
    serverTableRef.value && serverTableRef.value.serverTableRef.commitProxy('query');
};



// 默认搜索字段配置
const defaultSearchField = computed(() => ({
    fields: [
        {
            field: 'name',
            operator: 'vague'
        }
    ],
    placeholder: '支持任务名称快速搜索'
}));

// 用户的操作
const {
    userDel,
    userEdit,
    formOpen,
    formType,
    formSid,
} = userOperate();

// 用户的新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};
// 用户的新增编辑操作
const handleUserDel = ({row}) => {
    userDel({sid: row.id, delApi: scheduledTasksApi.delScheduledTasks, loadData: handleQueryData});
};

// 查看日志
const handleViewLog = (row) => {
    logOpen.value = true;
    logData.value = row;
};

</script>


<template>
    <server-table
        ref="serverTableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="tableOrder"
        :query-api="scheduledTasksApi.postScheduledTasksList"
        :switch-click-status-config="{
            api: scheduledTasksApi.putScheduledTasksEdit,
        }"
        :title-field-search="titleFieldSearch"
        :default-search-field="defaultSearchField"
        :is-show-doc="true"
        :show-env-search="{
            app_name: 'scheduled_tasks',
        }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
        @user-del="handleUserDel"
    >
        <template #run_time="{row}">
            <a-tooltip>
                <template #title>
                    <div style="font-size: 12px; white-space: pre;">
                        {{ JSON.stringify(row.run_time, null, 4) }}
                    </div>
                </template>
                <span class="text-primary">执行时间</span>
            </a-tooltip>
        </template>
        <template #run_time_type="{row}">
            {{initTitleData?.run_time_type?.[row?.run_time_type]}}
        </template>
        <template #keyword_success="{row}">
            <vxe-tag v-if="row.keyword_success" class="theme--primary" size="small">
                {{ '成功' }}
            </vxe-tag>
            <vxe-tag v-else-if="row.keyword_success !== null" class="theme--error" size="small">
                {{ '失败' }}
            </vxe-tag>
            <span v-else></span>
        </template>

        <template #other_operation="{ row }">
            <a-tooltip title="查看日志">
                <FieldTimeOutlined class="text-primary cursor-pointer text-[14px]" @click="handleViewLog(row)"/>
            </a-tooltip>
        </template>

        <template #last_task_result="{row}">
            <ops-status :value="lastTaskResult?.find(item => item.id == row?.id)?.res" active-value="成功"/>
        </template>
    </server-table>

    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleQueryData"
    />
    
    <log
        v-model:open="logOpen"
        :log-data="logData"
    />
</template>

