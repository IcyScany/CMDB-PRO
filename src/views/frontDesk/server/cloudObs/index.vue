<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import API from "@/api/server/cloudObs";
import subPage from "@/composables/subPage";
import Edit from "@/views/frontDesk/server/cloudObs/edit.vue";
import InfoModal from "@/views/frontDesk/server/cloudObs/infoModal.vue";
import AppTable from "@/views/frontDesk/server/cloudObs/app/table.vue";

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
    hasAppList: [],
    modalConfig: {
        open: false,
        row: {},
        columns: [],
        type: '',
    },
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 子页面
const { subPageOpen, subPageRow, handleSubPageOpen } = subPage();

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'epid':
            case 'size':
            case 'object_number':
            case 'policy':
            case 'cors':
            case 'domain':
            case 'region_id':
            case 'lifecycle':
            case 'cloud_master_account_id':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                break;  
            case 'bucket':
                col.slots = {
                    default: field
                };
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
    const { button, columns, title_data, order, sub_page_columns, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value.filter(col => col.oriTitle.block == 1) || [];
    state.modalConfig.columns = columns.value.filter(col => col.oriTitle.block != 1) || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.tableOrder = order.value || {};
    state.subPageColumns = sub_page_columns || [];
    state.titleFieldSearch = title_field_search.value || [];

    // 获取有应用列表的数据
    tableRef.value.gridOption.proxyConfig.ajax.querySuccess = ({ response }) => {
        state.hasAppList = response?.app_list;
    };

    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.serverTableRef.commitProxy('query');
    }
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: API.del, loadData: handleDataRefresh });
};

// 打开策略编辑页面
const handleModalOpen = (row, type) => {
    state.modalConfig.open = true;
    state.modalConfig.row = row;
    state.modalConfig.type = type;
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num) => {
    if (num < 10000) {
        return num.toString();
    } else if (num < 100000000) {
        return (num / 10000) + '万';
    } else {
        return (num / 100000000) + '亿';
    }
};

</script>

<template>
    <!-- 主表格部分 -->
    <server-table
        ref="tableRef"
        :table-column="initTableColumns"
        :auth-btn="canUserAction"
        :order="state.tableOrder"
        :query-api="API.getList"
        :title-field-search="state.titleFieldSearch"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <a-tooltip placement="topLeft" :overlay-style="{ maxWidth: '400px' }">
                <template v-if="row.epid" #title>             
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="tooltip-text">{{ row.epid }}</a-typography-paragraph>
                    <div v-if="state.hasAppList.includes(row.id)">
                        应用列表<SearchOutlined />
                    </div>
                </template>
                <div class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">
                    {{ row.id }}
                    <SearchOutlined v-if="state.hasAppList.includes(row.id)"/>
                </div>
            </a-tooltip>
        </template>

        <template #bucket="{row}">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">
                {{ row.bucket }}
            </span>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #domain="{row}">
            <a-tooltip v-for="item in row.domain" :key="item" :title="item">
                <div class="mb-1">
                    <vxe-tag class="theme--primary" size="small">
                        <span class="truncate inline-block">
                            {{ item }}
                        </span>
                    </vxe-tag>
                </div>
            </a-tooltip>
        </template>

        <template #policy="{row}">
            <span 
                class="cursor-pointer"
                :class="row.policy === '私有桶' ? 'text-primary' : 'text-warning'"
                @click="handleModalOpen(row, 'policy')"
            >
                {{ row.policy }}
            </span>
        </template>

        <template #cors="{row}">
            <a-button size="small" type="link" @click="handleModalOpen(row, 'cors')">
                查看
            </a-button>
        </template>

        <template #lifecycle="{row}">
            <a-button size="small" type="link" @click="handleModalOpen(row, 'lifecycle')">
                查看
            </a-button>
        </template>

        <template #region_id="{row}">
            <ops-region :row="row" :title-data="state.initTitleData"/>
        </template>

        <template #epid="{row}">
            {{ state.initTitleData?.epid?.[row.epid] || row.epid }}
        </template>

        <template #size="{row}">
            {{ formatBytes(row.size) }}
        </template>

        <template #object_number="{row}">
            {{ formatNumber(row.object_number) }}
        </template>
    </server-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.bucket"
        :basic-config="{
            columns: state.subPageColumns,
            api: API.getDetail,
            sid: subPageRow?.id,
        }"
        :custom-tabs="[{
            title: '应用列表',
            key: 'app',
            isCustomTab: true
        }]"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #domain="{row}">
            <a-tooltip v-for="item in row.domain" :key="item" :title="item">
                <div class="mb-2">
                    <vxe-tag class="theme--primary" size="small">
                        <span class="truncate inline-block">
                            {{ item }}
                        </span>
                    </vxe-tag>
                </div>
            </a-tooltip>
        </template>

        <template #size="{row}">
            {{ formatBytes(row.size) }}
        </template>

        <template #object_number="{row}">
            {{ formatNumber(row.object_number) }}
        </template>

        <template #policy="{row}">
            <span 
                class="cursor-pointer"
                :class="row.policy === '私有桶' ? 'text-primary' : 'text-warning'"
                @click="handleModalOpen(row, 'policy')"
            >
                {{ row.policy }}
            </span>
        </template>

        <template #cors="{row}">
            <a-button size="small" type="link" @click="handleModalOpen(row, 'cors')">
                查看
            </a-button>
        </template>

        <template #lifecycle="{row}">
            <a-button size="small" type="link" @click="handleModalOpen(row, 'lifecycle')">
                查看
            </a-button>
        </template>

        <template #app>
            <div class="custom-tabs">
                <app-table :sid="subPageRow?.id"/>
            </div>
        </template>
    </ops-sub-page>

    <!-- 策略组件 -->
    <ops-form-container
        v-model:open="state.modalConfig.open"
        :title="`${state.initColumn.find(col => col.field === state.modalConfig.type)?.title} - ${state.modalConfig.row?.bucket}`"
        :z-index="100000"
    >
        <info-modal
            v-if="state.modalConfig.open"
            :modal-row="state.modalConfig.row" 
            :columns="state.modalConfig.columns" 
            :type="state.modalConfig.type"
        />
    </ops-form-container>
</template>

<style scoped lang="less">
:deep(.vxe-tag--content) {
    display: inline-flex;
    align-items: center;
    max-width: 90%;
}

.mb-1 {
    &:last-child {
        margin-bottom: 0;
    }
}

.custom-tabs {
    height: calc(100vh - 220px);
}
</style>
