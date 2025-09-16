<script setup>
const props = defineProps({
    ruleData: Object,
    open: Boolean,
    initColumn: Array,
});

const emit = defineEmits(['update:open']);

const tableRef = ref(null);
const CONFIG = {
    BLOCK: 2,
};

const state = reactive({
    data: [],
});

const tableColumns = computed(() => {
    let columns = props.initColumn.filter(item => item.oriTitle.block === CONFIG.BLOCK);
    for (let col of columns) {
        let { field }  = col;
        switch (field) {
            case '':
                col.slots = {
                    default: field
                };
                break;
        }
    }
    return {
        columns: columns,
    };
});

const handleAfterOpenChange = (val) => {
    if (val) {
        state.data = props.ruleData;
        tableRef.value.commitRequest();
    } else {
        state.data = [];
        tableRef.value.commitRequest();
    }
};

</script>

<template>
    <ops-form-container
        :open="open"
        :title="`近30天触发次数：${props.ruleData?.modelTitle || ''}`"
        width="60%"
        :z-index="100000"
        @close="emit('update:open', false)"
        @after-open-change="handleAfterOpenChange"
    >
        <ops-table
            ref="tableRef"
            :data="state.data || []"
            :columns="tableColumns.columns"
        >
            <!-- 表格插槽 -->
        </ops-table>
    </ops-form-container>
</template>
