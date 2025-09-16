<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/loadBalancer";
import subPage from "@/composables/subPage";
import BasicTab from "./customTabs/basicTab.vue";
import Listeners from "./customTabs/listeners/index.vue";
import Monitor from "./customTabs/monitor/index.vue";

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    titleFieldSearch: [],
    subPageColumns: [],
    subPageTabList: [
        {
            key: 'listeners',
            title: '监听器',
            isCustomTab: true
        },
        {
            key: 'monitor',
            title: '监控',
            isCustomTab: true
        },
    ],
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});


// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'edition':
            case 'spec_code':
            case 'charge_mode':
            case 'charge_type':
            case 'enterprise_project_id':
            case 'modification_protection_status':
            case 'deletion_protection_status':
                col.slots = {
                    default: field
                };
                break;  
            case 'addresses':
            case 'listeners':
                col.slots = {
                    default: field
                };
                col.minWidth = 200;
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

onMounted(async () => {
    const { button, columns, title_data, order, title_field_search, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.tableOrder = order.value || {};
    state.titleFieldSearch = title_field_search.value || [];
    state.subPageColumns = sub_page_columns || [];

    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.serverTableRef.commitProxy('query');
    }
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
</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="state.tableOrder"
        :query-api="API.postList"
        :title-field-search="state.titleFieldSearch"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <div class="text-primary cursor-pointer" @click="handleSubPageOpen(row)">{{ row.id }}</div>
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

        <template #cloud_instance_id="{row}">
            <a-tooltip :title="row.name">
                <div class="truncate text-primary cursor-pointer" @click="handleSubPageOpen(row)">{{ row.name }}</div>
            </a-tooltip>
            <a-tooltip :title="row.cloud_instance_id">
                <div class="truncate">{{ row.cloud_instance_id }}</div>
            </a-tooltip>
        </template>

        <template #charge_type="{row}">
            <ops-expired-time :charge-type="row.charge_type" :expired-time="row.expire_time"/>
        </template>

        <template #addresses="{row}">
            <template v-for="item in row.addresses" :key="item.id">
                <a-tooltip :title="item.address">
                    <div class="truncate">{{ item.address }} ({{ item.type }} {{ item.scope }})</div>
                </a-tooltip>
            </template>
            <div class="truncate text-primary">
                <UuidNameInfo
                :obj-type="'hw_vpc'"
                :uuid="row.vpc_id"
            />
            </div>
        </template>

        <template #listeners="{row}">
            <template v-for="item in row.listeners" :key="item.id">
                <a-tooltip :title="item.name">
                    <div class="truncate">
                        <span class="text-primary">{{ item.name }}</span>
                        <span> ({{ item.protocol }}/{{ item.protocol_port }})</span>
                    </div>
                </a-tooltip>
            </template>
        </template>

        <template #enterprise_project_id="{row}">
            {{ state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id] || '' }}
        </template>

        <template #edition="{row}">
            {{ state.initTitleData?.edition?.[row.edition] || row.edition }}
        </template>
        
        <template #charge_mode="{row}">
            {{ state.initTitleData?.charge_mode?.[row.charge_mode] || row.charge_mode }}
        </template>

        <template #modification_protection_status="{row}">
            {{ state.initTitleData?.modification_protection_status?.[row.modification_protection_status] || row.modification_protection_status }}
        </template>

        <template #deletion_protection_status="{row}">
            {{ state.initTitleData?.deletion_protection_status?.[row.deletion_protection_status] || row.deletion_protection_status }}
        </template>

        <template #spec_code="{row}">
            <a-tooltip :overlay-style="{ maxWidth: 'none' }">
                <template #title>
                    <div>最大并发连接数：{{ row.spec_info.info.connection }}TCP/{{ row.spec_info.info.connection }}UDP</div>
                    <div>新建连接数（CPS）：{{ row.spec_info.info.cps }}TCP/{{ row.spec_info.info.cps }}UDP</div>
                    <div>带宽（Mbits/s）：{{ row.spec_info.info.bandwidth }}</div>
                    <div>LCUs：{{ row.spec_info.info.lcu }}</div>
                </template>
                {{ state.initTitleData?.spec_code?.[row.spec_code] || row.spec_code }}
            </a-tooltip>
        </template>
    </server-table>

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
            isCustomTab: true,
        }"
        :custom-tabs="state.subPageTabList"
    >
        <template #basic="{data}">
            <basic-tab :data="data" :columns="state.subPageColumns" :title-data="state.initTitleData" />
        </template>

        <template #listeners="{data}">
            <div class="custom-tabs">
                <listeners :sid="data.id" :row-data="data" />
            </div>
        </template>

        <template #monitor="{data}">
            <monitor v-if="canUserAction.monitor_permission" :row="data" />
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
.custom-tabs {
    height: calc(100vh - 180px);
}
</style>
