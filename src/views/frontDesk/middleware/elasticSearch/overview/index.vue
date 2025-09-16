<script setup>
import API from '@/api/middleware/elasticSearch';
import commonApi from '@/api/common';

const colors = [
    '#4fb050',
    '#e88250',
    '#3c79bf',
];

const state = reactive({
    overviewData: {},
    regionList: [],
});

// 获取数据
const getData = async () => {
    const res = await API.getOverview();
    state.overviewData = res;

    // 获取区域列表
    state.regionList = await commonApi.getCloudRegionList();
};

// 格式化数据
const formatData = async () => {
    let data = state.overviewData;

    data.section1.forEach(item => {
        // 处理status, 转中文名
        if(item.fields?.[0] === 'environment') {
            item.items.forEach(data => {
                data.environment = data.environment || '其他';
            });
        }
    });

    data.section2.forEach(item => {
        // 处理status, 转中文名
        if(item.fields?.[0] === 'region_id') {
            item.items.forEach(data => {
                data.region_id = state.regionList?.[data.region_id] || data.region_id;
            });
        }
    });
};

onMounted(async () => {
    await getData();
    await formatData();
});
</script>

<template>
    <a-empty v-if="state.overviewData?.section1?.find(item => item.label === '总数')?.items?.[0]?.count === 0" class="mt-10"/>

    <div v-else class="overview-container">
        <!-- 统计卡片 -->
        <div class="summary-box">
            <div 
                v-for="(item, index) in state.overviewData.section1" 
                :key="index" 
                class="summary-item"
                :style="{
                    '--summary-color': item.color || colors[index % colors.length], 
                    'cursor': index === 0 ? 'pointer' : 'default'
                }"
                @click="index === 0 ? $router.push({ name: 'ElasticSearchPage' }) : null"
            >
                <template v-for="(data, label) in item.items" :key="label">
                    <div>
                        <div 
                            class="summary-value" 
                            :style="{'font-size': item.label === '总数' ? '32px' : ''}"
                        >
                            {{ data.count }}
                        </div>
                        <div class="summary-title">
                            {{ item.label === '总数' ? item.label : data[item.fields?.[0]] }}
                        </div>
                    </div>

                    <img v-if="index === 0" class="summary-icon" :src="`/images/kvstore.png`" >
                    <div class="summary-border"></div>
                </template>
            </div>
        </div>

        <!-- 描述列表分布 -->
        <a-card title="资源分布">
            <div class="desc-box">
                <div v-for="(item, index) in state.overviewData.section2" :key="index" class="desc-card">
                    <div class="desc-title">{{ item.label }}</div>
                    <div class="desc-list">
                        <div 
                            v-for="data in item.items" 
                            :key="data.label"
                        >
                            <a-tooltip :title="data[item.fields[0]]">
                                <span 
                                    class="desc-label truncate"
                                >
                                    <CloudTypeIcon 
                                        v-if="!(item.fields[0] === 'cloud_source' && data.cloud_source === '自建')" 
                                        :type="data.cloud_source"
                                        style="width: 22px;"
                                    />
                                    {{ data[item.fields[0]] }}：
                                </span>
                            </a-tooltip>

                            <span class="desc-value">
                                <!-- 其他项 -->
                                <span v-if="data.other_data">
                                    <a-popover placement="right">
                                        <template #content>
                                            <div v-for="(otherItem, o_index) in data.other_data" :key="o_index">
                                                <span style="color: #888;">
                                                    <CloudTypeIcon 
                                                        :type="otherItem.cloud_source"
                                                        style="width: 22px;"
                                                    />
                                                    {{ otherItem[item.fields[0]] }}:
                                                </span>
                                                {{ otherItem.count }}
                                            </div>
                                        </template>
                                        <span>{{ data.count }}</span>
                                    </a-popover>
                                </span>

                                <span v-else>{{ data.count }}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a-card>
    </div>
</template>

<style scoped lang="less">
.overview-container {
    flex: auto;
    overflow: auto;
    padding: 0 4px;
    padding-bottom: 24px;
}

:deep(.ant-card) {
    margin-top: 14px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.08);

    .ant-card-body {
        padding: 0px 24px 24px 24px;
    }
}

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

        .summary-value {
            font-size: 26px;
            font-weight: 600;
            color: var(--summary-color);
            margin-bottom: 8px;
        }

        .summary-title {
            font-size: 14px;
            color: #666;
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
            width: 100%;
            display: flex;
            margin-bottom: 8px;
        }
        .two-col {
            display: inline-flex;
            width: 50%;
        }
        .desc-label {
            color: #888;
            font-size: 14px;
            display: inline-block;
            min-width: 100px;
            max-width: 80%;
        }
        .desc-value {
            margin-left: 5px;
            font-size: 15px;
            font-weight: 500;
            color: #333;
        }
    }
}
</style>
