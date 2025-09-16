<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/db/kvstore";
import subPage from "@/composables/subPage";
import BasicTab from "./basicTab.vue";
import MonitorTab from "./monitorTab/monitor.vue";

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    subPageColumns: [],
    titleFieldSearch: [],
});

// 用户操作相关
const { userEdit, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'engine':
            case 'status':
            case 'id':
            case 'name':
            case 'charge_type':
                col.slots = {
                    default: field
                };
                break;  
            case 'addresses':
            case 'mem':
                col.showOverflow = false;
                col.minWidth = 180;
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

const subPageTabList = computed(() => {
    return [
        { title: '监控', key: 'monitor', isCustomTab: true },
    ].filter(tab => canUserAction.value[`${tab.key}_permission`]);
});

onMounted(async () => {
    const { button, columns, title_data, sub_page_columns, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER, tableType: 'server' });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search.value || [];
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

// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();
</script>

<template>
    <!-- 主表格部分 -->
    <div class="table-section">
        <server-table
            ref="tableRef"
            :table-column="initTableColumns"
            :auth-btn="canUserAction"
            :order="state.tableOrder"
            :query-api="API.getList"
            :is-show-doc="true"
            :is-show-sync="{
                show: true,
                uri: 'sync_kv_store_instance'
             }"
            :title-field-search="state.titleFieldSearch"
            @user-edit="handleUserEdit"
            @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
        >
            <!-- 表格插槽 -->
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
    
            <template #engine="{row}">
                <span>{{ row.engine }} {{ row.engine_version }}</span>
            </template>
    
            <template #addresses="{row}">
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
    
            <template #status="{ row }">
                <vxe-tag :class="row.status == '运行中' ? 'theme--primary' : 'theme--error'" size="small">
                    {{ row.status }}
                </vxe-tag>
            </template>
    
            <template #cloud_master_account_id="{row}">
                <div style="display: flex; align-items: center;">
                    <CloudTypeIcon :type="row?.cloud_source"/>
                </div>
                {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
            </template>
    
            <template #region_id="{row}">
                <ops-region :row="row" :title-data="state.initTitleData"/>
            </template>
    
            <template #charge_type="{ row }">
                <ops-expired-time :charge-type="row.charge_type" :expired-time="row.expire_time"/>
            </template>
    
            <template #mem="{row}">
                <div class="flex items-center gap-2">
                    <span>{{ Number(row.mem / 1024).toFixed(1) }}GB</span>
                    <ops-progress :percentage="row.mem_used / row.mem"/>
                </div>
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
                <!-- 监控 -->
                <monitor-tab v-if="tab.key === 'monitor'" :sid="subPageRow?.id" />
            </div>
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
:deep(.vxe-tag--content) {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
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
</style>
