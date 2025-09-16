<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/monitor/expireRemind";

const TITLE_LAYER = 1;
const STATUS_COLOR = {
    '全部': '',
    '使用中': '#67c23a',
    '快到期': '#5e72e4',
    '已到期': '#fb6340',
    '停用' : '#474747',
};

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    fullData: [],
    filterConditions: {
        status: null,
    },
    options: {
        username: [],
        email: [],
        mobile: [],
    }
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'status':
                col.slots = {
                    default: field
                };
                break;  
            case 'end_time':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                col.minWidth = 150;
                break;  
            case 'virtual_team_v3_id':
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
    getUserList();
    const { button, columns, title_data } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
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
    userDel({ sid: row.id, delApi: API.deleteDel, loadData: handleDataRefresh });
};

// 获取用户列表
const getUserList = async () => {
    const res = await API.getUserList();
    res.forEach(item => {
        item.username && state.options.username.push({ label: item.username, value: item.username });
        item.email && state.options.email.push({ label: item.email, value: item.email });
        item.mobile && state.options.mobile.push({ label: item.mobile, value: item.mobile });
    });
};

// 状态统计
const statusCount = (key) => {
    return state.fullData.filter(item => item.status === key).length;
};

// 状态过滤
const handleStatusFilter = (key) => {
    if(key === '全部') {
        state.filterConditions.status = null;
    } else {
        state.filterConditions.status = key;
    }
};

// 更新表格数据
const updateFullData = (data) => {
    state.fullData = data;
};
</script>

<template>
    <!-- 主表格部分 -->
    <ops-table
        ref="tableRef"
        :filter-conditions="state.filterConditions"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :request-config="{
            api: API.getList,
            immediate: true
        }"
        :filter-config="{
            remote: false,
            showIcon: false,
        }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
        @update:full-data="updateFullData"
    >
        <!-- 表格插槽 -->
        <template #other_toolbar_buttons>
            <a-badge 
                v-for="(item, key) in STATUS_COLOR" 
                :key="key" 
                :count="statusCount(key)" 
                :overflow-count="Infinity" 
                :number-style="{backgroundColor: item}" 
                size="small"
            >
                <a-button 
                    class="ml-3"
                    style="font-size: 13px;"
                    type="primary"
                    :ghost="!(state.filterConditions.status === key || (key === '全部' && !state.filterConditions.status))"
                    :disabled="!statusCount(key) && key !== '全部'"
                    @click="handleStatusFilter(key)"
                >
                    {{ key }}
                </a-button>
            </a-badge>
        </template>

        <template #status="{ row }">
            <a-tag :color="STATUS_COLOR[row.status]">{{ row.status }}</a-tag>
        </template>

        <template #end_time="{ row }">
            <div>{{ row.end_time }}</div>
            <ops-expired-time :expired-time="row.end_time"></ops-expired-time>
        </template>
    </ops-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        :options="state.options"
        @edit-success="handleDataRefresh"
    />
</template>

<style scoped lang="less">
</style>
