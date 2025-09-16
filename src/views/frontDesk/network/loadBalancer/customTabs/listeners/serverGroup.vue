<script setup>
const props = defineProps({
    open: Boolean,
    initColumn: Array,
    groupData: Array,
});

const emit = defineEmits(['update:open']);

const tableRef = ref(null);
const CONFIG = {
    BLOCK: 3,
};

const state = reactive({
    data: [],
});

const tableColumns = computed(() => {
    let columns = props.initColumn.filter(item => item.oriTitle.block === CONFIG.BLOCK);
    for (let col of columns) {
        let { field }  = col;
        switch (field) {
            case 'listeners':
            case 'members':
            case 'load_balancers':
            case 'health_check_config':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                break;
        }
    }
    return columns;
});

const handleAfterOpenChange = async (val) => {
    if (val) {
        state.data = props.groupData || [];
    } else {
        state.data = [];
    }
    tableRef.value.commitRequest();
};

</script>

<template>
    <ops-form-container
        :open="open"
        :title="`后端服务器组`"
        width="60%"
        @close="emit('update:open', false)"
        @after-open-change="handleAfterOpenChange"
    >
        <ops-table
            ref="tableRef"
            :data="state.data || []"
            :columns="tableColumns"
        >
            <!-- 表格插槽 -->
            <template #id="{row}">
                <div class="truncate text-primary">{{ row.name }}</div>
                <div class="truncate">{{ row.id }}</div>
            </template>

            <template #listeners="{row}">
                <a-tooltip v-for="item in row.listeners" :key="item.id" :title="item.id">
                    <div class="truncate">{{ item.id }}</div>
                </a-tooltip>
            </template>

            <template #members="{row}">
                <a-tooltip v-for="item in row.members" :key="item.id" :title="item.id">
                    <div class="truncate">{{ item.id }}</div>
                </a-tooltip>
            </template>

            <template #load_balancers="{row}">
                <a-tooltip v-for="item in row.load_balancers" :key="item.id" :title="item.id">
                    <div class="truncate">{{ item.id }}</div>
                </a-tooltip>
            </template>

            <template #health_check_config="{row}">
                <a-tooltip v-for="item in row.health_check_config" :key="item.id" class="truncate">
                    <div class="truncate">{{ item.id }}</div>
                </a-tooltip>
            </template>
        </ops-table>
    </ops-form-container>
</template>
