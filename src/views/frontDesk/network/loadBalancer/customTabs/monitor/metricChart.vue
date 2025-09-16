<script setup>
import * as echarts from 'echarts';
import API from '@/api/network/loadBalancer';
import dayjs from 'dayjs';
import { loadBalancerMetrics } from './config';

const props = defineProps({
    sid: {
        type: [String, Number],
        default: ''
    },
    metricName: {
        type: String,
        default: ''
    },
    param: {
        type: Object,
        default: () => ({})
    }
});

const chartRef = ref(null);
let chartInstance = null;

const state = reactive({
    chartData: [],
    isVisible: false,
    analysis: {
        max: 0,
        min: 0,
        avg: 0,
        sum: 0
    }
});

const groupName = 'rds-metric-group';

// 获取图表数据
const getChartData = async () => {
    const { metrics } = await API.getMetricValue(props.param);
    state.chartData = metrics[0];

    // 计算指标
    const values = state.chartData.values.map(item => item.value);
    if(values.length) {
        state.analysis.max = Math.max(...values).toFixed(2);
        state.analysis.min = Math.min(...values).toFixed(2);
        state.analysis.sum = values.reduce((a, b) => a + b, 0).toFixed(2);
        state.analysis.avg = (values.length ? state.analysis.sum / values.length : 0).toFixed(2);
    }
};

