<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import { apiList } from "@/api/db/mongodb";

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
const emits = defineEmits(['update:type', 'mongodbSubPageOpen']);

const TITLE_LAYERS = {
    account: 2,
    database: 3,
    collection: 4
};

const typeList = {
    account: 'MongoDB账号',
    database: 'MongoDB数据库',
    collection: 'MongoDB集合'
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
            case 'shards':
            case 'size_on_disk':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                break;  
            case 'mongodb_instance':
                col.slots = {
                    default: field
                };
                col.visible = !props.instanceName;
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
                field: 'mongodb_instance__name',
                condition: '=',
                field_name: 'MongoDB实例名',
                value: props.instanceName,
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

const defaultSearchField = {
    fields: [
        {
            field: { 'account': 'username', 'database': 'name', 'collection': 'collection_name' }[props.type],
            field_name: `${typeList[props.type]}名`,
            operator: 'vague',
        }
    ],
    placeholder: `支持${typeList[props.type]}名搜索`
};

const handleSearchMongoDBInstance = (row) => {
    state.defaultQueryCondition = [{
        field: 'mongodb_instance__name', 
        condition: '=', 
        value: row.mongodb_instance.name, 
        field_name: 'MongoDB实例名'
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
            <vxe-button v-if="!props.instanceName" @click="emits('update:type', 'mongodb')">
                <svg-icon iconname="icon-mongoDB"/>
                <span class="ml-1">MongoDB列表</span>
            </vxe-button>
            <span class="ml-2">当前页面：{{ typeList[props.type] }}</span>
        </template>

        <template #mongodb_instance="{ row }">
            <span class="cursor-pointer text-primary" @click="emits('mongodbSubPageOpen', row?.mongodb_instance)">{{ row?.mongodb_instance?.name }}</span>
            <span class="ml-1 cursor-pointer text-primary" @click="handleSearchMongoDBInstance(row)"><SearchOutlined /></span>
        </template>

        <template #shards="{ row }">
            <span v-for="(shard, key) in row.shards" :key="key">
                <div>{{ key }}: {{ formatBytes(shard) }}</div>
            </span>
        </template>
        
        <template #size_on_disk="{ row }">
            {{ formatBytes(row.size_on_disk) }}
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
</template>

<style scoped lang="less">
</style>
