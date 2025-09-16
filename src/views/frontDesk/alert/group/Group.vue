<script setup>
import tableRender from "@/composables/table/tableRender";
import manageApi from "@/api/alert/manageApi";
import userOperate from "@/composables/form/opsUserOperate";
import subPage from "@/composables/subPage";
import GroupEdit from './GroupEdit.vue';


let {group} = manageApi;


const TITLE_LAYER = 2;
// 用户操作相关
const { userDel,userEdit, formOpen, formType, formSid } = userOperate({});
// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    subPageColumns: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    titleFieldSearch: [],
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'notify_status':
                col.slots = {
                    default: field
                };
                break;  
            case 'virtual_teams':
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
        // 切换后等待 DOM 更新再触发表格自适应
        nextTick(() => {
            if (tableRef.value?.serverTableRef) {
                tableRef.value?.serverTableRef?.recalculate?.(true);
            }
        });
    }
};



// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};
// 用户的删除操作
const handleUserDel = ({row}) => {
    userDel({delApi: group.delete, sid: row.id, loadData: handleDataRefresh});
};
</script>

<template>
     <div style="flex: auto; min-height: 0;">
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="state.tableOrder"
        :query-api="group.postList"
        :title-field-search="state.titleFieldSearch"
        :switch-click-status-config="{
            api: group.putEdit,
            field: 'notify_status',
        }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
        </template>
        <template #notify_status="{row}">
            {{ state.initTitleData?.notify_status.find(item => item.value === row?.notify_status)?.label || row?.notify_status }}
        </template>

       
       

    </server-table>

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        :row-data="subPageRow"
        :title="`${subPageRow?.classify_name}-告警分组信息`"
        :basic-config="{
            api: group.getDetail,
            sid: subPageRow?.id,
           
            columns: state.subPageColumns,
        }"
    >
        
    </ops-sub-page>

     <!-- 编辑组件 -->
     <group-edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />
</div>
<!-- 主表格部分 -->

   
</template>

<style scoped lang="less">

</style>
