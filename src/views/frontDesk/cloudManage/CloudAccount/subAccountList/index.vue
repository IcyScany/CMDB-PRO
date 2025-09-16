<script setup>
import tableRender from "@/composables/table/tableRender";
import { subAccountApi } from "@/api/cloudManage/cloudAccountApi";
import subPage from "@/composables/subPage";

const props = defineProps({
    sid: {
        type: Number,
        default: 0
    },
    showSubAccount: {
        type: Boolean,
        default: false
    },
    subPageUserId: {
        type: String,
        default: ''
    },
});

const { sid, showSubAccount, subPageUserId } = toRefs(props);
const emit = defineEmits(['update:showSubAccount', 'update:subPageUserId']);

const TITLE_LAYER = 2;

// 状态管理
const tableRef = ref(null);
const akTableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: {},
    subPageColumns: [],
    subPageData: [],
});

// 表格的列
const initTableColumns = computed(() => {
    const slotFields = ['pwd_status', 'cloud_master_account_id', 'status', 'id', 'name'];
    return state.initColumn.map(col => {
        if (slotFields.includes(col.field)) {
            return {
                ...col,
                slots: { default: col.field },
                showOverflow: false,
            };
        }
        return col;
    });
});

onMounted(async () => {
    const { button, columns, title_data, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || {};
    state.subPageColumns = sub_page_columns || [];
});

// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.commitRequest();
        if (akTableRef.value) {
            await akTableRef.value.commitRequest();
        }
    }
};

const handleBack = () => {
    emit('update:showSubAccount', false);
};

const handleGetSubPageData = (data) => {
    state.subPageData = data;
};

watch(showSubAccount, (newVal) => {
    if (newVal) {
        handleDataRefresh();
    }
});

watch(subPageUserId, (val) => {
    if (val) {
        handleSubPageOpen({ id: val });
    }
});

watch(subPageOpen, (val) => {
    if (!val) {
        emit('update:subPageUserId', null);
    }
});
</script>

<template>
    <!-- 主表格部分 -->
    <ops-table
        v-if="showSubAccount"
        ref="tableRef"
        :columns="initTableColumns"
        :request-config="{
            api: () => subAccountApi.getList(sid),
            immediate: true
        }"
    >
        <!-- 表格插槽 -->
        <template #other_toolbar_buttons>
            <a-button type="primary" @click="handleBack">返回</a-button>
            <span class="ml-2">当前页面：子账号列表</span>
        </template>

        <template #id="{ row }">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
        </template>

        <template #name="{ row }">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.name }}</span>
        </template>

        <template #pwd_status="{ row }">
            <vxe-tag :class="row.pwd_status == 1 ? 'theme--error' : 'theme--primary'" size="small">
                {{ row.pwd_status == 1 ? '需要修改密码' : '正常' }}
            </vxe-tag>
        </template>

        <template #status="{ row }">
            <vxe-tag :class="row.status == 'active' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.status }}
            </vxe-tag>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>
    </ops-table>

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        :title="`账号：${state.subPageData?.name}`"
        :basic-config="{
            title: '账号信息',
            api: subAccountApi.getDetail,
            customParams: {
                sid: sid,
                id: subPageRow?.id,
            },
            columns: state.subPageColumns.filter(col => col.oriTitle.block === 1)
        }"
        :custom-tabs="[{
            key: 'sub_account_ak',
            title: '子账号AK',
            isCustomTab: true,
            columns: state.subPageColumns.filter(col => col.oriTitle.block === 2)
        }]"
        @get-sub-page-data="handleGetSubPageData"
    >
        <template #status="{ row }">
            <vxe-tag :class="row.status == 'active' ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.status }}
            </vxe-tag>
        </template>

        <template #cloud_master_account_id="{row}">
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #sub_account_ak="{data}">
            <div class="custom-tabs">
                <ops-table
                    ref="akTableRef"
                    :columns="state.subPageColumns.filter(col => col.oriTitle.block === 2)"
                    :data="data?.user_sk"
                />
            </div> 
        </template>
    </ops-sub-page>
</template>

<style scoped lang="less">
.custom-tabs {
    height: calc(100vh - 180px);
}
</style>
