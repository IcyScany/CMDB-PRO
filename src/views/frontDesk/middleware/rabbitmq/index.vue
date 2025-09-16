<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/middleware/rabbitmq";
import subPage from "@/composables/subPage";
import Nodes from "./nodes.vue";
import Queues from "./queues.vue";

const TITLE_LAYER = 1;

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
            case 'cluster_id':
            case 'vip_domain':
            case 'haproxy':
            case 'manage_domain':
                col.slots = {
                    default: field
                };
                break;  
            case 'manage_passwd':
                col.slots = {
                    default: field,
                    header: 'manage_passwd_header'
                };
                col.showOverflow = false;
                break;  
            case 'vip':
                col.slots = {
                    default: field,
                    header: 'vip_header'
                };
                break;
            case 'manage_address':
                col.slots = {
                    default: field,
                    header: 'manage_address_header'
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
            uri: 'cloud-route'
         }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <ops-tooltip 
                :title="row.cluster_id" 
                :content="row.id" 
                @click="handleSubPageOpen(row)"
            />
        </template>

        <template #cluster_id="{row}">
            <ops-tooltip 
                :title="row.cluster_id" 
                :content="row.cluster_id" 
                :primary="false"
            />
        </template>

        <template #vip_header>
            VIP/端口
        </template>
        <template #vip="{row}">
            <ops-tooltip :title="`${row.vip}:${row.vip_port}`" :content="`${row.vip}:${row.vip_port}`" :primary="false" />
        </template>

        <template #manage_address_header>
            管理地址
        </template>
        <template #manage_address="{row}">
            <ops-tooltip :title="`${row.manage_address}:${row.manage_port}`" :content="`${row.manage_address}:${row.manage_port}`" :primary="false" />
        </template>

        <template #vip_domain="{row}">
            <ops-tooltip :title="row.vip_domain?.join(', ')" :content="row.vip_domain?.join(', ')" :primary="false" />
        </template>

        <template #haproxy="{row}">
            <ops-tooltip :title="row.haproxy?.join(', ')" :content="row.haproxy?.join(', ')" :primary="false" />
        </template>

        <template #manage_domain="{row}">
            <ops-tooltip :title="row.manage_domain?.join(', ')" :content="row.manage_domain?.join(', ')" :primary="false" />
        </template>

        <template #manage_passwd_header>
            用户名/密码
        </template>

        <template #manage_passwd="{row}">
            <div>{{ row.manage_user }}</div>
            <OpsCopyContent 
                type="password"
                :api-copy="{
                    copyApi: API.copyPwd,
                    copyParams: row.id
                }" 
            />        
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #cloud_status="{ row }">
            <div class="flex flex-col gap-1">
                <div v-if="row.status"><ops-status :value="row.status" active-value="已上线"/></div>
                <div v-if="row.cloud_status">
                    <vxe-tag :class="row.cloud_status === 'RUNNING' ? 'theme--primary' : row.cloud_status === 'CREATING' ? 'theme--warning' : 'theme--error'">
                        {{ row.cloud_status }}
                    </vxe-tag>
                </div>
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

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.cluster_id"
        :basic-config="{
            columns: state.subPageColumns,
            api: API.getDetail,
            sid: subPageRow?.id,
        }"
        :custom-tabs="[
            { key: 'nodes', title: '节点列表', isCustomTab: true },
            { key: 'queues', title: '队列列表', isCustomTab: true },
        ]"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #manage_passwd="{row}">
            <OpsCopyContent 
                type="password"
                :api-copy="{
                    copyApi: API.copyPwd,
                    copyParams: row.id
                }" 
            />        
        </template>

        <template #vip="{row}">
            <span v-if="row.vip">{{ row.vip }}:{{ row.vip_port }}</span>
        </template>

        <template #vip_domain="{row}">
            {{ row.vip_domain?.join(', ') }}
        </template>

        <template #haproxy="{row}">
            {{ row.haproxy?.join(', ') }}
        </template>

        <template #manage_domain="{row}">
            {{ row.manage_domain?.join(', ') }}
        </template>

        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #cloud_status="{ row }">
            <vxe-tag v-if="row.cloud_status" :class="row.cloud_status === 'RUNNING' ? 'theme--primary' : row.cloud_status === 'CREATING' ? 'theme--warning' : 'theme--error'">
                {{ row.cloud_status }}
            </vxe-tag>
        </template>

        <template #status="{ row }">
            <ops-status :value="row.status" active-value="已上线"/>
        </template>
        
        <template #nodes>
            <div class="custom-tabs">
                <nodes :row="subPageRow" />
            </div>
        </template>

        <template #queues>
            <div class="custom-tabs">
                <queues :row="subPageRow" />
            </div>
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
:deep(.ant-typography) {
    margin-bottom: 0 !important;
}

.custom-tabs {
    height: calc(100vh - 140px);
}
</style>
