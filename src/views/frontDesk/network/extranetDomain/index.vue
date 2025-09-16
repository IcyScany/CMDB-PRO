<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/extranetDomain";
import subPage from "@/composables/subPage";
import DataFlow from "./dataFlow.vue";

const TITLE_LAYER = 1;
const TOOLTIP_STYLE = {
    fontSize: '12px',
    maxWidth: '500px',
};

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
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
            case 'status':
            case 'domain_id':
            case 'domain':
            case 'regions_id':
                col.slots = {
                    default: field
                };
                break;  
            case 'data_flow':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                col.minWidth = 540;
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
    const { button, columns, title_data, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.subPageColumns = sub_page_columns || [];
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.commitRequest();
    }
};

const handleUpdateFullData = () => {
    tableRef.value.tableAllData.forEach(item => {
        item.wholeIp = `${item.domain_name}.${item.domain_suffix}`;
    });
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = (row) => {
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
    <ops-table
        ref="tableRef"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :request-config="{
            api: API.getList,
            immediate: true
        }"
        :filter-config="{
            remote: false,
            showIcon: true
        }"
        :is-show-sync="{
            show: true,
            uri: 'cloud-dns'
         }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
        @update:full-data="handleUpdateFullData"
    >
        <!-- 表格插槽 -->
        <template #id="{ row }">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.domain_id }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>

        <template #domain_id="{ row }">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.domain_id }}</span>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row?.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #domain="{row}">
            <span v-if="row.domain_name">{{ row.domain_name }}.{{ row.domain_suffix }}</span>
            <span v-else>{{ row.domain_suffix }}</span>
        </template>

        <template #status="{row}">
            <vxe-tag v-if="row.status == 1" class="theme--primary">启用解析</vxe-tag>
            <vxe-tag v-else-if="row.status == 16" class="theme--warning">智能切换</vxe-tag>
            <vxe-tag v-else class="theme--error">暂停解析</vxe-tag>
        </template>

        <template #data_flow="{ row }">
            <data-flow :row="row" />
        </template>

        <template #regions_id="{ row }">
            <span>{{ state.initTitleData?.['regions_id']?.[row.regions_id] || row.regions_id }}</span>
        </template>
    </ops-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.domain_id"
        :basic-config="{
            columns: state.subPageColumns,
            api: API.getDetail,
            sid: subPageRow?.id,
        }"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #domain="{row}">
            {{ row.domain_name }}.{{ row.domain_suffix }}
        </template>

        <template #value="{row}">
            <a-tooltip :overlay-style="TOOLTIP_STYLE" :title="row.value">
                <span class="truncate inline-block" style="max-width: 100%;">{{ row.value }}</span>
            </a-tooltip>
        </template>

        <template #status="{row}">
            <vxe-tag v-if="row.status == 1" class="theme--primary">OK</vxe-tag>
            <vxe-tag v-else-if="row.status == 16" class="theme--warning">智能切换</vxe-tag>
            <vxe-tag v-else class="theme--error">NG</vxe-tag>
        </template>
     
        <template #regions_id="{ row }">
            <span>{{ state.initTitleData?.['regions_id']?.[row.regions_id] || row.regions_id }}</span>
        </template>

        <template #basic-extra="{ row }">
            <a-card class="data-flow-card">
                <ops-descriptions :columns="[{ field: 'data_flow', title: '数据流向' }]" :column="1">
                    <template #data_flow>
                        <data-flow :row="row"/>
                    </template>
                </ops-descriptions>

                <data-flow :row="row" :is-desc="true"/>
            </a-card>
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
.copy-text {
    color:white; 
    font-size: 12px;
    margin-bottom: 0 !important;
}

.data-flow-card {
    margin-top: 10px;
}
</style>