// 渲染图表
const renderChart = () => {
    if (!chartRef.value) return;
    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value);
        chartInstance.group = groupName;
    }
    const unit = loadBalancerMetrics[props.metricName]?.unit || state.chartData.unit || '';
    const label = loadBalancerMetrics[props.metricName]?.label || props.metricName;
    const analysis = state.analysis;
    const analysisList = [
        { value: analysis.max, label: '最大值' },
        { value: analysis.min, label: '最小值' },
        { value: analysis.avg, label: '平均值' },
    ];

    // 用 canvas 计算每个分析项的宽度
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = 'bolder 14px "PingFang SC", "Microsoft YaHei", Arial';
    const valueHeigth = 18;
    const valueWidths = analysisList.map(item => ctx.measureText(`${item.value} ${unit}`).width);
    const labelWidths = analysisList.map(item => ctx.measureText(item.label).width);
    const itemWidths = valueWidths.map((vw, i) => Math.max(vw, labelWidths[i]));

    // 计算每个分析项的 left
    let left = 0;
    const analysisGraphics = analysisList.map((item, idx) => {
        const group = {
            type: 'group',
            left,
            top: 35,
            children: [
                // 数值+单位
                {
                    type: 'text',
                    style: {
                        text: `${item.value} ${unit}`,
                        font: 'bolder 15px "PingFang SC", "Microsoft YaHei", Arial',
                        fill: '#222',
                    },
                    tooltip: {
                        show: true,
                        formatter: () => {
                            return [
                                `<div style="text-align: center">`,
                                `<div style="font-weight: bold; font-size: 15px; color: #222; margin-bottom: 4px">${item.value} ${unit}</div>`,
                                `<div style="font-size: 12px; color: #888">${item.label}</div>`,
                                `</div>`
                            ].join('');
                        },
                        backgroundColor: '#fff',
                        borderColor: '#e8e8e8',
                        borderWidth: 1,
                        textStyle: {
                            color: '#222',
                            fontSize: 12,
                            fontFamily: '"PingFang SC", "Microsoft YaHei", Arial'
                        },
                        padding: [8, 12],
                        extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.15);'
                    }
                },
                // 标签
                {
                    type: 'text',
                    top: valueHeigth + 4,
                    style: {
                        text: item.label,
                        font: '12px "PingFang SC", "Microsoft YaHei", Arial',
                        fill: '#888'
                    },
                }
            ],
        };
        left += itemWidths[idx] + 20;
        return group;
    });

    // 用 canvas 计算标题宽度
    const ctxTitle = document.createElement('canvas').getContext('2d');
    ctxTitle.font = '600 16px "PingFang SC", "Microsoft YaHei", Arial';
    const labelWidthTitle = ctxTitle.measureText(label).width;

    // 问号图标的尺寸和位置
    const iconSize = 16; // 直径
    const iconLeft = labelWidthTitle + 8; // 标题右侧 8px

    const option = {
        title: { show: false },
        tooltip: { trigger: 'axis' },
        legend: {
            data: [label],
            bottom: 0,
            icon: 'path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z',
        },
        grid: { 
            left: 40, 
            right: 20, 
            top: 120, // 预留顶部空间
            bottom: 55 
        },
        graphic: [
            // 标题
            {
                type: 'text',
                left: 0,
                top: 0,
                style: {
                    text: label,
                    font: '600 16px "PingFang SC", "Microsoft YaHei", Arial',
                    fill: '#222',
                }
            },
            // 圆圈问号图标
            {
                type: 'group',
                left: iconLeft,
                top: 0, // 微调垂直对齐
                children: [
                    // 圆圈
                    {
                        type: 'circle',
                        shape: {
                            cx: iconSize / 2,
                            cy: iconSize / 2,
                            r: iconSize / 2 - 1
                        },
                        style: {
                            stroke: '#222',
                            fill: '#fff',
                            lineWidth: 1,
                        }
                    },
                    // 问号
                    {
                        type: 'text',
                        left: 5,
                        top: 3,
                        style: {
                            text: '?',
                            x: iconSize / 2,
                            y: iconSize / 2 + 1,
                            font: '11px "PingFang SC", "Microsoft YaHei", Arial',
                            fill: '#222',
                            textAlign: 'center',
                            textVerticalAlign: 'middle',
                        },
                        tooltip: {
                            show: true,
                            formatter: loadBalancerMetrics[props.metricName]?.tooltip,
                            backgroundColor: '#fff',
                            borderColor: '#e8e8e8',
                            borderWidth: 1,
                            textStyle: {
                                color: '#222',
                                fontSize: 12,
                                fontFamily: '"PingFang SC", "Microsoft YaHei", Arial'
                            },
                            extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.15);',
                            position: function (point, params, dom, rect, size) {
                                // point: 鼠标位置 [x, y]
                                // size: {contentSize, viewSize}
                                let x = point[0] + 16; // 右侧偏移
                                let y = point[1] - size.contentSize[1] / 2; // 垂直居中
                                // 防止超出右侧
                                if (x + size.contentSize[0] > size.viewSize[0]) {
                                    x = size.viewSize[0] - size.contentSize[0] - 10;
                                }
                                // 防止超出上侧
                                if (y < 0) y = 10;
                                // 防止超出下侧
                                if (y + size.contentSize[1] > size.viewSize[1]) {
                                    y = size.viewSize[1] - size.contentSize[1] - 10;
                                }
                                return [x, y];
                            }
                        }
                    }
                ],
                cursor: 'pointer',
            },
            // 分析区
            ...analysisGraphics
        ],
        xAxis: {
            type: 'category',
            data: state.chartData.values.map(item => {
                const date = dayjs(item.date);
                // 检查数据跨度是否超过一天
                const firstDate = dayjs(state.chartData.values[0].date);
                const lastDate = dayjs(state.chartData.values[state.chartData.values.length - 1].date);
                const isOverOneDay = lastDate.diff(firstDate, 'day') > 0;
                
                // 如果跨度超过一天，显示日期+时间，否则只显示时间
                return isOverOneDay ? date.format('YYYY/MM/DD\nHH:mm') : date.format('HH:mm');
            }),
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            name: unit,
            nameLocation: 'end',
            nameTextStyle: {
                fontSize: 12,
                fontWeight: 400,
                color: 'black',
                padding: [0, 5, 0, 0]
            },
            axisLabel: {
                formatter: '{value}',
                width: 40,
                overflow: 'break'
            }
        },
        series: [{
            name: label,
            type: 'line',
            data: state.chartData.values.map(item => item.value),
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2, color: '#3b82f6' },
            itemStyle: { color: '#3b82f6' },
            markPoint: {
                symbol: 'triangle',
                symbolSize: 10,
                data: [
                    { 
                        type: 'max', 
                        name: '最大值', 
                        symbolRotate: 0, 
                        itemStyle: { color: '#3b82f6' },
                        symbolOffset: [0, -8]
                    },
                    { 
                        type: 'min', 
                        name: '最小值', 
                        symbolRotate: 180, 
                        itemStyle: { color: '#3b82f6' },
                        symbolOffset: [0, 8]
                    }
                ],
                label: {
                    show: false
                }
            }
        }]
    };
    chartInstance.setOption(option);
};

// 初始化 Intersection Observer
const initObserver = async () => {
    const observer = new IntersectionObserver(async (entries) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                state.isVisible = true;
                await getChartData();
                renderChart();
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    if (chartRef.value) {
        observer.observe(chartRef.value);
    }
};

onMounted(() => {
    initObserver();
    setTimeout(() => {
        echarts.connect(groupName);
    }, 300);
});

// 组件卸载时销毁图表实例
onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
});
</script>

<template>
    <a-spin :spinning="!state.isVisible">
        <div class="chart-box">
            <div ref="chartRef" class="chart-content"></div>
        </div>
    </a-spin>
</template>

<style lang="scss" scoped>
.chart-box {
    display: flex;
    flex-direction: column;
    width: 500px;
    height: 380px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.chart-content {
    width: 100%;
    height: 100%;
}
</style>