<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/db/rdsApi";
import subPage from "@/composables/subPage";
import BasicTab from "./basicTab.vue";
import Tabs from "./commonTab/index.vue";
import LogTab from "./logTab/log.vue";
import MonitorTab from "./monitorTab/monitor.vue";
import { isInstanceId } from "xe-utils";

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    subPageColumns: [],
    titleFieldSearch: [],
    pageType: 'rds',
});

const tabList = [
    {
        title: '账号',
        icon: 'icon-shangxiayouguanxi',
        path: 'rdsAccount',
        key: 'account',
        isCustomTab: true
    },
    {
        title: '数据库',
        icon: 'icon-shujuku2',
        path: 'rdsDatabase',
        key: 'database',
        isCustomTab: true
    },
    {
        title: '表',
        icon: 'icon-shujukubiao',
        path: 'rdsTable',
        key: 'table',
        isCustomTab: true
    }
];

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'name':
            case 'huawei_rds_instance':
            case 'aliyun_rds_instance':
            case 'charge_type':
                col.slots = {
                    default: field
                };
                break;
            case 'cpu':
                col.minWidth = 320;
                col.showOverflow = false;
                col.slots = {
                    default: field,
                    header: 'cpuHeader'
                };
                break;
            case 'addresses':
                col.showOverflow = false;
                col.minWidth = 180;
                col.slots = {
                    default: field
                };
                break;
            case 'status':
            case 'virtual_teams':
                col.showOverflow = false;
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

const subPageTabList = computed(() => {
    return [
        ...tabList, 
        { title: '慢日志', key: 'log', isCustomTab: true },
        { title: '监控', key: 'monitor', isCustomTab: true },
    ].filter(tab => canUserAction.value[`${tab.key}_permission`]);
});

onMounted(async () => {
    const { button, columns, order, title_data, sub_page_columns, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER, tableType: 'server' });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.tableOrder = order.value || {};
    state.initTitleData = title_data.value || [];
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search.value || [];
    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    tableRef.value && tableRef.value.serverTableRef.commitProxy('query');
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: API.del, loadData: handleDataRefresh });
};

// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

const handleRdsSubPageOpen = (row) => {
    subPageOpen.value = true;
    subPageRow.value = row;
};


const defaultSearchField = {
    fields: [
        {
            field: 'cloud_instance_id',
            field_name: '云实例ID',
            operator: '=',
            validate: isInstanceId
        },
        {
            field: 'name',
            field_name: '名称',
            operator: 'vague',
        }
    ],
    placeholder: '支持云实例ID、名称快速搜索'
};
</script>

