<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/monitor/logMonitor";
import subPage from "@/composables/subPage";
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

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
    alertVisible: false,
    alertInfo: null
});

// 添加编辑器配置
const editorOptions = {
    fontSize: 13,
    showPrintMargin: false,
    showLineNumbers: true,
    tabSize: 4,
    highlightActiveLine: false,
    readOnly: true
};

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'recovery_rule':
            case 'data_source':
            case 'monitoring_name':
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

const showAlertInfo = (row) => {
    state.alertVisible = true;
    state.alertInfo = JSON.stringify({
        alert_rule: row.alert_rule,
        alert_level: row.alert_level
    }, null, 4);
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
        :query-api="API.getList"
        :title-field-search="state.titleFieldSearch"
        :switch-click-status-config="{
            api: API.putEdit,
        }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="tooltip-text">{{ row.monitoring_name }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>

        <template #monitoring_name="{ row }">
            <ops-tooltip
                :title="row.monitoring_name"
                :content="row.monitoring_name"
                @click="showAlertInfo(row)"
            />
        </template>

        <template #recovery_rule="{ row }">
            {{ state.initTitleData?.recovery_rule?.[row.recovery_rule] || row.recovery_rule }}
        </template>

        <template #data_source="{ row }">
            {{ state.initTitleData?.data_source?.[row.data_source] || row.data_source }}
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
        <template #monitoring_name="{ row }">
            <ops-tooltip
                :title="row.monitoring_name"
                :content="row.monitoring_name"
                @click="showAlertInfo(row)"
            />
        </template>

        <template #recovery_rule="{ row }">
            {{ state.initTitleData?.recovery_rule?.[row.recovery_rule] || row.recovery_rule }}
        </template>

        <template #data_source="{ row }">
            {{ state.initTitleData?.data_source?.[row.data_source] || row.data_source }}
        </template>
    </ops-sub-page>

    <a-modal
        v-model:open="state.alertVisible"
        width="50%"
        centered
        :footer="null"
    >
        <template #title>
            <span> 监控配置 </span>
            <a-typography-paragraph 
                class="inline" 
                :copyable="{ tooltip: false, text: state.alertInfo }"
            />
        </template>
        <a-divider />
        <v-ace-editor
            v-model:value="state.alertInfo"
            lang="json"
            theme="github"
            style="height: 500px"
            :options="editorOptions"
        />
    </a-modal>
</template>

<style scoped lang="less">
</style>
