<script setup>
const props = defineProps({
    open: Boolean,
    initColumn: Array,
    ipgroupData: Array,
    initTitleData: Object,
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
    let columns = props.initColumn.filter(item => item.oriTitle.block === CONFIG.BLOCK && ['address', 'description'].includes(item.field));
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
    return columns;
});

const descColumns = computed(() => {
    return props.initColumn.filter(item => item.oriTitle.block === CONFIG.BLOCK && !['address', 'description'].includes(item.field));
});

const handleAfterOpenChange = async (val) => {
    if (val) {
        state.data = props.ipgroupData.map(item => item.addresses).flat() || [];
    } else {
        state.data = [];
    }
    tableRef.value.commitRequest();
};

</script>

<template>
    <ops-form-container
        :open="open"
        :title="`IP组`"
        width="60%"
        @close="emit('update:open', false)"
        @after-open-change="handleAfterOpenChange"
    >
        <ops-descriptions
            :data="props.ipgroupData[0] || {}"
            :columns="descColumns"
            :column="2"
        >
            <template #enterprise_project_id="{row}">
                {{ props.initTitleData?.enterprise_project_id?.[row.source_data.enterprise_project_id] }}
            </template>

            <template #created_at="{row}">
                {{ row.source_data.created_at }}
            </template>

            <template #description2="{row}">
                {{ row.description }}
            </template>
        </ops-descriptions>

        <ops-table
            ref="tableRef"
            :data="state.data || []"
            :columns="tableColumns"
        >
            <!-- 表格插槽 -->
        </ops-table>
    </ops-form-container>
</template>
