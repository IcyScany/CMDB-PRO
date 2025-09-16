<script setup>
import tableRender from "@/composables/table/tableRender";
import API from "@/api/middleware/elasticSearch";

defineProps({
    row: {
        type: Object,
        required: true
    }
});

const TITLE_LAYER = 2;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
});

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
            case 'virtual_team_v3_id':
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
    const { button, columns, title_data } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
});

</script>

<template>
    <!-- 主表格部分 -->
    <ops-table
        ref="tableRef"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :request-config="{
            api: API.getNodes,
            params: row.id,
            immediate: true
        }"
    >
        <!-- 表格插槽 -->
    </ops-table>
</template>

<style scoped lang="less">
</style>
