<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/middleware/kafka";
import subPage from "@/composables/subPage";
import queues from "./queues.vue";

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
            case 'ip':
            case 'zk_ip':
            case 'cluster_id':
            case 'manager_ip':
            case 'region_id':
                col.slots = {
                    default: field
                };
                break;  
            case 'manager_passwd':
                col.slots = {
                    default: field,
                    header: 'manager_passwd_header'  
                };
                col.showOverflow = false;
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
                placement="topLeft"
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

        <template #manager_ip="{row}">
            <a :href="row.manager_ip" target="_blank">{{ row.manager_ip }}</a>
        </template>
        
        <template #manager_domain="{row}">
            <ops-tooltip :title="row.manager_domain?.join(', ')" :content="row.manager_domain?.join(', ')" :primary="false" />
        </template>

        <template #manager_passwd_header>
            用户名/密码
        </template>
        <template #manager_passwd="{row}">
            <div>{{ row.manager_user }}</div>
            <OpsCopyContent 
                type="password"
                :api-copy="{
                    copyApi: API.copyPwd,
                    copyParams: row.id
                }" 
            />        
        </template>

        <template #region_id="{row}">
            {{ state.initTitleData.region_id?.[row.region_id] }}
        </template>

        <template #ip="{row}">
            <a-tooltip v-if="row.ip">
                <template #title>
                    <pre>{{ row.ip }}</pre>
                </template>
                <a-typography-paragraph :copyable="{ text: JSON.stringify(row.ip, null, 2), tooltip: false }" style="max-width: 30px;"></a-typography-paragraph>
            </a-tooltip>
        </template>

        <template #zk_ip="{row}">
            <a-tooltip v-if="row.zk_ip">
                <template #title>
                    <pre>{{ row.zk_ip }}</pre>
                </template>
                <a-typography-paragraph :copyable="{ text: JSON.stringify(row.zk_ip, null, 2), tooltip: false }" style="max-width: 30px;"></a-typography-paragraph> 
            </a-tooltip>
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
            { key: 'queues', title: '队列信息', isCustomTab: true },
        ]"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #manager_passwd="{row}">
            <OpsCopyContent 
                type="password"
                :api-copy="{
                    copyApi: API.copyPwd,
                    copyParams: row.id
                }" 
            />         
        </template>

        <template #ip="{row}">
            <pre>{{ row.ip }}</pre>
        </template>

        <template #zk_ip="{row}">
            <pre>{{ row.zk_ip }}</pre>
        </template>

        <template #region_id="{row}">
            {{ state.initTitleData.region_id?.[row.region_id] }}
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
