<script setup>
import { createWebSocket } from "@/composables/websocket";
import { message } from 'ant-design-vue';
import tableRender from "@/composables/table/tableRender";
import HeaderAlertLevel from './HeaderAlertLevel.vue';
import realTimeAlertsApi from '@/api/dashboards/realTimeAlerts';
import historyMonitors from './historyMonitors.vue';
import AlertSource from './AlertSource.vue';
import userOperate from "@/composables/form/opsUserOperate";
import AckAlert from './AckAlert.vue';
import { userCommonMessageStore } from '@/stores/user';
import AlertGroup from './AlertGroup.vue';
import weixinView from './weixinView.vue';
let { getDataConversion } = realTimeAlertsApi;



const TITLE_LAYER = 1;

let alertState = reactive({
    initColumn: [],
    initButtons: []
});
const { userEdit, formOpen, formType, formSid } = userOperate({});
const wsUrl = computed(() =>
    `api/v3/${getBusinessId()}/ws/dashboards/real-time-alerts`
);
let alertCheck = ref({}); // 用于监控的检测

const gridOptions = reactive({
    border: true,
    showOverflow: true,
    showHeaderOverflow: true,
    showFooterOverflow: true,
    height: '100%',
    loading: false,
    columnConfig: {
        resizable: true
    },
    toolbarConfig: {
        zoom: true,
        slots: {
            buttons: 'toolbarButtons',
            tools: 'toolbarTools'
        }
    },
    data: []
});
let columnResponsive = ['xxxl' , 'xxl' , 'xl' , 'lg' , 'md' , 'sm' ,'xs'];
// 获取告警阶段、告警分类的描述

const alertLevel = ref(['P0', 'P1', 'P2']); // 默认选中

// data-conversion 获取告警阶段、告警分类的描述
const getAlertStage = async () => {
    const data = await getDataConversion();
    alertState.alert_segment = data.alert_segment;
    alertState.bcm_alert_group = data.bcm_alert_group;
    return data;
};

watch(alertLevel, () => {
    getAlertStage();
});

let intervalId = null;


