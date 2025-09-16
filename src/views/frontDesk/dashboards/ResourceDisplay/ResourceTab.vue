<script setup>
import resourceDisplayApi from '@/api/dashboards/resourceDisplayApi';
import ResourceDetail from './ResourceDetail.vue';
import ResourceSummary from './ResourceSummary.vue';
import { mergeBusinessData } from './utils/formatters';
import commonApi from '@/api/common';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
let { getCloudRegionList } = commonApi;

const activeTab = ref('summary'); // 默认显示汇总视图
const pageResourceData = ref([]); // 页面资源数据
const selectedBusinesses = ref(['all']); // 默认选择全部
const businessList = ref([]); // 业态列表
let   cloudRegionList = ref({}); // 云区域列表

// 计算选中的业态数据
const selectedResourceData = computed(() => {
    if (selectedBusinesses.value.includes('all')) {
        return pageResourceData.value;
    }
    return pageResourceData.value.filter(item => 
        selectedBusinesses.value.includes(item.business)
    );
});

// 计算合并后的资源数据（仅用于汇总视图）
const mergedResourceData = computed(() => {
    return mergeBusinessData(selectedResourceData.value);
});

// 处理业态选择变化
const handleBusinessChange = (values) => {
    selectedBusinesses.value = values;
    let allIdx = values.indexOf('all');
    // 处理"全部"选项的逻辑
    if (allIdx > -1) { // 如果选择了"全部"
        if (values.length > 1) {
            // 去除"全部"选项，保留其他选项
            selectedBusinesses.value = values.filter(item => item !== 'all');
        } else {
            selectedBusinesses.value = ['all'];
        }
    } else if (values.length === 0) {
        // 如果没有选择任何项，默认选择"全部"
        selectedBusinesses.value = ['all'];
    } else {
        selectedBusinesses.value = values;
    }
};
// 初始化数据
onMounted(async () => {
    try {
        const response = await resourceDisplayApi.postMessage({
            business_id: [],
            virtual_team_v3_id: null,
        });
        pageResourceData.value = response;
        businessList.value = response.map(item => ({
            business: item.business
        }));
        

        // 获取云区域列表
        cloudRegionList.value  = await getCloudRegionList();
    } catch (error) {
        console.error('Failed to fetch resource data:', error);
    }
});

// 提供给子组件的数据
provide('resourceData', computed(() => pageResourceData.value.length > 1 ? activeTab.value === 'summary' ? mergedResourceData : pageResourceData : pageResourceData));
provide('selectedBusinesses', selectedBusinesses); // 提供选中的业态列表
provide('cloudRegionList', cloudRegionList); // 提供云区域列表
provide('pageResourceData', pageResourceData); // 提供页面资源数据
</script>

<template>
    <div class="resource-tab">
        <!-- 多业态视图 -->
        <template v-if="pageResourceData.length > 1">
            <a-tabs v-model:activeKey="activeTab" destroy-inactive-tab-pane>
                <template #rightExtra>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <a-select
                            v-model:value="selectedBusinesses"
                            style="min-width: 400px"
                            placeholder="请选择业态"
                            mode="multiple"
                            allow-clear
                            show-search
                            option-filter-prop="label"
                            @change="handleBusinessChange"
                        >
                            <a-select-option value="all" label="全部业态">全部业态</a-select-option>
                            <a-select-option 
                                v-for="item in businessList" 
                                :key="item.business" 
                                :value="item.business"
                                :label="item.business"
                            >
                                {{ item.business }}
                            </a-select-option>
                        </a-select>
                        <a-tooltip  placement="bottom">
                            <template #title>
                                <div>
                                    <p>业态搜索说明：</p>
                                    <p>1. 选择需要查看的业态，支持多选。</p>
                                    <p>2. 选择“全部业态”将显示所有业态的数据。</p>
                                    <p>3. 支持搜索，输入业态名称即可搜索。</p>
                                    <p>4. 当有全部业态时，选择其他业态，将自动去除全部业态。</p>
                                    <p>5. 当没有选择业态时，将默认选择全部业态。</p>

                                </div>
                            </template>
                            <QuestionCircleOutlined style="font-size: 16px; color: #1890ff; cursor: help;" />
                        </a-tooltip>
                    </div>
                </template>

                <a-tab-pane key="summary" tab="汇总视图">
                    <ResourceSummary :resource-data="mergedResourceData" />
                </a-tab-pane>
                <a-tab-pane key="detail" tab="详细视图">
                    <ResourceDetail :resource-data="selectedResourceData" />
                </a-tab-pane>
            </a-tabs>
        </template>

        <!-- 单业态视图 -->
        <template v-else>
            <ResourceSummary :resource-data="pageResourceData?.[0] || {}"  type="one"/>
        </template>
    </div>
</template>

<style scoped lang="less">
.resource-tab {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

    :deep(.ant-tabs) {
        .ant-tabs-nav {
            margin-bottom: 24px;

            .ant-tabs-tab {
                padding: 8px 16px;
                font-size: 14px;
                transition: all 0.3s;

                &:hover {
                    color: #1890ff;
                }

                &.ant-tabs-tab-active {
                    .ant-tabs-tab-btn {
                        color: #1890ff;
                        font-weight: 500;
                    }
                }
            }

            .ant-tabs-ink-bar {
                background: #1890ff;
            }
        }
    }
}
</style>