<script setup>
import tableRender from "@/composables/table/tableRender";
import vpcApi from "@/api/network/vpcApi";
import userOperate from "@/composables/form/opsUserOperate";
import VpcEdit from './edit.vue';
import subPage from "@/composables/subPage";

const initColumn = ref([]); // 表格的列
const titleLayer = 1;
const initButton = ref([]); // 表格的button
const initTitleData = ref({}); // 表格的title数据
const subPageColumns = ref([]);

onMounted(async () => {
    let {
        button,
        columns,
        title_data,
        sub_page_columns,
    } = await tableRender.setColumn({layer: titleLayer});
    initColumn.value = columns.value || [];
    initButton.value = button.value || [];
    initTitleData.value = title_data.value || {};
    subPageColumns.value = sub_page_columns || [];
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of initColumn.value) {
        let { field }  = col;
        switch (field) {
            case 'region_id':
            case 'id':
            case 'name':
            {
                col.slots = {
                    default: field
                };
                break;
            }
            case 'vpc_status': {
                col.slots = {
                    default: field
                };
                break;
            }
        }
    }
    return initColumn.value;
});

// 用于获取用户的操作权限
let canUserAction = computed(() => {
    let result = {};
    if (initButton.value) {
        for (let btn of initButton.value) {
            let { field } = btn;
            switch (field) {
                case 'edit':
                    result[field] = btn;
                    break;
            }
        }
    }
    return result;
});

// 用户的操作
const {
    userEdit,
    formOpen,
    formType,
    formSid,
} = userOperate({});

// 用户的新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};
// vpc表格
const vpcSubnetTable = ref(null);

// 表格数据的获取
const handleAllData = async () => {
    vpcSubnetTable.value && await vpcSubnetTable.value?.commitRequest();
};

// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();
</script>

<template>
    <ops-table
        ref="vpcSubnetTable"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :request-config="{
            api: vpcApi.getVpcList,
            immediate: true,
        }"
        :show-env-search="{
            app_name: 'cloud_vpc',
        }"
        :is-show-sync="{
            show: true,
            uri: 'cloud-vpc'
        }"
       
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
    >
        <template #region_id="{ row }">
            <span>{{ initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>
        <template #id="{row}">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.vpc_id }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>
        <template #name="{row}">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.name }}</span>
        </template>
        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>
        <template #vpc_status="{ row }">
            <vxe-tag :class="row.vpc_status === '可用' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.vpc_status }}
            </vxe-tag>
        </template>
    </ops-table>

    <vpc-edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleAllData"
    />

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.name"
        :basic-config="{
            columns: subPageColumns,
            api: vpcApi.getVpcList,
            sid: subPageRow?.id,
        }"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #vpc_status="{ row }">
            <vxe-tag :class="row.vpc_status === '可用' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.vpc_status }}
            </vxe-tag>
        </template>
        <template #cloud_master_account_id="{row}">
            {{ initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
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