onMounted(async () => {
    const { button, columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    alertState.initColumn = columns.value || [];
    alertState.initButtons = button.value || [];
    getAlertStage(); // 首次加载
    intervalId = setInterval(() => {
        getAlertStage();
    }, 600000); // 10分钟

    document.getElementsByClassName('main-content-wrapper')[0].style.paddingTop = '0px';

});
// 表格的列
gridOptions.columns = computed(() => {
    for (let col of alertState.initColumn) {
        col.responsive = columnResponsive;
       
        let { field }  = col;
        col.showOverflow = true;
        col.key = field;
        col.dataIndex = field;
        col.ellipsis = true;
       
        if(col?.children){
            for(let child of col.children){
                child.showOverflow = false;
                child.key = child.field;
                child.ellipsis = true;
                child.responsive = columnResponsive;

                if(child.field === 'id'){
                    child.headerAlign = 'center';
                    child.align = 'center';
                    child.width = 150;
                    child.maxWidth = 200;

                    child.dataIndex = child.field;
                    child.customCell = (record) => {
                        return {
                            class: `alert-level-${record.alert_level} `
                        };
                    };
                }
                if(child.field === 'alert_info'){
                    child.width = 450;
                }
                delete child.slots;
            }
        }
        switch (field) {
            case 'alert_level':
                col.headerAlign = 'center';
                col.align = 'center';
                col.fixed = 'left';
                break;
            case 'alert_time_value':
                col.width = 90;
                col.minWidth = 90;
                break;
            case 'send_alert_time':
                col.width = 150;
                col.minWidth = 150;
                break;
            case 'operation':
            case 'weixin_eye':
                col.ellipsis = false;
                col.headerAlign = 'center';
                col.fixed = 'right';
                col.align = 'center';
                col.showOverflow = false;
                col.sortable = false;
                col.width = 150;
                col.minWidth = 150;
                break;
            
           
        }
    }
    console.log(alertState.initColumn);
   
    return alertState.initColumn;
});
gridOptions.cellClassName = ({row, column}) => {
    if(column.field === 'id'){
        return `alert-level-${row.alert_level} `;
    }
    return '';
};



const alertData = ref([]);
const sourceData = ref(null);
const serverTime = ref('');
const loading = ref(true);
const errorMsg = ref('');


let {
    ws:wsInstance,
    connect,
    sendMessage,
    closeWs
} = createWebSocket({
    connect_url: wsUrl.value,
    onMessage: (data) => {
        gridOptions.loading = true;
        let res;
        try {
            res = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (e) {
            errorMsg.value = '数据解析异常';
            message.error(errorMsg.value);
            loading.value = false;
            return;
        }
        if (res?.status_code && res?.status_code !== 1000) {
            errorMsg.value = res?.msg || 'WebSocket异常';
            message.error(errorMsg.value);
            loading.value = false;
            return;
        }
        alertData.value = Array.isArray(res.alert_data) && res.alert_data.length > 0 ? res.alert_data : [];
        gridOptions.data = alertData.value;
        sourceData.value = res.source_data || null;
        serverTime.value = res.server_time || '';
        alertCheck.value = res.alert_check || {};
        errorMsg.value = '';
        loading.value = false;
        gridOptions.loading = false;
    },
    onError: () => {
        errorMsg.value = 'WebSocket连接错误';
        loading.value = false;
    },
    onOpen: () => {
        loading.value = true;
        gridOptions.loading = true;
    },
    onClose: () => {
        loading.value = false;
        gridOptions.loading = false;
    }
});

const handleLevelFilter = (levels) => {
    if (levels.length === 0) return; // 最少保留一个
    alertLevel.value = levels;
    sendMessage(JSON.stringify({ alert_level: levels }));
};




// 监听页面的可见性变化
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        if (!wsInstance || (wsInstance?.readyState && wsInstance.readyState > 1)) {
            connect();
        }
    }
});


onBeforeUnmount(() => {
    closeWs();
});
onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});

const canUserAction = computed(() => {
    return alertState.initButtons.reduce((acc, btn) => {
        acc[btn.field] = btn;
        return acc;
    }, {});
});

let historySid = ref(0);
let historyVisible = ref(false);
const handleHistory = async (row) => {
    historySid.value = row.id;
    historyVisible.value = true;
};

let sourceSid = ref(0);
let sourceVisible = ref(false);
const handleSourceData = async (row) => {
    sourceSid.value = row.log_sid;
    sourceVisible.value = true;
};
const handleAck = async ({type,row}) => {
    userEdit({type: type, sid: row.id});
};

// 获取业态变量（根据实际项目调整）
function getBusinessId() {
    const userCommonStore = userCommonMessageStore();
    const checkBusData = userCommonStore?.loginCurrentBus || userCommonStore?.globalShareCheckBus;
    return checkBusData;
}

let alertNotifyData = ref({});
let alertNotifyVisible = ref(false);
const handleAlertNotify = async (row) => {
    alertNotifyData.value = row;
    alertNotifyVisible.value = true;
};



let weixinVisible = ref(false);
let viewData = ref([]);
//let firstStep = ref(false); //是否第一步点微信视角按钮，再点多选+
function handleWeixinView(data) {
    weixinVisible.value = true;
    if (checkedArr.value.length) {
        viewData.value = JSON.parse(JSON.stringify(weixinViewScreen.value));
    } else {
        viewData.value  = [data];
    }
}


// 行的点击获取选中的内容
let checkedArr = ref([]);
let weixinViewScreen = ref([]);
function bachCheckWorkList(record) {
    let idx = checkedArr.value.indexOf(record.id);
    if (idx > -1) {
        checkedArr.value.splice(idx, 1);
        weixinViewScreen.value.splice(idx, 1);
    } else {
        checkedArr.value.push(record.id);
        weixinViewScreen.value.push(record);
    }
}
// 批量加入工单成功后的处理
function updateBachAlert() {
    checkedArr.value = [];
    weixinViewScreen.value = [];
    viewData.value = [];
    weixinVisible.value = false;
}


