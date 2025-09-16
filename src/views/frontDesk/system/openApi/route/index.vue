<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/system/openapi";

const TITLE_LAYER = 2;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    allData: [],
    data: [],
    selectedMenu: [],
    menuList: [],
    initColumn: [],
    initButton: [],
    initTitleData: [],
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case '':
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
    const { button, columns, title_data } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];

    await handleDataRefresh();
});

const getData = async() => {
    await API.getRouteList().then(res => {
        state.allData = Object.values(res).flat();
        state.data = Object.values(res).flat();
        state.menuList = Object.keys(res);
    });
};

// 表格数据的获取
const handleDataRefresh = async () => {
    await getData();
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
    userDel({ sid: row.id, delApi: API.delUser, loadData: handleDataRefresh });
};

const spanMethod = ({ row, rowIndex, column, visibleData }) => {
    const spanFields = ['menus'];
    const cellValue = row[column.field];
    if (cellValue && spanFields.includes(column.field)) {
        const prevRow = visibleData[rowIndex - 1];
        let nextRow = visibleData[rowIndex + 1];
        if (prevRow && prevRow[column.field] === cellValue) {
            return { rowspan: 0, colspan: 0 };
        } else {
            let countRowspan = 1;
            while (nextRow && nextRow[column.field] === cellValue) {
                nextRow = visibleData[++countRowspan + rowIndex];
            }
            if (countRowspan > 1) {
                return { rowspan: countRowspan, colspan: 1 };
            }
        }
    }
};

const clickMenu = async (menu) => {
    const index = state.selectedMenu.indexOf(menu);

    if(index === -1) {
        state.selectedMenu.push(menu);
    } else {
        state.selectedMenu.splice(index, 1);
    }

    if(state.selectedMenu.length) {
        state.data = state.allData.filter(item => {
            return state.selectedMenu.includes(item.menus);
        });
    } else {
        state.data = state.allData;
    }

    await tableRef.value.commitRequest();
};
</script>

<template>
    <!-- 主表格部分 -->
    <ops-table
        ref="tableRef"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :data="state.data"
        :span-method="spanMethod"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #other_toolbar_buttons>
            <span class="ml-5"><b>菜单<i class="vxe-icon-funnel"></i></b></span>
            <vxe-button 
                v-for="(menu, index) in state.menuList" 
                :key="index"
                :status="state.selectedMenu.includes(menu) ? 'primary': ''" 
                size="mini"
                class="ml-2"
                @click="clickMenu(menu)"
            >
                {{ menu }}
            </vxe-button>
        </template>
    </ops-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />
</template>

<style scoped lang="less">
</style>
