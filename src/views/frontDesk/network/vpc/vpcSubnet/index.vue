<script setup>
import vpcApi  from '@/api/network/vpcApi';
import userOperate from "@/composables/form/opsUserOperate";
import edit from "./edit.vue";
import tableRender from "@/composables/table/tableRender";
import {isServerIp} from 'xe-utils';
import subPage from "@/composables/subPage";

/**
 *  服务器端表格
 *  1、需先获取当前菜单的title
 *  2、获取到当前title后生成column 用于表格的的列绘制,
 * **/


const titleLayer = 1;
let initColumn = ref([]);
let initButton = ref([]);
let initTitleData = ref({});
let subPageColumns = ref([]);
let titleFieldSearch = ref([]);

const serverTableRef = ref(null);
let tableOrder = ref({}); // 表格的初始排序

onMounted(async () => {
    let {
        title_data,
        order,
        button,
        columns: tableColumns,
        sub_page_columns,
        title_field_search,
    } = await tableRender.setColumn({layer: titleLayer, tableType: 'server'});
    initColumn.value = tableColumns?.value || [];
    initButton.value = button.value;
    initTitleData.value = title_data.value;
    tableOrder.value = order.value ?  order.value : {};
    subPageColumns.value = sub_page_columns || [];
    titleFieldSearch.value = title_field_search.value || [];
    await handleQueryData();
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of initColumn.value) {
        let { field }  = col;
        switch (field) {
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
            case 'region_id': 
            case 'ipv6_enable': 
            case 'status':
            case 'id':
            case 'name':
            case 'vpc_id':
                col.slots = {
                    default: field
                };
                break;
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
                case 'add':
                    result[field] = btn;
                    break;
            }
        }
    }
    return result;
});

// 数据的获取
const handleQueryData = async () => {
    serverTableRef.value && serverTableRef.value.serverTableRef.commitProxy('query');
};

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



// 默认搜索字段配置
const defaultSearchField = computed(() => ({
    fields: [
        {
            field: 'cidr', // 子网ip的数据格式 10.208.32.0/24
            operator: 'vague',
            field_name: '子网IP',
            validate: isServerIp
        },
        {
            field: 'description',
            operator: 'vague',
            field_name: '描述',
            validate: (value) => !isServerIp(value)  // 当不是 IP 格式时匹配主机名
        }
    ],
    placeholder: '直接输入支持子网IP、描述'  // 添加自定义提示文本
}));


// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

const transRegionId = (row) => {
    let regionId = row.region_id;
    let zoneId = '';

    if(row.cloud_source === '华为云') {
        zoneId = `${row?.availability_zone}`.replace(`${regionId}`, '').toUpperCase();
    } else if(row.cloud_source === '阿里云') {
        zoneId = `${row?.availability_zone}`.replace(`${regionId}-`, '').toUpperCase();
    }

    return zoneId ? zoneId[0] + '区' : '';
};

</script>


<template>
    <server-table
        ref="serverTableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="tableOrder"
        :query-api="vpcApi.postVpcSubnetList"
        :is-show-doc="true"
        :default-search-field="defaultSearchField"
        :show-env-search="{
                app_name: 'cloud_vpc_subnet',
        }"
         :title-field-search="titleFieldSearch"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
    >
        <template #id="{row}">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.subnet_id }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>
        <template #name="{row}">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.name}}</span>
        </template>

        <template #region_id="{ row }">
            {{ transRegionId(row) }}<br/>
            <span>{{ initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>

        <template #ipv6_enable="{ row }">
            <vxe-tag :class="row.ipv6_enable == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.ipv6_enable == 1 ? '打开' : '关闭' }}
            </vxe-tag>
        </template>
        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #status="{ row }">
            <vxe-tag :class="row.status == '可用' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.status }}
            </vxe-tag>
        </template>

        <template #vpc_id="{ row }">
            <div class="truncate text-primary">
                <UuidNameInfo
                :obj-type="'hw_vpc'"
                :uuid="row.vpc_id"
            />
            </div>
        </template>
    </server-table>

    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleQueryData"
    />

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.name"
        :basic-config="{
            columns: subPageColumns,
            api: vpcApi.getVpcSubnetList,
            sid: subPageRow?.id,
        }"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #region_id="{ row }">
            <span>{{ initTitleData?.['region_id']?.[row.region_id] || row.region_id }}</span>
        </template>
        <template #availability_zone="{ row }">
            {{ transRegionId(row) }}
        </template>

        <template #ipv6_enable="{ row }">
            <vxe-tag :class="row.ipv6_enable == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.ipv6_enable == 1 ? '打开' : '关闭' }}
            </vxe-tag>
        </template>
        <template #cloud_master_account_id="{row}">
            {{ initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>
        <template #status="{ row }">
            <vxe-tag :class="row.status == '可用' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.status }}
            </vxe-tag>
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
