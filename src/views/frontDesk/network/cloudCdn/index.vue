<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/cloudCdnApi";
import Detail from "./detail/index.vue";
const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: {},
    tableOrder: {},
    subPageColumns: [],
    titleFieldSearch: [],
    editRow: [],
    detailRows: [],
    detailOpen: false,
});

// 用户操作相关
const { userEdit, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    const slotFields = ['https_status', 'domain_name', 'domain_status', 'cname'];
    
    return state.initColumn.map(col => {
        if (slotFields.includes(col.field)) {
            return {
                ...col,
                slots: { default: col.field },
                showOverflow: col.field === 'domain_name' ? 'title' : 'tooltip',
            };
        }
        if (col.field === 'virtual_team_v3_id') {
            return {
                ...col,
                showOverflow: false,
            };
        }
        return col;
    });
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
    const { button, columns, title_data, order, sub_page_columns, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || {};
    state.tableOrder = order.value ?  order.value : {};
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search.value || [];
    await nextTick();
    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value?.serverTableRef ) {
        tableRef.value.serverTableRef.commitProxy('query');
    }
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    const fullData = tableRef.value.serverTableRef.getTableData().fullData;
    state.editRow = fullData.filter(item => item.domain_name === row.domain_name);
    userEdit({type: type, sid: row.id});
};

const spanMethod = ({ row, rowIndex, column, visibleData }) => {
    const spanFields = ['domain_name'];
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

const showDetail = (row) => {
    const fullData = tableRef.value.serverTableRef.getTableData().fullData;
    state.detailRows = fullData.filter(item => item.domain_name === row.domain_name);
    state.detailRows = state.detailRows.sort((a, b) => 
        ['华为云', '阿里云'].indexOf(a.cloud_source) - ['华为云', '阿里云'].indexOf(b.cloud_source)
    );
    state.detailOpen = true;
};

const defaultSearchField = {
    fields: [
        {
            field: 'id',
            field_name: 'ID',
            operator: '=',
            validate: value => /^\d+$/.test(value)
        },
        {
            field: 'domain_name',
            field_name: '域名',
            operator: 'vague',
        }
    ],
    placeholder: '支持ID、加速域名搜索'
};

</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :query-api="API.postList"
        :order="state.tableOrder"
        :filter-config="{
            remote: false,
            showIcon: true
        }"
        :span-method="spanMethod"
        :title-field-search="state.titleFieldSearch"
        :default-search-field="defaultSearchField"
        @user-edit="handleUserEdit"
    >
        <!-- 表格插槽 -->
        <template #https_status="{ row }">
            <vxe-tag :class="row.https_status !== 0 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.https_status !== 0 ? '已开启' : '未启用' }}
            </vxe-tag>
        </template>

        <template #domain_name="{ row }">
            <a-tooltip placement="topLeft">
                <template #title>
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="tooltip-text">{{ row.domain_name }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="showDetail(row)">{{ row.domain_name }}</span>
            </a-tooltip>
        </template>

        <template #cname="{ row }">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.cname }}</span>
        </template>

        <template #domain_status="{ row }">
            <vxe-tag :class="row.domain_status === '已开启' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.domain_status}}
            </vxe-tag>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row?.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
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
        :detail-rows="state.detailRows"
    />

</template>

<style scoped lang="less">
</style>
