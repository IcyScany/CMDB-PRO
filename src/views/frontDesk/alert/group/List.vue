<script setup>
import tableRender from "@/composables/table/tableRender";
import manageApi from "@/api/alert/manageApi";
import userOperate from "@/composables/form/opsUserOperate";
import showSegment from "./showSegment.vue";

import ListAck from './ListAck.vue';

let {info} = manageApi;



const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    subPageColumns: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    titleFieldSearch: [],
    defaultQueryCondition:[{
        field: 'alert_status',
        value: 0,
        condition: '=',
        field_name:'告警状态',
    }]
});
let activeAlertStatus = ref(0);

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
            case 'alert_status':
                col.align = 'center';
                break;
            case 'curr_segment':
            case 'source':
                col.showOverflow = false;
                col.slots = {
                    default: field
                };
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

const initAletStautus = () => {
    state.defaultQueryCondition =  [{
        field: 'alert_status',
        value: activeAlertStatus.value,
        condition: '=',
        field_name:'告警状态',
        disableClose: true,
    }];
};
onMounted(async () => {
    const { button, columns, title_data, order, title_field_search, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || {};
    state.tableOrder = order.value || {};
    state.titleFieldSearch = title_field_search.value || [];
    state.subPageColumns = sub_page_columns || [];
    activeAlertStatus.value = 0;
    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await initAletStautus();
        await tableRef.value.serverTableRef.commitProxy('query');
        if(!(tableRef.value?.queryCondition && tableRef.value?.queryCondition.find(item => item.field === 'alert_status'))) {
            activeAlertStatus.value = null;
        }
    }
};
// 用户操作相关
const { userEdit, formOpen, formType, formSid } = userOperate({});
// 处理确认告警
const handleAckAlert = async ({type, row}) => {
    userEdit({type: type, sid: row.id});
};



let historySegmentOpen = ref(false);
let historySegmentRow = ref({});
let historyType = ref('');
// 处理历史节段
const handleVisibleHistorySegment = (row,type) => {
    historySegmentOpen.value = true;
    historySegmentRow.value = row;
    historyType.value = type;
};







</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="state.tableOrder"
        :query-api="info.postList"
        :title-field-search="state.titleFieldSearch"
        :default-query-condition="state.defaultQueryCondition"
        :show-env-search="{
            app_name: 'alert_info',
        }"
    >

        <template #envSuffix>
            <template v-if="state.initTitleData?.alert_status">
                <b>告警状态<i class="vxe-icon-funnel"></i></b>
                <template v-for="{label, value} in state.initTitleData?.alert_status" :key="value">
                    <a-button :danger="value === 0" type="primary" class="mr-2"  :ghost="activeAlertStatus !== value" size="small" @click="activeAlertStatus = value; handleDataRefresh()">{{label}}</a-button>
                </template>
            </template>
        </template>

        <template #other_operation="{row}">
            <vxe-button v-if="canUserAction?.alert_ack?.page_display && row?.alert_status !== 1"   status="primary" @click="handleAckAlert({type:$CONFIG.FORM_TYPE.EDIT_TYPE, row})">{{ canUserAction?.alert_ack?.field_name }}</vxe-button>

        </template>
        
        <template #alert_status="{row}">
            <div class="flex flex-col">
                <alert-level-render :level="row?.alert_level" class="w-[50px]" style="margin-bottom: 3px; text-align: center;" ></alert-level-render>
                
                <a-tag :color="row?.alert_status ? 'green': 'red'" class="w-[50px]">{{state.initTitleData?.alert_status ? state.initTitleData?.alert_status?.find(item => item.value === row?.alert_status)?.label || row?.alert_status : row?.alert_status}}</a-tag>
            </div>
        </template>

        <template #recovery_time="{ row }">
            {{ row?.alert_time?.time }} 
            {{ row?.recovery_time?.time }}  
        </template>

        <template #curr_segment="{ row }">
            {{ state.initTitleData?.curr_segment?.[row?.curr_segment] || row?.curr_segment }}
            
            <br/>
            <vxe-button v-show="canUserAction?.alert_history_segment?.page_display" :content="canUserAction?.alert_history_segment?.field_name" status="primary" mode="text" @click="handleVisibleHistorySegment(row, 'segment')"/> 

          
        </template>
        <template #source="{row}">
            <div class="flex items-center flex-col">
            {{ row?.source }} <br/>
            <vxe-button v-show="canUserAction?.alert_source_data?.page_display" :content="canUserAction?.alert_source_data?.field_name" status="primary" mode="text" @click="handleVisibleHistorySegment(row, 'source')"/> 
           </div>
        </template>



    </server-table>

    <list-ack
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />

    <!-- 历史节段 -->
    <show-segment
        v-model:open="historySegmentOpen"
        :row="historySegmentRow"
        :type="historyType"
        :title-data="state.initTitleData"
    />

   


   
</template>

<style scoped lang="less">
.ant-btn-success {
    color:var(--vxe-ui-status-success-color);
    background-color: transparent;
    border-color: var(--vxe-ui-status-success-color);
    box-shadow: none;

}
</style>
