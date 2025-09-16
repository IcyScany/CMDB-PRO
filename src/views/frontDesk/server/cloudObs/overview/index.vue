<script setup>
import API from '@/api/server/cloudObs';
import commonApi from '@/api/common';
import * as echarts from 'echarts';

const objNumberChartRef = ref(null);
let objNumberChartInstance = null;

const sizeChartRef = ref(null);
let sizeChartInstance = null;

const state = reactive({
    overviewData: {},
    regionList: [],
});

const summaryMeta = {
    total: { label: '总数', color: '#4fb050', icon: 'kvstore.png', pointer: true, name: 'cloudObsPage' },
    policy: { label: '策略分布', color: '#e88250' },
};

const overviewMeta = {
    region_id: { label: '区域分布' },
    az_redundancy: { label: 'AZ冗余' },
    storage_class: { label: '存储类型' },
};

// 获取数据
const getData = async () => {
    const res = await API.getOverview({
        "group_by_fields": [
            ["environment"],
            ["region_id"],
            ["policy"],
            ["az_redundancy"],
            ["storage_class"],
        ],
        "object_number_top_n": 10,
        "size_top_n": 10
    });

    // 总数
    state.overviewData.total = [
        {
            total: '总数',
            count: res.count,
        },
    ];

    // 资源分布
    res.group_by.forEach(item => {
        let filed = item.fields[0];
        let data = item.items.sort((a, b) => b.count - a.count);

        state.overviewData[filed] = data;
    });

    // 对象数量Top10
    state.overviewData.object_number_top_n = res.object_number_top_n;

    // 存储容量Top10
    state.overviewData.size_top_n = res.size_top_n;
};

// 格式化数据
const formatData = async    () => {
    let data = state.overviewData;

    data.policy.forEach(item => {
        item.policy = item.policy || '其他';
    });

    // 处理region_id, 转中文名
    state.regionList = await commonApi.getCloudRegionList();
    data.region_id.forEach(item => {
        item.region_id = state.regionList?.[item.region_id] || item.region_id;
    });
};

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num) => {
    if (num < 10000) {
        return num.toString();
    } else if (num < 100000000) {
        return (num / 10000) + '万';
    } else {
        return (num / 100000000) + '亿';
    }
};

const renderObjNumberChart = () => {
    if (!state.overviewData.object_number_top_n) return;
    // 按使用率降序排列
    const data = [...state.overviewData.object_number_top_n].reverse();

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const d = params[0].data.dataObj || {};
                return `
                    <b>${d.bucket}</b><br/>
                    区域：${state.regionList?.[d.region_id] || d.region_id}<br/>
                    对象数量：${formatNumber(d.object_number)}
                `;
            }
        },
        grid: {
            left: 150,
            right: 100,
            bottom: 20,
            top: 20
        },
        xAxis: {
            type: 'value',
            name: '对象数量',
        },
        yAxis: {
            type: 'category',
            data: data.map(item => item.bucket),
            axisLabel: { interval: 0 }
        },
        series: [
            {
                type: 'bar',
                data: data.map(item => ({
                    value: item.object_number,
                    dataObj: item // 传递原始数据用于tooltip
                })),
                color: '#3c79bf',
                label: {
                    show: true,
                    position: 'right',
                    formatter: function(params) {
                        const d = params.data.dataObj;
                        return `${formatNumber(d.object_number)}`;
                    }
                }
            }
        ]
    };

    if (!objNumberChartInstance) {
        objNumberChartInstance = echarts.init(objNumberChartRef.value);
    }
    objNumberChartInstance.setOption(option);

    setTimeout(() => {
        if (objNumberChartInstance) {
            objNumberChartInstance.resize();
        }
    }, 0);
};

