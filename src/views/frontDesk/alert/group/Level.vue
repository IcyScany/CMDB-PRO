<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import manageApi from "@/api/alert/manageApi";
import LevelEdit from "./LevelEdit.vue";
import subPage from "@/composables/subPage";

const TITLE_LAYER = 3;

// 状态管理
const tableRef = ref(null);
const {level} = manageApi;
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
});

// 用户操作相关
const { userDel,userEdit, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
            case 'notice_type':
            case 'alert_level':
            case 'id':
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
    const actionFields = ['edit', 'add', 'delete'];
    return state.initButton.reduce((acc, btn) => {
        if (actionFields.includes(btn.field)) {
            acc[btn.field === 'delete' ? 'del': btn.field] = btn;
        }
        return acc;
    }, {});
});

onMounted(async () => {
    const { button, columns, title_data } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    handleDataRefresh();
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
// 用户的删除操作
const handleUserDel = (row) => {
    userDel({delApi: level.delete, sid: row.id, loadData: handleDataRefresh});
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
            api: level.getList,
            immediate: false
        }"
        :switch-click-status-config="{
            api: level.putEdit,
        }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"    
    >

        <!-- 表格插槽 -->
          <!-- 表格插槽 -->
        <template #id="{row}">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
        </template>
        <template #notice_type="{row}">
            {{ state.initTitleData?.notice_type.find(item => item.value === row?.notice_type)?.label || row?.notice_type }}
        </template>
        <template #alert_level="{row}">
            <alert-level-render :level="row?.alert_level"></alert-level-render>
        </template>
    </ops-table>

    <!-- 编辑组件 -->
    <level-edit
        v-model:open="formOpen"
        :sid="formSid"
        :table-all-data="tableRef?.tableAllData || []"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />

      <!-- 子页面 -->
      <ops-sub-page
        v-model:open="subPageOpen"
        :row-data="subPageRow"
        :title="`NO.${subPageRow?.id}告警等级信息`"
        :basic-config="{
            api: level.getList,
            sid: subPageRow?.id,
            columns: state.subPageColumns,
        }"
    >
    <template #notice_type="{row}">
            {{ state.initTitleData?.notice_type.find(item => item.value === row?.notice_type)?.label || row?.notice_type }}
        </template>
        <template #alert_level="{row}">
            <alert-level-render :level="row?.alert_level"></alert-level-render>
        </template>
        
    </ops-sub-page>
</template>

<style scoped lang="less">
</style>
