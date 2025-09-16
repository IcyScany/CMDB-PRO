<script setup>
import API from "@/api/server/cloudObs";

const props = defineProps({
    modalRow: { 
        type: Object, 
        default: () => ({}), 
    },
    columns: {
        type: Array,
        default: () => [],
    },
    type: {
        type: String,
        default: '',
    },
});

const { modalRow } = toRefs(props);

const TITLE_BLOCKS = {
    policy: 2,
    cors: 3,
    lifecycle: 4,
};
const transitionMap = {
    'STANDARD': '标准存储',
    'WARM': '低频访问存储',
    'COLD': '归档存储',
    'DEEP_COLD': '深度归档存储(受限公测)',
};
const tableRef = ref(null);
const state = reactive({
    data: [],
});

// 表格列
const tableColumns = computed(() => {
    const columns = props.columns.filter(col => col.oriTitle.block === TITLE_BLOCKS[props.type]);
    for (let col of columns) {
        let { field }  = col;
        switch (field) {
            case 'Resource':
            case 'Principal':
            case 'expiration':
            case 'transition':
            case 'allowedOrigin':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                break;  
        }
    }
    return columns;
});

// 获取数据
const getData = async () => {
    tableRef.value.tableLoading = true;
    const res = await API.getInfo[props.type](modalRow.value.id);
    state.data = res.Statement || res;
    tableRef.value.commitRequest();
    tableRef.value.tableLoading = false;
};

onMounted(() => {
    getData();
});

</script>

<template>
    <ops-table
        ref="tableRef"
        :data="state.data"
        :columns="tableColumns"
        @refresh="getData"
    >
        <!-- 表格插槽 -->
        <template #Resource="{ row }">
            <div v-for="item in row.Resource" :key="item">
                {{ item }}
            </div>
        </template>

        <template #Principal="{ row }">
            <div v-for="item in Object.values(row.Resource)" :key="item">
                {{ item }}
            </div>
        </template>

        <template #expiration="{ row }">
            {{ row?.expiration?.days }}
        </template>

        <template #transition="{ row }">
            <div v-for="item in row?.transition" :key="item">
                <span class="text-18">·</span>
                转换为{{ transitionMap[item.storageClass] }}: {{ item.days }}天
            </div>
        </template>

        <template #allowedOrigin="{ row }">
            <div v-for="item in row?.allowedOrigin" :key="item">
                {{ item }}
            </div>
        </template>
    </ops-table>
</template>
