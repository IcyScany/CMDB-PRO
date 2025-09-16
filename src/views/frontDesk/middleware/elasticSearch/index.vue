<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/middleware/elasticSearch";
import subPage from "@/composables/subPage";
import Nodes from "./nodes/index.vue";
import SubUser from "./subUser/index.vue";

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    subPageColumns: [],
    editRow: null
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'region_id':
            case 'charging_period':
            case 'enterprise_project_id':
            case 'cluster_type':
                col.slots = {
                    default: field
                };
                break;  
            case 'name':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                break;  
            case 'address_pwd_manage':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                col.minWidth = 300;
                break;  
            case 'primary_user_pwd':
                col.slots = {
                    default: field,
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
    return state.initButton.reduce((acc, btn) => {
        acc[btn.field] = btn;
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
    state.editRow = row;
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

        <template #primary_user_pwd="{row}">
            <div>{{ row.primary_user }}</div>
            <OpsCopyContent 
                type="password"
                :api-copy="{
                    copyApi: API.copyPwd,
                    copyParams: { id: row.id }
                }" 
            />        
        </template>

        <template #region_id="{row}">
            {{ state.initTitleData.region_id?.[row.region_id] }}
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #describe="{ row }">
            <ops-tooltip 
                :title="row.cluster_id" 
                :content="row.cluster_id" 
                @click="handleSubPageOpen(row)"
            />
            {{ row.describe }}
        </template>

        <template #name="{ row }">
            <ops-tooltip 
                :title="row.cluster_id" 
                :content="row.name" 
                @click="handleSubPageOpen(row)"
            />
        </template>

        <template #sync_time="{ row }">
            <ops-tooltip 
                :title="row.cluster_create_time" 
                :content="row.cluster_create_time" 
                :primary="false"
            />
            <ops-tooltip 
                :title="row.sync_time" 
                :content="row.sync_time" 
                :primary="false"
            />
        </template>

        <template #address_pwd_manage="{ row }">
            <div style="overflow: hidden;">
                <table class="custom-table custom-table-bordered">
                    <template v-for="(item, key) in row.address_pwd_manage" :key="key">
                        <tr v-if="item.addr_type">
                            <td>{{ item.addr_type }}</td>
                            <td style="max-width: 120px; overflow: hidden;">
                                <a-tooltip :title="item.addr">
                                    <div class="truncate">
                                        <a :href="item?.addr" target="_blank">{{ item.addr }}</a>
                                    </div>
                                </a-tooltip>
                            </td>
                            <td>
                                {{ item.username }}
                                <OpsCopyContent 
                                    type="password"
                                    :api-copy="{
                                        copyApi: API.copyPwd,
                                        copyParams: { id: row.id, addr: item.addr }
                                    }" 
                                />  
                            </td>
                        </tr>
                    </template>
                </table>
            </div>
        </template>

        <template #charging_period="{ row }">
            <ops-expired-time :charge-type="row.charging_period?.period" :expired-time="row.charging_period?.expire_time"/>
        </template>

        <template #enterprise_project_id="{ row }">
            {{ state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id] || row.enterprise_project_id }}
        </template>

        <template #cluster_type="{ row }">
            <svg-icon :iconname="`icon-${{'Elasticsearch': 'Elastic', 'Opensearch': 'opensearch'}?.[row?.cluster_type]}`"/>
            {{ row.cluster_type }}
        </template>

        <template #cloud_status="{ row }">
            <div class="flex flex-col gap-1">
                <div><ops-status :value="row.status" active-value="已上线"/></div>
                <div><ops-status :value="row.cloud_status" active-value="可用"/></div>
            </div>
        </template>

        <template #operation="{row}">
            <span class="inline-flex items-center">
                <vxe-button mode="text" status="primary" icon="vxe-icon-edit" @click="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row})"/>
            </span>

            <a-divider type="vertical" /> 

            <vxe-button :disabled="row.cloud_source !== '自建'" mode="text" status="error" icon="vxe-icon-delete" @click="handleUserDel(row)"/>
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
            { key: 'subUser', title: '子用户列表', isCustomTab: true },
        ]"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #primary_user_pwd="{row}">
            <OpsCopyContent 
                type="password"
                :api-copy="{
                    copyApi: API.copyPwd,
                    copyParams: { id: row.id }
                }" 
            />         
        </template>

        <template #region_id="{row}">
            {{ state.initTitleData.region_id?.[row.region_id] }}
        </template>

        <template #address_pwd_manage="{ row }">
            <div style="overflow: hidden;">
                <table class="custom-table custom-table-bordered">
                    <template v-for="(item, key) in row.address_pwd_manage" :key="key">
                        <tr v-if="item.addr_type">
                            <td>{{ item.addr_type }}</td>
                            <td>
                                <a :href="item?.addr" target="_blank">{{ item.addr }}</a>
                            </td>
                            <td>
                                {{ item.username }}
                                <OpsCopyContent 
                                    type="password"
                                    :api-copy="{
                                        copyApi: API.copyPwd,
                                        copyParams: { id: row.id, addr: item.addr }
                                    }" 
                                />  
                            </td>
                        </tr>
                    </template>
                </table>
            </div>
        </template>

        <template #charging_period="{ row }">
            <ops-expired-time :charge-type="row.charging_period?.period" :expired-time="row.charging_period?.expire_time" :sub-page="true"/>
        </template>

        <template #enterprise_project_id="{ row }">
            {{ state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id] || row.enterprise_project_id }}
        </template>

        <template #cloud_status="{ row }">
            <div><ops-status :value="row.cloud_status" active-value="可用"/></div>
        </template>

        <template #status="{ row }">
            <div><ops-status :value="row.status" active-value="已上线"/></div>
        </template>

        <template #nodes>
            <div class="custom-tabs">
                <nodes :row="subPageRow" />
            </div>
        </template>

        <template #subUser>
            <div class="custom-tabs">
                <sub-user :row-data="subPageRow" />
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
