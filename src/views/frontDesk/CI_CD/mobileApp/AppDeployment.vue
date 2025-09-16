<script setup>
import tableRender from "@/composables/table/tableRender";
import mobileAppApi from '@/api/ci_cd/mobileApp';
import subPage from "@/composables/subPage";
import AppDeploymentEdit from './AppDeploymenteEdit.vue';
import userOperate from "@/composables/form/opsUserOperate";

const TITLE_LAYER = 4;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    subPageColumns: [],
    initButton: [],
    initTitleData: [],
    titleFieldSearch: [],
   
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'config':
            case 'name':
                col.slots = {
                    default: field
                };
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
    const { button, columns, title_data, title_field_search, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
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

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 用户新增编辑操作
const handleUserEdit = ({ type, row }) => {
    userEdit({ type: type, sid: row.id });
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: mobileAppApi.delDeploymentTarget, loadData: handleDataRefresh });
};

// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();
</script>

<template>
     <div   class=" bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col p-4 h-[calc(100vh-200px)]">

        <!-- 主表格部分 -->
        <server-table
            ref="tableRef"
            :table-column="initTableColumns"
            :auth-btn="canUserAction"
            :query-api="mobileAppApi.postDeploymentTargetList"
            :title-field-search="state.titleFieldSearch"
            :switch-click-status-config="{
                 api: mobileAppApi.putDeploymentTargetEdit,
                 params:['is_active'],
            }"
            @user-edit="handleUserEdit"
            @user-del="handleUserDel"
            @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
            @get-data="handleDataRefresh"
          
        >
            <!-- 表格插槽 -->
            <template #id="{row}">
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </template>
            <template #name="{row}">
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.name }}</span>
            </template>
            <template #config="{row}">
                <span  v-if="row.config" >{{ row.config ? JSON.stringify(row.config) : '' }}</span>
            </template>
        </server-table>
    </div>
    

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        :row-data="subPageRow"
        :title="subPageRow?.name"
        :basic-config="{
            api: mobileAppApi.getDeploymentTargetDetail,
            sid: subPageRow?.id,
            title: '部署目标信息',
            columns: state.subPageColumns,
        }"
    >

    </ops-sub-page>
    <AppDeploymentEdit v-model:open="formOpen" :sid="formSid" :form-type="formType" @edit-success="handleDataRefresh"/>


   
</template>

<style scoped lang="less">
.copy-text {
    color:white; 
    font-size: 12px;
    margin-bottom: 0 !important;
}
</style>