<template>
    <!-- 主表格部分 -->
    <div v-show="state.pageType === 'rds'" class="table-section">
        <server-table
            ref="tableRef"
            :table-column="initTableColumns"
            :auth-btn="canUserAction"
            :order="state.tableOrder"
            :query-api="API.getList"
            :is-show-doc="true"
            :is-show-sync="{
                show: true,
                uri: 'sync_rds_instance'
            }"
            :default-search-field="defaultSearchField"
            :title-field-search="state.titleFieldSearch"
            @user-edit="handleUserEdit"
            @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
            @user-del="handleUserDel"
        >
            <template #other_toolbar_buttons>
                <template v-for="btn in tabList" :key="btn.path">
                    <vxe-button v-if="canUserAction[`${btn.key}_permission`]" @click="state.pageType = btn.key">
                        <svg-icon :iconname="btn.icon"/>
                        <span class="ml-1">{{ btn.title }}</span>
                    </vxe-button>
                </template>
            </template>
    
            <template #id="{row}">
                <a-tooltip placement="topLeft">
                    <template #title>             
                        <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.cloud_instance_id }}</a-typography-paragraph>
                    </template>
                    <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
                </a-tooltip>
            </template>
    
            <template #name="{row}">
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.name }}</span>
            </template>
    
            <template #addresses="{ row }">
                <a-tooltip 
                    v-for="item in row.addresses" 
                    :key="item.id" 
                >
                    <template #title>
                        <div class="text-12">{{ item.address }}:{{ item.port }}</div>
                    </template>
                    <div class="mb-2">
                        <vxe-tag class="theme--primary" size="small">
                            <span class="truncate inline-block">
                                {{ item.address }}:{{ item.port }}
                            </span>
                        </vxe-tag>
                    </div>
                </a-tooltip>
            </template>
    
            <template #huawei_rds_instance="{ row }">
                {{ JSON.stringify(row.huawei_rds_instance, null, 2) }}
            </template>
    
            <template #aliyun_rds_instance="{ row }">
                {{ JSON.stringify(row.aliyun_rds_instance, null, 2) }}
            </template>
    
            <template #cpuHeader>
                <span>CPU大小|内存大小|磁盘大小|磁盘类型</span>
            </template>
    
            <template #cpu="{ row }">
                <div>{{ row.cpu }}vCPUs | {{ Number(row.mem / 1024).toFixed(1) }}GB </div>
                <div class="flex items-center">
                    <span class="mr-2">{{ row.volume_size }}GB ({{ row.volume_type }})</span>
                    <ops-progress :percentage="row.volume_used / row.volume_size"/>
                </div>
            </template>
    
            <template #status="{ row }">
                <div class="mb-1">{{ row.engine }} {{ row.engine_version }}</div>
                <vxe-tag :class="row.status == '运行中' ? 'theme--primary' : 'theme--error'" size="small">
                    {{ row.status }}
                </vxe-tag>
            </template>
    
            <template #cloud_master_account_id="{row}">
                <div style="display: flex; align-items: center;">
                    <CloudTypeIcon :type="row.cloud_source"/>
                </div>
                {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
            </template>
    
            <template #region_id="{row}">
                <ops-region :row="row" :title-data="state.initTitleData" />
            </template>
    
   
            <!-- <template #region_id="{row}">
                <div>{{row?.zone_id}}</div>
                <div>{{state.initTitleData?.region_id ? state.initTitleData?.region_id?.[row?.region_id] || row?.region_id : row?.region_id}}</div>
            </template> -->
    
            <template #charge_type="{ row }">
                <ops-expired-time :charge-type="row.charge_type" :expired-time="row.expire_time"/>
            </template>
        </server-table>
    </div>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        width="100%"
        :title="subPageRow?.name"
        :basic-config="{
            api: API.getDetail,
            sid: subPageRow?.id,
            title: '实例信息',
            isCustomTab: true,
        }"
        :custom-tabs="subPageTabList"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #basic="{data}">
            <basic-tab :data="data" :columns="state.subPageColumns" :title-data="state.initTitleData" />
        </template>

        <template 
            v-for="tab in subPageTabList" 
            :key="tab.key" 
            #[tab.key]
        >
            <div v-if="subPageOpen" class="custom-tabs">
                <!-- 慢日志 -->
                <log-tab v-if="tab.key === 'log'" :sid="subPageRow?.id" />
                <!-- 监控 -->
                <monitor-tab v-else-if="tab.key === 'monitor'" :sid="subPageRow?.id" />
                <!-- 其他 -->
                <tabs v-else :instance-name="subPageRow?.name" :type="tab.key" />
            </div>
        </template>
    </ops-sub-page>

    <tabs 
        v-if="state.pageType !== 'rds'" 
        v-model:type="state.pageType"
        @rds-sub-page-open="handleRdsSubPageOpen"
    />
</template>

<style scoped lang="less">
:deep(.vxe-tag--content) {
    display: inline-flex;
    align-items: center;
    max-width: 90%;
}

.mb-2 {
    &:last-child {
        margin-bottom: 0;
    }
}

.copy-text {
    color:white; 
    font-size: 12px;
    margin-bottom: 0 !important;
}

.custom-tabs {
    height: calc(100vh - 220px);
}
</style>
