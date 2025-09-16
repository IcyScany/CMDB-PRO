<script setup>
import tableRender from "@/composables/table/tableRender";
import API from "@/api/network/vpcRouteApi";

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    routeRow: {
        type: Object,
        default: () => ({})
    },
    infoColumns: {
        type: Array,
        default: () => []
    },
    titleData: {
        type: Object,
        default: () => ({})
    }
});

const { show, routeRow } = toRefs(props);
const emit = defineEmits(['update:show']);
const TITLE_LAYER = 2;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    tableData: [],
    routeTableType: {},
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'route_table_type':
                col.slots = {
                    default: field
                };
                break;  
        }
    }
    return state.initColumn;
});

onMounted(async () => {
    const { button, columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
});

// 表格数据的获取
const handleDataRefresh = async () => {
    const { data, route_table_type } = await API.getSubnetsList(routeRow.value?.route_id);
    state.tableData = data;
    state.routeTableType = route_table_type;

    tableRef.value.commitRequest();
};

const computedInfoColumns = computed(() => {
    return props.infoColumns.filter(col => col.field !== 'subnets');
});

const handleBack = () => {
    emit('update:show', false);
};

watch(show, (newVal) => {
    if (newVal) {
        handleDataRefresh();
    }
});

</script>

<template>
    <div v-if="show">
        <a-button type="primary" class="mt-2" @click="handleBack">返回</a-button>

        <a-card style="margin-top: 10px;">
            <ops-descriptions 
                :title="null"
                :data="routeRow"
                :columns="computedInfoColumns"
                :column="2"
                size="small"
            >
                <template #default="{ row }">
                    <vxe-tag :class="row.default ? 'theme--primary' : 'theme--error'" size="small">
                        {{ row.default ? '是' : '否' }}
                    </vxe-tag>
                </template>

                <template #region_id="{ row }">
                    {{ titleData?.['region_id']?.[row.region_id] || row.region_id }}
                </template>
            </ops-descriptions>
        </a-card>

        <!-- 主表格部分 -->
        <ops-table
            ref="tableRef"
            :data="state.tableData"
            :columns="initTableColumns"
        >
            <template #route_table_type="{ row }">
                <span>
                    {{ state.routeTableType?.[row.route_table_type] || row.route_table_type }}
                </span>
            </template>
        </ops-table>
    </div>
</template>

<style scoped lang="less">
</style>