const renderSizeChart = () => {
    if (!state.overviewData.size_top_n) return;
    // 按使用率降序排列
    const data = [...state.overviewData.size_top_n].reverse();

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const d = params[0].data.dataObj || {};
                return `
                    <b>${d.bucket}</b><br/>
                    区域：${state.regionList?.[d.region_id] || d.region_id}<br/>
                    容量：${formatBytes(d.size)}
                `;
            }
        },
        grid: {
            left: 150,
            right: 100,
            bottom: 20,
            top: 20
        },
        xAxis: {
            type: 'value',
            name: '容量',
        },
        yAxis: {
            type: 'category',
            data: data.map(item => item.bucket),
            axisLabel: { interval: 0 }
        },
        series: [
            {
                type: 'bar',
                data: data.map(item => ({
                    value: item.size,
                    dataObj: item // 传递原始数据用于tooltip
                })),
                color: '#3c79bf',
                label: {
                    show: true,
                    position: 'right',
                    formatter: function(params) {
                        const d = params.data.dataObj;
                        return `${formatBytes(d.size)}`;
                    }
                }
            }
        ]
    };

    if (!sizeChartInstance) {
        sizeChartInstance = echarts.init(sizeChartRef.value);
    }
    sizeChartInstance.setOption(option);

    setTimeout(() => {
        if (sizeChartInstance) {
            sizeChartInstance.resize();
        }
    }, 0);
};

const handleResize = () => {
    if (objNumberChartInstance) {
        objNumberChartInstance.resize();
    }
    if (sizeChartInstance) {
        sizeChartInstance.resize();
    }
};


onMounted(async () => {
    await getData();
    await formatData();
    nextTick(() => {
        renderObjNumberChart();
        renderSizeChart();
        window.addEventListener('resize', handleResize);
    });
});
</script>

<template>
    <a-empty v-if="state.overviewData.total?.[0]?.count === 0" class="mt-10"/>

    <div v-else class="overview-container">
        <!-- 统计卡片 -->
        <div class="summary-box">
            <div 
                v-for="(item, key) in summaryMeta" 
                :key="key" 
                class="summary-item"
                :class="{'cursor-pointer': item.pointer}"
                :style="{'--summary-color': item.color}" 
                @click="item.pointer ? $router.push({ name: item.name }) : null"
            >
                <template v-for="(data, label) in state.overviewData[key]" :key="label">
                    <div>
                        <div class="summary-value" :style="{'font-size': key === 'total' ? '32px' : ''}" >
                            {{ data.count }}
                        </div>
                        <div class="summary-title">{{ data[key] }}</div>
                    </div>
                    <img v-if="item.icon" class="summary-icon" :src="`/images/${item.icon}`" >
                    <div class="summary-border"></div>
                </template>
            </div>
        </div>

        <!-- 描述列表分布 -->
        <a-card title="资源分布">
            <div class="desc-box">
                <div v-for="(item, key) in overviewMeta" :key="key" class="desc-card">
                    <div class="desc-title">{{ item.label }}</div>
                    <div class="desc-list">
                        <div 
                            v-for="data in state.overviewData?.[key]" 
                            :key="data.label"
                            :class="{ 'two-col': key === 'spec_code' }"
                        >
                            <a-tooltip :title="data[key]">
                                <span 
                                    class="desc-label truncate"
                                >
                                    <CloudTypeIcon 
                                        v-if="item.icon && !(key === 'cloud_source' && data.cloud_source === '自建')" 
                                        :type="data.cloud_source"
                                        style="width: 22px;"
                                    />
                                    {{ data[key] }}：
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
                                                        v-if="item.icon" 
                                                        :type="otherItem.cloud_source"
                                                        style="width: 22px;"
                                                    />
                                                    {{ otherItem[key] }}:
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

        <a-card title="对象数量Top10">
            <div ref="objNumberChartRef" style="width: 100%; height: 400px; margin-bottom: 24px;"></div>
        </a-card>

        <a-card title="容量Top10">
            <div ref="sizeChartRef" style="width: 100%; height: 400px; margin-bottom: 24px;"></div>
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
