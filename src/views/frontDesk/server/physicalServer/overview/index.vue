<script setup>
import API from '@/api/server/physicalServer';
import commonApi from '@/api/common';
import { computed } from 'vue';

const state = ref({});

onMounted(async () => {
    try {
        const res = await API.getOverview();
        state.value = res || {};
        console.log(res);
        await formatData();
    } catch (error) {
        console.log(error);
    }
});

// 统计卡片颜色
const summaryColor = {
    '总数': '#4fb050',
    '云服务商': '#e88250',
};

// 数据分组
const section1 = computed(() => state.value.section1 || []);

// 设置区域名称
const setRegionName = async () => {
    const cloudRegionList = await commonApi.getCloudRegionList();
    
    if (state.value.section1) {
        const regionItem = state.value.section1.find(item => item.label === '区域分布');
        if (regionItem && regionItem.items) {
            regionItem.items.forEach(item => {
                const cloudRegion = cloudRegionList?.[item.region_id];
                if (cloudRegion) {
                    item.region_id = cloudRegion;
                }
            });
        }
    }
};

// 设置企业项目名称
const setProjectName = async () => {
    const huaweiProjectList = await commonApi.getHuaweiProjectList();
    
    if (state.value.section1) {
        const projectItem = state.value.section1.find(item => item.label === '企业项目');
        if (projectItem && projectItem.items) {
            projectItem.items.forEach(item => {
                item.enterprise_project_id = huaweiProjectList?.[item.enterprise_project_id]|| item.enterprise_project_id;
            });
        }
    }
};

// 格式化数据
const formatData = async () => {
    await setRegionName();
    await setProjectName();
};

// 统计卡片数据
const summaryList = computed(() => {
    if (!section1.value.length) return {};
    
    const result = {};
    section1.value.forEach((item) => {
        if (item.label === '总数') {
            result['总数'] = {
                '总数': item.items[0]?.count || 0
            };
        } else if (item.label === '云服务商') {
            result['云服务商'] = {};
            item.items.forEach(subItem => {
                result['云服务商'][subItem.cloud_source] = subItem.count;
            });
        }
    });
    return result;
});

// 资源分布数据
const descList = {
    '区域分布': { name: '区域分布', key: 'region_id', items: [] },
    '企业项目': { name: '企业项目', key: 'enterprise_project_id', items: [] },
};

const resourceDistribution = computed(() => {
    if (!section1.value.length) return descList;
    
    const result = { ...descList };
    section1.value.forEach((item) => {
        if (item.label === '区域分布') {
            result['区域分布'].items = item.items;
        } else if (item.label === '企业项目') {
            result['企业项目'].items = item.items;
        }
    });
    return result;
});
</script>

<template>
    <div v-if="Object.keys(state).length > 0">
        <div v-if="section1.length > 0" class="overview-container">
            <!-- 统计卡片 -->
            <div class="summary-box">
                <div
                    v-for="(item, key) in summaryList"
                    :key="key"
                    class="summary-item"
                    :style="{ '--summary-color': summaryColor[key], 'cursor': key === '总数' ? 'pointer' : '' }"
                    @click="key === '总数' ? $router.push({ name: 'physicalServer' }) : null"
                >
                    <div 
                        v-for="(count, label) in item" 
                        :key="label"
                    >
                        <div class="summary-data">
                            <div class="summary-value" style="font-size: 26px;">{{ count }}</div>
                            <div class="summary-title">{{ label }}</div>
                        </div>
                        <div class="summary-border"></div>
                    </div>
                    <div v-if="key === '总数'" class="summary-icon">
                        <img src="/images/security-group.png">
                    </div>
                </div>
            </div>

            <!-- 资源分布 -->
            <a-card title="资源分布">
                <div class="desc-box">
                    <div v-for="(info, key) in resourceDistribution" :key="key" class="desc-card">
                        <div class="desc-title">{{ info.name }}</div>
                        <div class="desc-list">

                            <div 
                                v-for="item in info.items" 
                                :key="item[info.key]"
                            >
                                <a-tooltip :title="item[info.key]">
                                    <span class="desc-label truncate">
                                        <CloudTypeIcon 
                                            v-if="item.cloud_source" 
                                            :type="item.cloud_source"
                                            style="width: 22px;"
                                        /> {{ item[info.key] }}：
                                    </span>
                                </a-tooltip>
                                <span class="desc-value">{{ item.count }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </a-card>
        </div>
        <a-empty v-else></a-empty>
    </div>
    <a-empty v-else></a-empty>
</template>

<style scoped lang="less">
:deep(.ant-card) {
    margin-top: 14px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.08);
    .ant-card-body {
        padding: 0px 24px 24px 24px;
    }
}

.overview-container {
    flex: auto;
    overflow: auto;
    padding: 0 4px;
    padding-bottom: 24px;
    
    .summary-box {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        margin: 20px 0;
        
        .summary-item {
            position: relative;
            flex: 1 1 160px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 20px 10px;
            background: #fff;
            
            .summary-data {
                text-align: center;
                
                .summary-value {
                    font-size: 32px;
                    font-weight: 600;
                    color: var(--summary-color);
                    margin-bottom: 8px;
                }
                
                .summary-title {
                    font-size: 14px;
                    color: #666;
                }
            }
            
            .summary-icon {
                width: 40px;
                height: 40px;
                background: var(--summary-color);
                opacity: 0.4;
                border-radius: 8px;

                img {
                    width: 100%;
                    height: 100%;
                }
            }
            
            .summary-border {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 90%;
                transform: translateX(5%);
                height: 3px;
                border-radius: 2px;
                background: var(--summary-color);
            }
        }
    }
    
    .desc-box {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        justify-content: flex-start;

        .desc-card {
            flex: 1 1 220px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 16px 18px 12px 18px;
        }
        .desc-title {
            font-weight: 600;
            font-size: 17px;
            margin-bottom: 12px;
            text-align: center;
            color: var(--primary-color);
        }
        .desc-list {
            min-width: 250px;

            div {
                display: flex;
                margin-bottom: 8px;
            }
            .desc-label {
                color: #888;
                font-size: 14px;
                display: inline-block;
                min-width: 100px;
                max-width: 150px;
            }
            .desc-value {
                font-weight: 500;
                color: #333;
                font-size: 15px;
            }
        }
    }
}
</style>
