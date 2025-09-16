<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/hardWareApi";
import subPage from "@/composables/subPage";
import InterfaceRoutes from './InterfaceRoutes.vue';

const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    subPageColumns: [],
    titleFieldSearch: [],
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 自定义tab
const customTabs = [
    {
        key: 'interfaces',
        title: '端口信息',
        isCustomTab: true,
    },
    {
        key: 'routes',
        title: '路由信息',
        isCustomTab: true,
    },
];

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'passwd':
            case 'status':
            case 'port_route':
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
    const actionFields = ['edit', 'add', 'del', 'copy_pwd'];
    return state.initButton.reduce((acc, btn) => {
        if (actionFields.includes(btn.field)) {
            acc[btn.field] = btn;
        }
        return acc;
    }, {});
});
// 数据的获取
const handleQueryData = async () => {
    tableRef.value?.serverTableRef && tableRef.value.serverTableRef.commitProxy('query');
};

onMounted(async () => {
    const { button, columns, title_data, order, sub_page_columns, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || {};
    state.tableOrder = order.value ?  order.value : {};
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search.value || [];
    await nextTick();
    await handleQueryData();
});

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: API.del, loadData: handleQueryData });
};
// IP模糊搜索验证函数
const isIpLike = (value) => {
    // 匹配IP格式的数字和点
    return /^[0-9.]+$/.test(value);
};
// 默认搜索字段配置
const defaultSearchField = computed(() => ({
    fields: [
        {
            field: 'management_ip',
            operator: 'vague',
            field_name: '管理IP',
            validate: isIpLike
        },
        {
            field: 'description',
            operator: 'vague',
            field_name: '描述',
            validate: (value) => !isIpLike(value)  // 描述
        }
    ],

    placeholder: '直接输入管理IP、描述'  // 添加自定义提示文本
}));

// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();


const activeTab = ref('interfaces');
let subPageRef = ref(null);
let selectInterface = ref({});

const handleClearSelectInterface = (data) => {
    selectInterface.value = data;
};

watch(subPageOpen, () => {
    selectInterface.value = {};
});

// 子页面tab切换
const handleSubPageTabChange = (key, row) => {
    subPageRef.value.handleTabChange?.(key);
    handleClearSelectInterface(row);
};

</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :auth-btn="canUserAction"
        :table-column="initTableColumns"
        :query-api="API.postList"
        :order="state.tableOrder"
        :is-show-doc="true"
        :title-field-search="state.titleFieldSearch"
        :default-search-field="defaultSearchField"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{ row }">
            <a-tooltip placement="topLeft">
                <template #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.uuid }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>

        <template #passwd="{row}">
            {{ row.username }} <br/>
            <OpsCopyContent v-if="canUserAction.copy_pwd" type="password"  :api-copy="{
                    copyApi: API.getCopyPwd,
                    copyParams: {
                        sid: row.id
                    }
                }" />
        </template>
        <template #status="{ row }">
           <a-tooltip>
            <template #title>
                {{ state.initTitleData?.status?.find(item => item.sta == row.status)?.description || '' }}
            </template>
                <vxe-tag :class="row.status == '已上线' ? 'theme--success' : row.status == '下线' ? 'theme--error' : ''" size="small">
                    {{ row.status }}
                </vxe-tag>
           </a-tooltip>
        </template>

        <template #port_route="{ row }">
            <span class="text-primary cursor-pointer" @click="handleSubPageOpen(row)">点击查看</span>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row?.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>
    </server-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleQueryData"
    />

    <ops-sub-page
        ref="subPageRef"
        v-model:open="subPageOpen"
        v-model:active-tab="activeTab"
        :title="`NO.${subPageRow?.id} ${subPageRow?.hostname}`"
        width="100%"
        :basic-config="{
            columns: state.subPageColumns,
            api: API.getDetail,
            sid: subPageRow?.id,
        }"
        :custom-tabs="customTabs"

        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
   
        <template v-for="tab in customTabs" :key="tab.key" #[tab.key] >
            <div v-if="subPageOpen && activeTab === tab.key" class="custom-tabs">
                <InterfaceRoutes :type="tab.key" :sid="subPageRow?.id" :select-interface="selectInterface"  :active-tab="activeTab" :sub-row="subPageRow || {}"  @tab-change="handleSubPageTabChange" @clear-select-interface="handleClearSelectInterface"/>
            </div>
         </template>


        <template #status="{ row }">
            <vxe-tag :class="row.status == '已上线' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.status }}
            </vxe-tag>
        </template>
        <template #passwd="{row}">
            <OpsCopyContent v-if="canUserAction.copy_pwd" type="password"  :api-copy="{
                    copyApi: API.getCopyPwd,
                    copyParams: {
                        sid: row.id
                    }
                }" />
            <span v-else>{{ row.passwd }}</span>
        </template>
      

        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
.copy-text {
    color:white; 
    font-size: 12px;
    margin-bottom: 0 !important;
}

.custom-tabs {
    height: calc(100vh - 220px);
}
</style>
