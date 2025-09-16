<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import { apiList } from "@/api/db/rdsApi";
import subPage from "@/composables/subPage";

const props = defineProps({
    instanceName: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        required: true
    }
});
const emits = defineEmits(['update:type', 'rdsSubPageOpen']);

const TITLE_LAYERS = {
    account: 2,
    database: 3,
    table: 4
};

const typeList = {
    account: '账号',
    database: '数据库',
    table: '表'
};

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    subPageColumns: [],
    titleFieldSearch: [],
    defaultQueryCondition: []
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'rds_instance':
                col.slots = {
                    default: field
                };
                col.visible = !props.instanceName;
                break; 
            case 'username':
            case 'row_count':
            case 'data_size':
            case 'index_size':
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

const accountColumns = computed(() => {
    return state.subPageColumns.filter(col => {
        return state.accountType === 'mysql_account' && col.oriTitle.block === 2 ||
        state.accountType === 'postgresql_account' && col.oriTitle.block === 3 ||
        state.accountType === 'sqlserver_account' && col.oriTitle.block === 4;
    });
});

onMounted(async () => {
    const { button, columns, title_data, order, sub_page_columns, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYERS[props.type], tableType: 'server' });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.tableOrder = order.value || {};
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search || {};
    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        if (props.instanceName) {
            state.defaultQueryCondition = [{
                field: 'rds_instance__name', 
                condition: '=', 
                value: props.instanceName, 
                field_name: 'RDS实例名',
                disableClose: true
            }];
        }
        else {
            await tableRef.value.serverTableRef.commitProxy('query');
        }
    }
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: apiList[props.type].del, loadData: handleDataRefresh });
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num) => {
    if (num < 10000) {
        return num.toString();
    } else if (num < 100000000) {
        return (num / 10000).toFixed(2) + '万';
    } else {
        return (num / 100000000).toFixed(2) + '亿';
    }
};

const handleAccountOpen = (row) => {
    state.accountType = row.mysql_account ? 'mysql_account' : row.postgresql_account ? 'postgresql_account' : 'sqlserver_account';
    handleSubPageOpen(row);
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
            field: { 'account': 'username', 'database': 'name', 'table': 'table_name' }[props.type],
            field_name: `${typeList[props.type]}名`,
            operator: 'vague',
        }
    ],
    placeholder: `支持${typeList[props.type]}名搜索`
};

const handleSearchRdsInstance = (row) => {
    state.defaultQueryCondition = [{
        field: 'rds_instance__name',
        condition: '=', 
        value: row.rds_instance.name, 
        field_name: 'RDS实例名',
    }];
};

watch(() => props.instanceName, (val) => {
    if (val) {
        handleDataRefresh();
    }
});

</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="state.tableOrder"
        :query-api="apiList[props.type].getList"
        :default-search-field="defaultSearchField"
        :title-field-search="state.titleFieldSearch"
        :default-query-condition="state.defaultQueryCondition"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #other_toolbar_buttons>
            <vxe-button v-if="!props.instanceName" @click="emits('update:type', 'rds')">
                <svg-icon iconname="icon-guanxixingshujuku"/>
                <span class="ml-1">RDS列表</span>
            </vxe-button>
            <span class="ml-2">当前页面：RDS{{ typeList[props.type] }}</span>
        </template>

        <template #rds_instance="{ row }">
            <span class="cursor-pointer text-primary" @click="emits('rdsSubPageOpen', row?.rds_instance)">{{ row?.rds_instance?.name }}</span>

            <span class="ml-1 cursor-pointer text-primary" @click="handleSearchRdsInstance(row)"><SearchOutlined /></span>
        </template>

        <template #username="{ row }">
            <span class="cursor-pointer text-primary" @click="handleAccountOpen(row)">
                {{ row.username }}
            </span>
        </template>

        <template #row_count="{ row }">
            {{ formatNumber(row.row_count) }}
        </template>
        <template #data_size="{ row }">
            {{ formatBytes(row.data_size) }}
        </template>
        <template #index_size="{ row }">
            {{ formatBytes(row.index_size) }}
        </template>
    </server-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        :type="props.type"
        @edit-success="handleDataRefresh"
    />

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        :title="`所属RDS实例：${subPageRow?.rds_instance?.name}`"
        :basic-config="{
            title: '账号信息',
            data: subPageRow?.[state.accountType],
            columns: accountColumns
        }"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
    </ops-sub-page>
</template>

<style scoped lang="less">
</style>
