<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/security/cloudWafApi";
import Detail from "./detail/detailIndex.vue";

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    allData: [],
    initColumn: [],
    initButton: [],
    initTitleData: [],
    subPageColumns: [],
    titleFieldSearch: [],
    editRow: [],
    detailRow: [],
    detailOpen: false,
    searchPolicyId: '',
});

// 用户操作相关
const { userEdit, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'hostname':
                col.showOverflow = 'ellipsis';
                col.slots = {
                    default: field
                };
                break;
            case 'access_mode':
                col.slots = {
                    default: field
                };
                break;
            case 'protect_status':
            case 'proxy':
                col.slots = {
                    default: field
                };
                break;
            case 'virtual_team_v3_id':
                col.width = 140;
                break;
            case 'sync_time':
                col.showOverflow = 'title';
                break;
        }
    }
    return state.initColumn;
});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    const actionFields = ['edit'];
    return state.initButton.reduce((acc, btn) => {
        if (actionFields.includes(btn.field)) {
            acc[btn.field] = btn;
        }
        return acc;
    }, {});
});

onMounted(async () => {
    const { button, columns, title_data, title_field_search, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.titleFieldSearch = title_field_search.value || [];
    state.subPageColumns = sub_page_columns || [];

    // 获取所有数据
    tableRef.value.gridOption.proxyConfig.ajax.querySuccess = ({ response }) => {
        state.allData = response.data;
        if(state.searchPolicyId && state.allData.length) {
            showDetail(state.allData[0]);
        }
    };
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
    const fullData = tableRef.value.serverTableRef.getTableData().fullData;
    state.editRow = fullData.filter(item => item.hostname === row.hostname);
    userEdit({type: type, sid: row.id});
};

// 点击防护项
const showDetail = (row) => {
    const fullData = tableRef.value.serverTableRef.getTableData().fullData;
    state.detailRow = fullData.filter(item => item.hostname === row.hostname);
    state.detailRow = state.detailRow.sort((a, b) => 
        ['华为云', '阿里云'].indexOf(a.cloud_source) - ['华为云', '阿里云'].indexOf(b.cloud_source)
    );
    state.detailOpen = true;
};

const spanMethod = ({ row, rowIndex, column, visibleData }) => {
    const spanFields = ['hostname'];
    const cellValue = row[column.field];
    if (cellValue && spanFields.includes(column.field)) {
        const prevRow = visibleData[rowIndex - 1];
        let nextRow = visibleData[rowIndex + 1];
        if (prevRow && prevRow[column.field] === cellValue) {
            return { rowspan: 0, colspan: 0 };
        } else {
            let countRowspan = 1;
            while (nextRow && nextRow[column.field] === cellValue) {
                nextRow = visibleData[++countRowspan + rowIndex];
            }
            if (countRowspan > 1) {
                return { rowspan: countRowspan, colspan: 1 };
            }
        }
    }
};

const defaultSearchField = {
    fields: [
        {
            field: 'hostname',
            field_name: '域名',
            operator: 'vague',
            validate: (value) => {
                return value.includes('.');
            }
        },
        {
            field: 'policy_detail',
            field_name: '规则id',
            operator: 'vague',
        }
    ],
    placeholder: '支持域名、规则id快速搜索'
};

// 搜索防护规则
const handleSearchCondition = (searchModel) => {
    state.searchPolicyId = searchModel.find(item => item.field === 'policy_detail')?.value;
};
</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :query-api="API.getList"
        :request-config="{
            api: API.getList,
            immediate: true
        }"
        :title-field-search="state.titleFieldSearch"
        :is-show-doc="true"
        :span-method="spanMethod"
        :default-search-field="defaultSearchField"
        @user-edit="handleUserEdit"
        @search-condition="handleSearchCondition"
    >
        <!-- 表格插槽 -->
        <template #hostname="{ row }">
            <ops-tooltip :content="row.hostname" placement="topLeft" @click="showDetail(row)"/>
        </template>

        <template #protect_status="{ row }">
            <vxe-tag :class="row.access_status == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.access_status == 1 ? '接入' : '未接入' }}
            </vxe-tag>
            <div style="margin-top: 5px;"></div>
            <vxe-tag :class="row.protect_status == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.protect_status == 1 ? '开启防护' : row.protect_status == 0 ? '暂停防护' : 'bypass' }}
            </vxe-tag>
        </template>

        <template #proxy="{ row }">
            <vxe-tag :class="row.proxy == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.proxy == 1 ? '是' : '否' }}
            </vxe-tag>
        </template>

        <template #access_mode="{ row }">
            <a-tooltip :overlay-style="{maxWidth: 'none'}">
                <template #title>
                    <span class="text-12">
                        <a-typography-paragraph class="tooltip-text" :copyable="{ tooltip: false }">
                            {{ row.access_code }}
                        </a-typography-paragraph>
                    </span>
                </template>
                <div class="truncate" style="width: 100%;">{{ row.access_mode }}</div>
            </a-tooltip>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #sync_time="{ row }">
            <ops-tooltip :content="row.domain_create_times" :primary="false"/>
            <ops-tooltip :content="row.sync_time" :primary="false"/>
        </template>
    </server-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        :edit-row="state.editRow"
        @edit-success="handleDataRefresh"
    />

    <detail
        v-model:open="state.detailOpen"
        :row-columns="state.subPageColumns"
        :title-data="state.initTitleData"
        :policy-rows="state.detailRow"
        :search-policy-id="state.searchPolicyId"
    />
</template>

<style scoped lang="less">
</style>
