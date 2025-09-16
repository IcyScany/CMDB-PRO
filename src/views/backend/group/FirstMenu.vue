<script setup>
import OpsTable from "@/components/OpsTable/index.vue";
import menusApi from "@/api/backend/menusApi";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./Edit.vue";
import opsMessageTip from "@/composables/opsMessageTip";


let indexTableRef = ref(null);
let state = reactive({
    tableData: [],
});
// 用于获取用户的操作权限
const canUserAction = {
    edit: {page_display: true},
    add: {page_display: true},
    del: {page_display: true},
};
const columnList = ref([
    { field: 'sorting', title: '排序', width: 80, dragSort: true },
    { field: 'id', title: 'ID', minWidth: 80 },
    { field: 'menu_name', title: '菜单名', minWidth: 150 },
    { field: 'vue_url', title: '路由前缀', minWidth: 150 },
    { field: 'page_display', title: '页面显示', minWidth: 150, slots:{default: 'page_display'} },
    { field: 'status', title: '是否上线', minWidth: 150, slots:{default: 'status'} },
    { field: 'operation', title: '操作', minWidth: 150, slots:{default: 'operation'} }
]);
// 用户的操作
const {
    userDel,
    userEdit,
    formOpen,
    formType,
    formSid,
} = userOperate({});

// 用户的新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户的删除操作
const handleUserDel = (row) => {
    userDel({delApi: menusApi.delOneMenu, sid: row.id, loadData: handleTableData});
};

// 表格数据的刷新
const handleTableData = async () => {
    indexTableRef.value && await indexTableRef.value?.commitRequest();
};

// 表格的rowgrag
const rowDragendEvent = ({ newRow, oldRow }) => {
    
    let dataRowIndex = state.tableData.findIndex(item => item.id === newRow.id); // 目标行所在数据的位置
    
    if (dataRowIndex > -1) {
        menusApi.putOneMenuSort(oldRow.id, dataRowIndex + 1).then((res) => {
            opsMessageTip({content: res?.msg, closeCallback: () => {
                handleTableData();
            }});
        }).catch(() => {
            nextTick(() => {
                handleTableData();
            });
        });
    }
};

// 处理开关切换
const handleSwitchChange = (row, field) => {
    let switchValue = !row[field];
    menusApi.putOneMenuEdit(row.id, {[field]: switchValue}).then((res) => {
        opsMessageTip({content: res?.msg, closeCallback: () => {
            handleTableData();
        }});
    }).catch(() => {
        nextTick(() => {
            handleTableData();
        });
    });
};
</script>

<template>
    <div class="h-full">
        <ops-table
            ref="indexTableRef"
            :columns="columnList"
            :auth-btn="canUserAction"
            :row-config="{
                    isCurrent: true,
                    drag: true,
                }"
                :default-order="{
                    field: 'sorting',
                    order: 'asc',
                }"
                :request-config="{
                    api: menusApi.getMenusList,
                    params: 0,
                    immediate: true,
                }"
                :switch-click-status-config="{
                    api: menusApi.putOneMenuEdit,   
                }"
                height="100%"
              
                @user-edit="handleUserEdit"
                @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
                @user-del="handleUserDel"
                @row-dragend="rowDragendEvent"
            >
            <template #page_display="{row}">
            <a-switch :checked="row.page_display ? true : false" checked-children="是" un-checked-children="否"  @change="handleSwitchChange(row, 'page_display')" />
        </template>
        <template #status="{row}">
            <a-switch :checked="row.status ? true : false"  checked-children="上线" un-checked-children="下线" @change="handleSwitchChange(row, 'status')" />
        </template>
      
        </ops-table>
    </div>
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleTableData"
    />
</template>
