<script setup>
import cloudServerApi  from '@/api/server/cloudServerApi';
import userOperate from "@/composables/form/opsUserOperate";
import edit from "./edit.vue";
import tableRender from "@/composables/table/tableRender";
import subPage from "@/composables/subPage";
import { isInstanceId, isServerIp } from "xe-utils";
import Monitor from "../monitorTab/Monitor.vue";

const urlPrefix = `server/cloud-server/`;
const serverTableRef = ref(null);
const titleLayer = 1;

const state = reactive({
    initColumn: [],
    subPageColumns: [],
    initButton: [],
    initTitleData: {},
    tableOrder: {},
    titleFieldSearch: [],
});

onMounted(async () => {
    let {
        title_data,
        order,
        button,
        columns: tableColumns,
        sub_page_columns,
        title_field_search,
    } = await tableRender.setColumn({layer: titleLayer, tableType: 'server'});
    state.initButton = button.value;
    state.initTitleData = title_data.value;
    state.tableOrder = order.value ?  order.value : {};
    state.initColumn = tableColumns?.value || [];
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search.value || [];

    await nextTick();
    await handleQueryData();
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
            case 'cloud_source':
                col.cellRender = {
                    name: 'myCloud',
                };
                break;
            case 'server_type':
                col.slots =  {
                    default: field,
                    header: 'server_type_header'
                };
                col.minWidth = '20%';
                col.showOverflow = false;
                break;
            case 'server_hostname':
            case 'charge_type':
                col.slots =  {
                    default: field,
                };
                break;
            case 'id':
                col.showOverflow = 'ellipsis';
                col.slots = {
                    default: field
                };
                break;
            case 'server_ip':
                col.showOverflow = false;
                col.slots = {
                    default: field,
                    header: 'server_ip_header'
                };
                break;
        }
    }
    return state.initColumn;
});
// 用于获取用户的操作权限
let canUserAction = computed(() => {
    let result = {};
    if (state.initButton) {
        for (let btn of state.initButton) {
            let { field } = btn;
            result[field] = btn;
        }
    }
    return result;
});

// 数据的获取
const handleQueryData = async () => {
    serverTableRef.value?.serverTableRef && serverTableRef.value.serverTableRef.commitProxy('query');
};

const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

// 用户的操作
const {
    userEdit,
    userDel,
    formOpen,
    formType,
    formSid,
} = userOperate({});

// 用户的新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = (row) => {
    userDel({ sid: row.id, delApi: cloudServerApi.deleteAccountApi, loadData: handleQueryData });
};

const defaultSearchField = {
    fields: [
        {
            field: 'server_id',
            field_name: '实例ID',
            operator: '=',
            validate: isInstanceId
        },
        {
            field: 'server_ip',
            field_name: '服务IP',
            operator: 'vague',
            validate: isServerIp
        },
        {
            field: 'server_hostname',
            field_name: '主机名',
            operator: 'vague',
            validate: (value) => {
                // 不是IP格式且不是实例ID的都认为是主机名
                return !isServerIp(value) && !isInstanceId(value);
            }
        }
    ],
    placeholder: '支持实例ID、IP、主机名搜索'
};

const subPageTabList = computed(() => {
    return [
        { title: '监控', key: 'monitor', isCustomTab: true },
    ].filter(tab => canUserAction.value[`${tab.key}_permission`]?.page_display);
});

provide('urlPrefix', urlPrefix);
provide('initTitleData', state.initTitleData);

</script>

<template>
    <div class="table-section">
        <server-table
            ref="serverTableRef"
            :table-column="initTableColumns"
            :auth-btn="canUserAction"
            :order="state.tableOrder"
            :query-api="cloudServerApi.postAccountListApi"
            :default-search-field="defaultSearchField"
            :title-field-search="state.titleFieldSearch"
            @user-edit="handleUserEdit"
            @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
        >
            <template #id="{ row }">
                <a-tooltip placement="topLeft">
                    <template #title>             
                        <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.server_id }}</a-typography-paragraph>
                    </template>
                    <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
                </a-tooltip>
            </template>
    
            <template #server_hostname="{row}">
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.server_hostname }}</span>
            </template>
    
            <template #server_type_header>
                服务器规格
            </template>
            <template #server_type="{row}">
                <span>{{row.server_cpu ? `${row.server_cpu}vCPUs` : ''}} | {{row.server_cpu === 0 || row.server_cpu ? `${row.server_cpu} GiB` : ''}} | {{row.server_memory ? `${row.server_memory} GiB` : ''}} | {{row?.server_type}}</span><br/>
                <span>{{row.server_os}} </span>
            </template>
    
            <template #region_id="{row}">
                <ops-region :row="row" :title-data="state.initTitleData"/>
            </template>
    
            <template #charge_type="{row}">
                <ops-expired-time :charge-type="row.charge_type" :expired-time="row.server_expired_time"/>
            </template>
    
            <template #server_cloud_status="{row}">
                <div style="margin-bottom: 10px;">
                    <vxe-tag :class="row.server_status == '已上线' ? 'theme--primary' : 'theme--error'" size="small">
                        {{ row.server_status }}
                    </vxe-tag>
                </div>
                <div>
                    <vxe-tag :class="row.server_cloud_status == '运行中' ? 'theme--primary' : 'theme--error'" size="small">
                        {{ row.server_cloud_status }}
                    </vxe-tag>
                </div>
            </template>
    
            <template #cloud_master_account_id="{row}">
                <div style="display: flex; align-items: center;">
                    <CloudTypeIcon :type="row.cloud_source"/>
                </div>
                {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
            </template>

            <template #server_ip_header>
                服务IP/密码
            </template>
            <template #server_ip="{row}">
                <div>{{ row.server_ip }}</div>
                <OpsCopyContent 
                    type="password"
                    :api-copy="{
                        copyApi: cloudServerApi.getServerPwd,
                        copyParams: row.id
                    }" 
                />        
            </template>

            <template v-if="canUserAction.self_del" #other_operation="{ row }">
                <vxe-button :disabled="row.cloud_source !== '自建'" mode="text" status="error" icon="vxe-icon-delete" @click="handleUserDel(row)"/>
            </template>
        </server-table>
    </div>

    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleQueryData"
    />

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="`NO.${subPageRow?.id} &nbsp;&nbsp; 实例ID:${subPageRow?.server_id ? subPageRow?.server_id : '--'}`"
        width="100%"
        :basic-config="{
            columns: state.subPageColumns,
            api: cloudServerApi.getCloudServerOneList,
            sid: subPageRow?.id
        }"
        :custom-tabs="subPageTabList"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #server_expired_time="{row}">
            <ops-expired-time :expired-time="row.server_expired_time" :sub-page="true"/>
        </template>

        <template #server_cloud_status="{row}">
            <vxe-tag :class="row.server_cloud_status == '运行中' ? 'theme--primary' : 'theme--error'" size="small">
                    {{ row.server_cloud_status }}
            </vxe-tag>
        </template>

        <template #server_status="{row}">
            <vxe-tag :class="row.server_status == '已上线' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.server_status }}
            </vxe-tag>
        </template>

        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #monitor>
            <monitor :sid="subPageRow?.id" />
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
