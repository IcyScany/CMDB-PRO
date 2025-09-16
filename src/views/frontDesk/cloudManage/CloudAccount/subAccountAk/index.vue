<script setup>
import tableRender from "@/composables/table/tableRender";
import { subAccountAkApi } from "@/api/cloudManage/cloudAccountApi";

const props = defineProps({
    sid: {
        type: Number,
        default: 0
    },
    showAkPage: {
        type: Boolean,
        default: false
    },
});

const { sid, showAkPage } = toRefs(props);
const emit = defineEmits(['update:showAkPage', 'accountSubPageOpen']);

const TITLE_LAYER = 3;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: {},
    subPageColumns: [],
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'user_id':
                col.slots = {
                    default: field
                };
                break; 
        }
    }
    return state.initColumn;
});

onMounted(async () => {
    const { button, columns, title_data, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || {};
    state.subPageColumns = sub_page_columns || [];
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.commitRequest();
    }
};

const handleBack = () => {
    emit('update:showAkPage', false);
};

watch(showAkPage, (newVal) => {
    if (newVal) {
        handleDataRefresh();
    }
});

</script>

<template>
    <!-- 主表格部分 -->
    <ops-table
        v-if="showAkPage"
        ref="tableRef"
        :columns="initTableColumns"
        :request-config="{
            api: () => subAccountAkApi.getList(sid),
            immediate: true
        }"
    >
        <!-- 表格插槽 -->
        <template #other_toolbar_buttons>
            <a-button type="primary" @click="handleBack">返回</a-button>
            <span class="ml-2">当前页面：子账号AK</span>
        </template>

        <template #cloud_master_account_id="{row}">
            <div style="display: flex; align-items: center;">
                <CloudTypeIcon :type="row.cloud_source"/>
            </div>
            {{ state.initTitleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>

        <template #user_id="{row}">
            <span class="cursor-pointer text-primary" @click="emit('accountSubPageOpen', row.user_id)">{{ row.user_id }}</span>
        </template>
    </ops-table>
</template>

<style scoped lang="less">
</style>
