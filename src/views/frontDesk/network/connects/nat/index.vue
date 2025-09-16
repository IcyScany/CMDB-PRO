<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/natApi";
import {isServerIp} from "xe-utils";    
import subPage from "@/composables/subPage";

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
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'status':
            case 'nat_id':
            case 'region_id':
                col.slots = {
                    default: field
                };
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
    const actionFields = ['edit', 'add', 'del'];
    return state.initButton.reduce((acc, btn) => {
        if (actionFields.includes(btn.field)) {
            acc[btn.field] = btn;
        }
        return acc;
    }, {});
});
// 数据的获取
const handleQueryData = async () => {
    tableRef.value?.serverTableRef && tableRef.value.serverTableRef.commitProxy('query');
};

onMounted(async () => {
    const { button, columns, title_data, order, sub_page_columns, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || {};
    state.tableOrder = order.value ?  order.value : {};
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search.value || [];
    await nextTick();
    await handleQueryData();
});

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: API.del, loadData: handleQueryData });
};

// 默认搜索字段配置
const defaultSearchField = computed(() => ({
    fields: [
        {
            field: 'public_ip',
            operator: 'vague',
            validate: isServerIp
        },
        {
            field: 'description',
            operator: 'vague',
            validate: (value) => !isServerIp(value)  // 当不是 IP 格式时匹配主机名
        }
    ],
    placeholder: '直接输入公网IP、备注'  // 添加自定义提示文本
}));

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
        :auth-btn="canUserAction"
        :table-column="initTableColumns"
        :query-api="API.postList"
        :order="state.tableOrder"
        :title-field-search="state.titleFieldSearch"
        :default-search-field="defaultSearchField"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{ row }">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.nat_id }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>

        <template #nat_id="{ row }">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.nat_id }}</span>
        </template>
        
        <template #status="{ row }">
            <vxe-tag :class="row.status == '可用' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.status }}
            </vxe-tag>
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
    </server-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleQueryData"
    />

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.nat_id"
        :basic-config="{
            columns: state.subPageColumns,
            api: API.getDetail,
            sid: subPageRow?.id,
        }"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #status="{ row }">
            <vxe-tag :class="row.status == '可用' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.status }}
            </vxe-tag>
        </template>

        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #region_id="{ row }">
            <span>{{ state.initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
.copy-text {
    color:white; 
    font-size: 12px;
    margin-bottom: 0 !important;
}
</style>
