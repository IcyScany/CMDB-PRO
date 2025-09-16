<script setup>
import tableRender from "@/composables/table/tableRender";
import API from "@/api/security/securityGroup";
import SecurityRule from './securityRule/index.vue';
import subPage from "@/composables/subPage";

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    subPageColumns: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    titleFieldSearch: [],
    securityRuleOpen: false,
    securityRuleRow: {},
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'region_id':
            case 'enterprise_project_id':
            case 'security_group_id':
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

// 安全组规则详情
const handleSecurityRule = (row) => {
    state.securityRuleRow = row;
    state.securityRuleOpen = true;
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
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.security_group_id }}</a-typography-paragraph>
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

        <template #region_id="{row}">
            <div>{{state.initTitleData?.region_id ? state.initTitleData?.region_id?.[row?.region_id] || row?.region_id : row?.region_id}}</div>
        </template>

        <template #enterprise_project_id="{row}">
            {{ state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id] || row.enterprise_project_id }}
        </template>

        <template #security_group_id="{row}">
            <span 
                class="cursor-pointer text-primary" 
                @click="handleSecurityRule(row)"
            >
                {{ row.security_group_id }}
            </span>
        </template>
    </server-table>

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        :row-data="subPageRow"
        :title="subPageRow?.name"
        :basic-config="{
            api: API.getDetail,
            sid: subPageRow?.id,
            title: '安全组信息',
            columns: state.subPageColumns,
        }"
    >
        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #region_id="{row}">
            <div>{{state.initTitleData?.region_id ? state.initTitleData?.region_id?.[row?.region_id] || row?.region_id : row?.region_id}}</div>
        </template>

        <template #enterprise_project_id="{row}">
            {{ state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id] || row.enterprise_project_id }}
        </template>

        <template #security_group_id="{row}">
            <span 
                class="cursor-pointer text-primary" 
                @click="handleSecurityRule(row)"
            >
                {{ row.security_group_id }}
            </span>
        </template>
    </ops-sub-page>


    <!-- 安全组规则详情 -->
    <security-rule
        v-model:open="state.securityRuleOpen"
        :row-data="state.securityRuleRow"
        :cloud-source="state.securityRuleRow?.cloud_source"
    />
</template>

<style scoped lang="less">
.copy-text {
    color:white; 
    font-size: 12px;
    margin-bottom: 0 !important;
}
</style>