// 新的告警数据添加背景色
const handleNewDataClass = (record, index) => {
    return record.new_data ? `bg-new-alert` : index % 2 === 1 ? 'table-striped' : null;
};

// 深度监听表格数据，进行新老数据的比较
watch(() => gridOptions.data , (newData, oldData) => {
    if (oldData && oldData.length) {
        let currentVal = {};
        for (let val of oldData) {
            currentVal[val.id] = val;
        }
        if (newData && newData.length) {
            for (let val of newData) {
                if (!currentVal[val.id]) {
                    if (val.source !== 'cmdb_alert_check') {
                        val['new_data'] = true;
                    }
                }
            }
         
        }
    }

}, {deep: true});


provide('alertState', alertState);

</script>

<template>
    <div class="h-full w-full pt-6">
    <a-table
        v-bind="gridOptions"
        :data-source="gridOptions.data"
        :row-key="record => record.id"
        :pagination="false"
        :row-class-name="handleNewDataClass"
        size="small"
        bordered
        :sticky="true"
        :scroll="{ y: 'calc(100% - 64px -94px)' }"
        
    >
        <template #title>
            <div class="p-4 px-0">
                <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" class="w-full" justify="space-between" align="middle">
                    <a-col >
                        <div style="display: flex">
                            <HeaderAlertLevel
                                :data="gridOptions.data"
                                :alert-check="alertCheck"
                                :type="'monitor'"
                                :selected-levels="alertLevel"
                                @level-filter="handleLevelFilter"
                            />
                        </div>
                    </a-col>
                    <a-col>
                        <span> 
                        更新时间: {{serverTime}}
                            <a-tag v-if="wsInstance" :color="$CONFIG.WEBSOCKET_STATE?.[wsInstance?.readyState]?.color">{{$CONFIG.WEBSOCKET_STATE?.[wsInstance?.readyState]?.desc}}</a-tag>
                        </span>
                    </a-col>
                </a-row>
            </div>
        </template>
        <template #bodyCell="{ column, record, text }">
            <template v-if="column?.key === 'id'">
                <div :title="alertState?.alert_segment?.[record?.curr_segment] ? alertState?.alert_segment?.[record?.curr_segment] : ''">
                    {{ record?.alert_level }}<br/>
                    {{ text }}
                    <div v-if="record.curr_segment === 'R4'" class="R4-label"></div>
                </div>
            </template>
            <template v-if="column?.key === 'alert_time_value'">
                <div >
                    {{ record?.alert_time?.value ? Math.ceil(record.alert_time.value ) : ''}}
                </div>
            </template>
            <template v-if="column?.key === 'send_alert_time'">
                <a-tooltip>
                    <template #title>
                        {{ record.alert_time?.time }} <br/>
                        {{ record.send_alert_time}}
                    </template>
                    <div class="ellipsis-2">
                        {{ record?.alert_time?.time }} <br/>
                        {{ record.send_alert_time}}
                    </div>
                </a-tooltip>
            </template>
            <template v-if="column?.key === 'item'">
                <a-tooltip>
                    <template #title>
                        {{ record?.bcm_alert_group_id ? alertState?.bcm_alert_group?.[record.bcm_alert_group_id]?.classify_name || record?.bcm_alert_group_id :'-' }} <br/>
                        {{ record.item }}
                    </template>
                    <div class="ellipsis-2">
                    {{ record?.bcm_alert_group_id ? alertState?.bcm_alert_group?.[record.bcm_alert_group_id]?.classify_name || record?.bcm_alert_group_id :'-' }} <br/>
                    {{ record.item }}
                    </div> 
                </a-tooltip>

            </template>
            <template v-if="column?.key === 'item_type'">
                <a-tooltip>
                    <template #title>
                        {{ record.source }}<br/>
                        {{ record?.bcm_alert_group_id ? alertState?.bcm_alert_group?.[record.bcm_alert_group_id]?.alert_classify || record?.bcm_alert_group_id :'-'   }} 
                    </template>
                    <div class="ellipsis-2">
                        {{ record.source }}<br/>
                        {{ record?.bcm_alert_group_id ? alertState?.bcm_alert_group?.[record.bcm_alert_group_id]?.alert_classify || record?.bcm_alert_group_id :'-'   }} 

                    </div>
                </a-tooltip>
        </template>
        <template v-if="column?.key === 'alert_info'">
            <a-tooltip>
                <template #title>
                    {{ record?.curr_segment ? alertState?.alert_segment?.[record.curr_segment] || record?.curr_segment :'-'   }}
                    <br/>
                    {{ record?.alert_info }}
                </template>
                <div class="ellipsis-2">
                    {{ record?.curr_segment ? alertState?.alert_segment?.[record.curr_segment] || record?.curr_segment :'-'   }}
                    <br/>
                    {{ record?.alert_info }}
                </div>
            </a-tooltip>

        </template>
        <template v-if="column?.key === 'operation'">
            <span class="text-primary cursor-pointer" @click="handleHistory(record)">历史阶段</span>
            <a-divider type="vertical" />
            <span class="text-primary cursor-pointer" @click="handleSourceData(record)">源数据</span>

        </template>

        <template v-if="column?.key === 'alarm_name_describe'">
            <a-tooltip>
                <template #title>
                    {{ record.ip }}<br/>
                    {{ record?.alarm_name_describe }} 
                </template>
                <div class="ellipsis-2" :class="{'cursor-pointer text-primary': record?.virtual_teams && Object.keys(record.virtual_teams).length > 0}" @click="handleAlertNotify(record)">
                    {{ record.ip }}<br/>
                    {{ record?.alarm_name_describe }}  
                    {{ record.ip && record.alarm_name_describe ? '' : '-' }}
                </div>
            </a-tooltip>
        </template>
        <template v-if="column?.key === 'weixin_eye'">
            
            <a-flex justify="space-between">    
                <a-checkbox :checked="checkedArr.indexOf(record.id) > -1" @change="bachCheckWorkList(record)" />
                <template v-if="canUserAction.ack">
                    <span class="text-primary cursor-pointer" @click="handleAck({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: record})">{{ canUserAction.ack.field_name }}</span>
                    <a-divider type="vertical" />
                </template>
                <a-button type="primary" size="small" style="margin-right: 3px" @click="handleWeixinView(record)">
                    <template #icon>
                        <EyeOutlined/>
                    </template>
                </a-button>
            </a-flex>
        </template>
           
        </template>
    </a-table>

        
    
     <history-monitors  v-model:open="historyVisible" :sid="historySid"/>
     <alert-source  v-model:open="sourceVisible" :sid="sourceSid"/>
     <alert-group  v-model:open="alertNotifyVisible" :data="alertNotifyData"/>
     <weixin-view v-model:open="weixinVisible" :view-data="viewData" @clear-checked="updateBachAlert" @alert-notify="handleAlertNotify"/>
      <!-- AckAlert -->
        <ack-alert
            v-model:open="formOpen"
            :sid="formSid"
            :form-type="formType"
            :check-alert-data="checkedArr"
            @edit-success="handleLevelFilter(alertLevel)"
            @clear-checked="updateBachAlert"
        />
    </div>
</template>

<style scoped lang="less">
/* 可根据实际需求美化样式 */
.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal !important;
}
:deep(.ant-table-row.hidden-row) {
  display: none !important;
}

.R4-label {
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: #3875f7;
    position: absolute;
    right: 0px;
    top: 0px;
}

.bg-new-alert { // 新的告警颜色
  background-color: #eb450c40;

}

[data-doc-theme='light'] .ant-table-striped :deep(.table-striped) td {
  background-color: #fafafa;
}
[data-doc-theme='dark'] .ant-table-striped :deep(.table-striped) td {
  background-color: rgb(29, 29, 29);
}

</style>