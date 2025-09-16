<script setup>
import API from '@/api/db/rdsApi';
import commonApi from '@/api/common';
import * as echarts from 'echarts';
import { onMounted, onBeforeUnmount } from 'vue';

const state = reactive({
    overviewData: {},
});

const volumeChartRef = ref(null);
let volumeChartInstance = null;

const summaryMeta = {
    total: { label: '数据库总数', color: '#4fb050', icon: 'kvstore.png', pointer: true },
    status: { label: '状态分布', color: '#e88250' },
    expire_time: { label: '即将过期', color: '#3c79bf' },
    charge_type: { label: '付费类型', color: '#4fb050' },
};

const overviewMeta = {
    // cloud_source: { label: '云来源分布', icon: true },
    region_id: { label: '区域分布', icon: true },
    environment: { label: '环境分布' },
    spec_code: { label: '规格分布' },
    engine: { label: '引擎分布' },
};

// 获取数据
const getData = async () => {
    const res = await API.getOverview({
        expire_days: [ 10, 30 ],
        group_by_fields: [
            ['environment'],
            ['charge_type'], 
            ['status'], 
            ['region_id', 'cloud_source'], 
            ['spec_code'], 
            ['cloud_source'], 
            ['engine', 'engine_version']
        ],
        volume_usage_rate_top_n: 10,
        mem_usage_rate_top_n: 10
    });

    // 总数
    state.overviewData.total = [
        {
            total: '数据库总数',
            count: res.count,
        },
    ];

    // 即将过期
    state.overviewData.expire_time = [];
    res.expire_soon.forEach(item => {
        state.overviewData.expire_time.push({
            expire_time: `即将过期(小于${item.days}天)`,
            count: item.instances.length,
        });
    });

    // 资源分布
    res.group_by.forEach(item => {
        let filed = item.fields[0];
        state.overviewData[filed] = item.items;
    });

    // 磁盘使用量Top10
    state.overviewData.volume_usage_rate_top_n = res.volume_usage_rate_top_n;
};

const sortData = (data) => {
    return data.sort((a, b) => b.count - a.count);
};

// 格式化数据
const formatData = async    () => {
    let data = state.overviewData;

    // 处理空值
    Object.entries(data).forEach(([key, value]) => {
        value.forEach(item => {
            if(!item[key]) {
                item[key] = '其他';
            }
        });
    });

    // 处理region_id, 转中文名，并截取前5个
    const cloudRegionList = await commonApi.getCloudRegionList();
    data.region_id.forEach(item => {
        item.region_id = cloudRegionList?.[item.region_id] || item.region_id;
    });

    let sortedRegionId = sortData(data.region_id);
    if(sortedRegionId.length > 5) {
        data.region_id = sortedRegionId.slice(0, 4);
        data.region_id.push({
            region_id: '其他',
            count: sortedRegionId.slice(4).reduce((acc, item) => acc + item.count, 0),
            other_data: sortedRegionId.slice(4),
        });
    }

    // 处理spec_code, 截取前10个
    let sortedSpecCode = sortData(data.spec_code);
    if(sortedSpecCode.length > 10) {
        data.spec_code = sortedSpecCode.slice(0, 9);
        data.spec_code.push({
            spec_code: '其他',
            count: sortedSpecCode.slice(9).reduce((acc, item) => acc + item.count, 0),
            other_data: sortedSpecCode.slice(9),
        });
    }

    // 处理engine
    let sortedEngine = sortData(data.engine);
    data.engine = sortedEngine.map(item => {
        return {
            engine: item.engine + ' ' + item.engine_version,
            count: item.count,
        };
    });
};

const renderVolumeChart = () => {
    if (!state.overviewData.volume_usage_rate_top_n) return;
    // 按使用率降序排列
    const data = [...state.overviewData.volume_usage_rate_top_n].sort(
        (b, a) => b.volume_usage_rate - a.volume_usage_rate
    );

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: function(params) {
                const d = params[0].data.dataObj || {};
                return `
                    <b>${d.name}</b><br/>
                    环境：${d.environment}<br/>
                    总容量：${d.volume_size} GB<br/>
                    已用容量：${d.volume_used} GB<br/>
                    使用率：${d.volume_usage_rate}%
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
            name: '使用率(%)',
            min: 0,
            max: 100
        },
        yAxis: {
            type: 'category',
            data: data.map(item => item.name),
            axisLabel: { interval: 0 }
        },
        series: [
            {
                type: 'bar',
                data: data.map(item => ({
                    value: item.volume_usage_rate,
                    dataObj: item // 传递原始数据用于tooltip
                })),
                color: '#3c79bf',
                label: {
                    show: true,
                    position: 'right',
                    formatter: function(params) {
                        const d = params.data.dataObj;
                        return `${d.volume_usage_rate}%  (${d.volume_used}/${d.volume_size}GB)`;
                    }
                }
            }
        ]
    };

    if (!volumeChartInstance) {
        volumeChartInstance = echarts.init(volumeChartRef.value);
    }
    volumeChartInstance.setOption(option);

    setTimeout(() => {
        if (volumeChartInstance) {
            volumeChartInstance.resize();
        }
    }, 0);
};

const handleResize = () => {
    if (volumeChartInstance) {
        volumeChartInstance.resize();
    }
};

onMounted(async () => {
    await getData();
    await formatData();
    nextTick(() => {
        renderVolumeChart();
        window.addEventListener('resize', handleResize);
    });
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
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
                @click="item.pointer ? $router.push({ name: 'rdsPage' }) : null"
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

        <a-card title="磁盘使用率Top10">
            <div ref="volumeChartRef" style="width: 100%; height: 400px; margin-bottom: 24px;"></div>
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
