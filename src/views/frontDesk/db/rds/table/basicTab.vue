<script setup>
import { defaultConfig } from '@/components/OpsTable/opsTable.js';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({}),
    },
    columns: {
        type: Array,
        default: () => [],
    },
    titleData: {
        type: Object,
        default: () => ({}),
    },
});

const blockList = [
    { title: '基础信息', block: 1, columns: [] },
    { title: '规格配置', block: 6, columns: [] },
    { title: '连接信息', block: 2, columns: [] },
    { title: '网络信息', block: 3, columns: [] },
    { title: '付费信息', block: 4, columns: [] },
    { title: '节点信息', block: 5, columns: [] },
];

const tabData = computed(() => {
    return {
        ...props.data,
        ...props.data?.cloud_specific,
    };
});

const setColumns = () => {
    blockList.forEach(item => {
        item.columns = props.columns.filter(col => {
            if (col?.oriTitle?.block !== 10) {
                // 只展示接口返回的对应字段
                let fields = Object.keys(tabData.value);
                return col?.oriTitle?.block === item.block && fields.includes(col?.field);
            }
        });
    });
};

const gridOptions = computed(() => ({
    id: `rdsNodes`,
    ...defaultConfig,
    columns: props.columns.filter(col => col?.oriTitle?.block === 10),
    maxHeight: '500px',
}));

watch(() => props.data, () => {
    setColumns();
});

</script>

<template>
    <div v-for="item in blockList" :key="item.title" class="mb-4">
        <a-typography-title :level="5">
            <span class="ml-4">{{ item.title }}</span>
        </a-typography-title>

        <a-card :style="{borderColor: '#cccccc'}">
            <a-skeleton v-if="item.columns.length === 0" />
            <ops-descriptions
                v-if="item.title !== '节点信息'"
                :data="tabData"
                :columns="item.columns"
                :column="2"
                :label-style="{
                    width: '200px',
                    marginRight: '10px',
                    color: '#868686'
                }"
                size="small"
            >
                <template #addresses="{ row }">
                    <div 
                        v-for="address in row.addresses" 
                        :key="address.id" 
                    >
                        <a-tooltip :overlay-style="{ fontSize: '12px', maxWidth: '400px' }">
                            <template #title>
                                <div>{{ address.address }}:{{ address.port }}</div>
                            </template>

                            <a-typography-paragraph :copyable="{ tooltip: false }" style="max-width: calc(100% - 40px);" class="inline-block">
                                <vxe-tag class="theme--primary" size="small">
                                    <span class="truncate inline-block">
                                        {{ address.address }}:{{ address.port }}
                                    </span>
                                </vxe-tag>
                            </a-typography-paragraph>
                        </a-tooltip>
                    </div>
                </template>

                <template #status="{ row }">
                    <vxe-tag :class="row.status == '运行中' ? 'theme--primary' : 'theme--error'" size="small">
                        {{ row.status }}
                    </vxe-tag>
                </template>

                <template #cloud_master_account_id="{row}">
                    {{ titleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
                </template>

                <template #expire_time="{row}">
                    <ops-expired-time :expired-time="row.expire_time" :sub-page="true"/>
                </template>

                <template #region_id="{row}">
                    <div>{{titleData?.region_id ? titleData?.region_id?.[row?.region_id] || row?.region_id : row?.region_id}}</div>
                </template>
            </ops-descriptions>

            <vxe-grid
                v-else
                :data="tabData?.nodes"
                v-bind="gridOptions"
            />
        </a-card>
    </div>
</template>

<style scoped lang="less">
:deep(.vxe-tag--content) {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
}

.mb-2 {
    &:last-child {
        margin-bottom: 0;
    }
}
</style>
