<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/security/cloudCfw";
import subPage from "@/composables/subPage";

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
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'region_id':
            case 'enterprise_project_id':
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

const defaultSearchField = {
    fields: [
        {
            field: 'public_ip',
            field_name: '弹性公网IP',
            operator: '=',
        },
    ],
    placeholder: '支持弹性公网IP搜索'
};
</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="state.tableOrder"
        :query-api="API.getList"
        :title-field-search="state.titleFieldSearch"
        :default-search-field="defaultSearchField"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="tooltip-text">{{ row.fw_instance_id }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row?.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #region_id="{ row }">
            <span>{{ state.initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>

        <template #enterprise_project_id="{row}">
            {{ 
                (state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id]) ||
                (row.enterprise_project_id === '0' ? 'default' : row.enterprise_project_id)
            }}
        </template>

        <template #eip_id="{row}">
            <a-tooltip :title="row.public_ip">
                <div class="truncate">{{ row.public_ip }}</div>
            </a-tooltip>
            <a-tooltip :title="row.eip_id">
                <div class="truncate">{{ row.eip_id }}</div>
            </a-tooltip>
        </template>

        <template #fw_instance_id="{row}">
            <a-tooltip :title="row.fw_instance_name">
                <div class="truncate text-primary cursor-pointer" @click="handleSubPageOpen(row)">{{ row.fw_instance_name }}</div>
            </a-tooltip>
            <a-tooltip :title="row.fw_instance_id">
                <div class="truncate">{{ row.fw_instance_id }}</div>
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

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.name"
        :basic-config="{
            columns: state.subPageColumns,
            api: API.getDetail,
            sid: subPageRow?.id,
        }"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #region_id="{ row }">
            <span>{{ state.initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>

        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #enterprise_project_id="{row}">
            {{ 
                state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id] ||
                row.enterprise_project_id === '0' ? 'default' : row.enterprise_project_id
            }}        
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
</style>
