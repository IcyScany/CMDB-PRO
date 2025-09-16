<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/virtualGateway";
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
    localEpGroupNum: 4,
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'vpc_id':
            case 'region_id':
            case 'name':
                col.slots = {
                    default: field
                };
                col.showOverflow = 'ellipsis';
                break;  
            case 'virtual_team_v3_id':
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
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="tooltip-text">{{ row.virtual_gateway_id }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>

        <template #name="{row}">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="tooltip-text">{{ row.name }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.name }}</span>
            </a-tooltip>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #region_id="{row}">
            {{state.initTitleData?.region_id ? state.initTitleData?.region_id?.[row.region_id] || row.region_id : row.region_id}}
        </template>

        <template #vpc_id="{row}">
            <div v-if="row.vpc_id" class="truncate text-primary">
                <UuidNameInfo
                :obj-type="'hw_vpc'"
                :uuid="row.vpc_id"
            />
            </div>
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
        :title="subPageRow?.virtual_gateway_id"
        :basic-config="{
            columns: state.subPageColumns,
            api: API.getDetail,
            sid: subPageRow?.id,
        }"
    >
        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #region_id="{row}">
            {{state.initTitleData?.region_id ? state.initTitleData?.region_id?.[row.region_id] || row.region_id : row.region_id}}
        </template>

        <template #local_ep_group="{row}">
            <template v-if="row.local_ep_group?.length > 0">
                <div v-for="item in row.local_ep_group?.slice(0, state.localEpGroupNum)" :key="item">
                    {{ item }}
                </div>
    
                <span v-if="row.local_ep_group?.length > state.localEpGroupNum" class="text-primary cursor-pointer" @click="state.localEpGroupNum = row.local_ep_group?.length">
                    查看更多（{{ row.local_ep_group?.length - state.localEpGroupNum }}）
                </span>
                <span v-else class="text-primary cursor-pointer" @click="state.localEpGroupNum = 4">
                    收起
                </span>
            </template>
            
            <template v-else>
                --
            </template>
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
</style>
