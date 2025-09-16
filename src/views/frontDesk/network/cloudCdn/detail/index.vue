<script setup>
import SourceList from "./sourceList.vue";

const props = defineProps({
    open: Boolean,
    rowColumns: Array,
    titleData: Object,
    detailRows: Array,
    searchPolicyId: String,
});
const emit = defineEmits(['update:open']);

const state = reactive({
    activeKey: 'basic',
    expandWidth: 50,
});
const widthMaps = [4, 50, 98];

// 基础信息展示列
const baseInfoColumns = computed(() => {
    const columnsCopy = [...props.rowColumns];
    const cloudSourceIdx = columnsCopy.findIndex(col => col.field === 'cloud_source');
    if (cloudSourceIdx > 0) {
        const [cloudSourceCol] = columnsCopy.splice(cloudSourceIdx, 1);
        columnsCopy.unshift(cloudSourceCol);
    }
    return columnsCopy;
});

// 打开模态框
const handleAfterOpenChange = (val) => {
    if (val) {
        state.activeKey = 'basic';
        state.expandWidth = 50;
    }
};

// 展开卡片
const handleExpandIconClick = () => {
    state.expandWidth = widthMaps[widthMaps.indexOf(state.expandWidth) + 1] || widthMaps[0];
};

// 获取卡片宽度
const getExpandStyle = () => {
    return [
        {
            width: props.detailRows[1] ? state.expandWidth + '%' : '100%',
            show: state.expandWidth !== widthMaps[0]
        },
        {
            width: (100 - state.expandWidth) + '%',
            show: state.expandWidth !== widthMaps[2]
        }
    ];
};

</script>

<template>
    <ops-form-container
        :open="open"
        :title="detailRows?.[0]?.hostname || detailRows?.[0]?.domain"
        :width="detailRows?.length > 1 ? '100%' : '60%'"
        @close="emit('update:open', false)"
        @after-open-change="handleAfterOpenChange"
    >
        <!-- 基础信息 -->
        <a-tabs v-model:activeKey="state.activeKey">
            <a-tab-pane key="basic" tab="基础信息"/>
            <a-tab-pane key="source" tab="源站配置信息"/>
        </a-tabs>
 
        <div v-if="state.activeKey === 'basic'" class="flex gap-2">
            <a-card       
                v-for="(data, index) in detailRows"
                :key="index"
            >
                <ops-descriptions
                    :data="data"
                    :columns="baseInfoColumns"
                    :column="1"
                    :title-data="titleData"
                >
                    <template #https_status="{ row }">
                        <vxe-tag :class="row.https_status !== 0 ? 'theme--primary' : 'theme--error'" size="small">
                            {{ row.https_status !== 0 ? '已开启' : '未启用' }}
                        </vxe-tag>
                    </template>

                    <template #domain_name="{ row }">
                        {{ row.domain_name }}            
                    </template>

                    <template #domain_status="{ row }">
                        <vxe-tag :class="row.domain_status === '已开启' ? 'theme--primary' : 'theme--error'" size="small">
                            {{ row.domain_status}}
                        </vxe-tag>
                    </template>

                    <template #cloud_master_account_id="{row}">
                        {{ titleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
                    </template>
                </ops-descriptions>
            </a-card>
        </div>
 
        <div v-if="state.activeKey === 'source'" class="flex gap-2">
            <a-card 
                v-for="(row, index) in detailRows" 
                :key="index"
                :style="{ 
                    width: getExpandStyle()[index]?.width,
                }"
            >
                <div 
                    v-if="detailRows[1] && index === 0" 
                    class="expand-icon" 
                    @click="handleExpandIconClick"
                >
                    <span v-if="getExpandStyle()[1].show">
                        展开 <DoubleRightOutlined/>
                    </span>
                    <span v-else>
                        收起 <DoubleLeftOutlined/>
                    </span>
                </div>

                <template v-if="getExpandStyle()[index]?.show">
                    <div class="flex items-center font-[500] mb-2">
                        <CloudTypeIcon :type="row?.cloud_source" style="width: none; margin-right: 10px;"/>
                        {{ row?.cloud_source }}
                    </div>
    
                    <source-list
                        :row-data="row"
                        :init-title-data="titleData?.sources"
                    />
                </template>
            </a-card>
        </div>
    </ops-form-container>
</template>

<style lang="scss" scoped>
:deep(.ant-card-body) {
    padding: 10px 24px !important;
}

.expand-icon {
    position: absolute;
    top: 4px;
    right: 2px;
    font-size: 14px;
    z-index: 100;
    color: var(--primary-color);
    cursor: pointer;
}

</style>
