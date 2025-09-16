<script setup>
import * as echarts from 'echarts';
import { apiList } from '@/api/db/mongodb';
import dayjs from 'dayjs';
import { mongodbMetrics } from './config';

const props = defineProps({
    param: {
        type: Object,
        default: () => ({})
    },
    nodeGroup: {
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

const groupName = 'mongodb-metric-group';

// 获取图表数据
const getChartData = async () => {
    const { metrics } = await apiList.monitor.postChartData(props.param);
    state.chartData = metrics; // 保存全部metrics

    // 只分析第一个指标
    if (metrics[0] && metrics[0].values) {
        const values = metrics[0].values.map(item => item.value);
        if(values.length) {
            state.analysis.max = Math.max(...values).toFixed(2);
            state.analysis.min = Math.min(...values).toFixed(2);
            state.analysis.sum = values.reduce((a, b) => a + b, 0).toFixed(2);
            state.analysis.avg = (values.length ? state.analysis.sum / values.length : 0).toFixed(2);
        }
    }
};

// 渲染图表
const renderChart = () => {
    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value);
        chartInstance.group = groupName;
    }
    // 以第一个 metrics 的 values 作为 x 轴
    const xData = state.chartData[0]?.values.map(item => {
        const date = dayjs(item.date);
        const firstDate = dayjs(state.chartData[0].values[0].date);
        const lastDate = dayjs(state.chartData[0].values[state.chartData[0].values.length - 1].date);
        const isOverOneDay = lastDate.diff(firstDate, 'day') > 0;
        return isOverOneDay ? date.format('YYYY/MM/DD\nHH:mm') : date.format('HH:mm');
    }) || [];

    // 多条线的 legend 和 series
    const colorList = ['#3b82f6', '#03CAC3',  '#7A5AF7','#f59e42', '#10b981'];
    const series = state.chartData.map((metric, idx) => {
        // 优先节点名+指标名
        const nodeName = props.nodeGroup?.nodes?.find(item => item.cloud_node_id === metric.dimensions[1]?.value)?.name;
        const label = nodeName ? `${nodeName} - ${(mongodbMetrics[metric.metric_name]?.label || metric.metric_name)}` : (mongodbMetrics[metric.metric_name]?.label || metric.metric_name || `line${idx+1}`);
        const color = colorList[idx % colorList.length];
        return {
            name: label,
            type: 'line',
            data: metric.values.map(item => item.value),
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2, color },
            itemStyle: { color },
            markPoint: {
                symbolSize: 10,
                data: [
                    {
                        type: 'max',
                        name: '最大值',
                        symbol: 'triangle',
                        symbolRotate: 0,
                        itemStyle: { color },
                        symbolOffset: [0, -8]
                    },
                    {
                        type: 'min',
                        name: '最小值',
                        symbol: 'triangle',
                        symbolRotate: 180,
                        itemStyle: { color },
                        symbolOffset: [0, 8]
                    }
                ],
                label: { show: false }
            }
        };
    });
    const legendData = series.map(s => s.name);

    // 只用第一个指标的单位和分析区
    const unit = mongodbMetrics[state.chartData[0]?.metric_name]?.unit || state.chartData[0]?.unit || '';
    const label = mongodbMetrics[state.chartData[0]?.metric_name]?.label || state.chartData[0]?.metric_name;
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
    let analysisGraphics = [];
    let isSingle = state.chartData.length === 1;
    if (isSingle) {
        analysisGraphics = analysisList.map((item, idx) => {
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
                                    `<div style="text-align: center;">`,
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
    }

    // 用 canvas 计算标题宽度
    const ctxTitle = document.createElement('canvas').getContext('2d');
    ctxTitle.font = '600 16px "PingFang SC", "Microsoft YaHei", Arial';
    const labelWidthTitle = ctxTitle.measureText(label).width;

    // 问号图标的尺寸和位置
    const iconSize = 16; // 直径
    const iconLeft = labelWidthTitle + 8; // 标题右侧 8px

    const option = {
        title: { show: false },
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#fff',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: { color: '#222', fontSize: 12 },
            padding: [12, 16],
            extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.15);',
            formatter: function(params) {
                let html = `<div style="font-size:13px;font-weight:500;margin-bottom:6px;">${params[0].axisValueLabel || params[0].axisValue}</div>`;
                html += '<table>';
                params.forEach(item => {
                    // 节点名截断处理
                    let nodeName = item.seriesName.split(' - ')[0];
                    let metricLabel = item.seriesName.split(' - ')[1] || '';
                    let shortNode = nodeName.length > 50 ? nodeName.slice(0, 50) + '...' : nodeName;
                    html += `<tr>`;
                    html += `<td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};margin-right:6px;"></span></td>`;
                    html += `<td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${nodeName}">${shortNode} - ${metricLabel}</td>`;
                    html += `<td style="padding-left:16px;font-weight:600;">${item.value} ${unit}</td>`;
                    html += `</tr>`;
                });
                html += '</table>';
                return html;
            },
            position: function (point, params, dom, rect, size) {
                // 获取鼠标在屏幕的坐标
                const mouseX = point[0] + (chartRef.value?.getBoundingClientRect().left || 0);
                const mouseY = point[1] + (chartRef.value?.getBoundingClientRect().top || 0);

                let x = point[0] + 16;
                let y = point[1] + 16;

                // 屏幕边界
                const screenW = window.innerWidth;
                const screenH = window.innerHeight;

                // 右侧溢出
                if (mouseX + size.contentSize[0] > screenW) {
                    x = point[0] - size.contentSize[0] / 2 - 16;
                }
                // 下方溢出
                if (mouseY + size.contentSize[1] > screenH) {
                    y = point[1] - size.contentSize[1] / 2 - 26;
                }
                return [x, y];
            }
        },
        legend: {
            data: legendData,
            bottom: 0,
            icon: 'path://M120 476H720c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z',
            type: 'scroll',
            orient: 'horizontal',
            pageButtonItemGap: 8,
            pageButtonGap: 8,
            pageIconColor: '#888',
            pageIconInactiveColor: '#ccc',
            pageIconSize: 16,
            pageTextStyle: { color: '#888' },
            tooltip: { show: true }
        },
        grid: { 
            left: 40, 
            right: 20, 
            top: isSingle ? 120 : 60, // 预留顶部空间
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
                            formatter: mongodbMetrics[state.chartData[0]?.metric_name]?.tooltip,
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
                                // 鼠标在页面上的绝对坐标
                                const mouseX = point[0] + (chartRef.value?.getBoundingClientRect().left || 0);
                                const mouseY = point[1] + (chartRef.value?.getBoundingClientRect().top || 0);

                                let x = mouseX - size.contentSize[0] / 2;
                                let y = mouseY - size.contentSize[1] - 16;

                                // 屏幕边界
                                const screenW = window.innerWidth;
                                const screenH = window.innerHeight;

                                // 上方不够则下方
                                if (y < 0) y = mouseY + 16;
                                // 左侧溢出
                                if (x < 0) x = 10;
                                // 右侧溢出
                                if (x + size.contentSize[0] > screenW) {
                                    x = screenW - size.contentSize[0] - 10;
                                }
                                // 下方溢出
                                if (y + size.contentSize[1] > screenH) {
                                    y = screenH - size.contentSize[1] - 10;
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
            data: xData,
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
        series
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
    // setTimeout(() => {
    //     echarts.connect(groupName);
    // }, 300);
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