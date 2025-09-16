<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/vpcRouteApi";
import SubnetsList from "./subnetsList.vue";
import subPage from "@/composables/subPage";
import { clone } from "xe-utils";

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    subnetsOpen: false,
    routeId: 0,
    subPageColumns: [],
    vpcList: [],
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'default':
            case 'subnets':
            case 'region_id':
            case 'id':
            case 'name':
            case 'vpc_id':
                col.slots = {
                    default: field
                };
                break;  
            case 'cloud_source':
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
    await getVpcList();

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

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: API.del, loadData: handleDataRefresh });
};

// 获取VPC列表
const getVpcList = async () => {
    const data = await API.getVpcList();
    state.vpcList = data;
};

// 子网点击事件
const handleSubnets = (row) => {
    state.subnetsOpen = true;
    state.routeRow = clone(row, true);
    state.routeRow.vpc_id = state.vpcList?.[row.vpc_id]?.name;
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
        v-show="!state.subnetsOpen"
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
            uri: 'cloud-route'
         }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.route_id }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>
        <template #name="{row}">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.name}}</span>
        </template>

        <template #default="{ row }">
            <vxe-tag :class="row.default ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.default ? '是' : '否' }}
            </vxe-tag>
        </template>

        <template #region_id="{ row }">
            <span>{{ state.initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>

        <template #subnets="{ row }">
            <vxe-button mode="text" content="路由表" status="primary" @click="handleSubnets(row)"/>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #vpc_id="{ row }">
            <div class="truncate text-primary">
                <UuidNameInfo
                :obj-type="'hw_vpc'"
                :uuid="row.vpc_id"
            />
            </div>
        </template>
    </ops-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />

    <!-- 子网列表 -->
    <subnets-list
        v-model:show="state.subnetsOpen"
        :route-row="state.routeRow"
        :info-columns="state.initColumn"
        :title-data="state.initTitleData"
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
        <template #default="{ row }">
            <vxe-tag :class="row.default ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.default ? '是' : '否' }}
            </vxe-tag>
        </template>

        <template #region_id="{ row }">
            <span>{{ state.initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>

        <template #subnets="{ row }">
            <vxe-button mode="text" content="路由表" status="primary" @click="handleSubnets(row)"/>
        </template>

        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
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
