<script setup>
import * as echarts from 'echarts';
import { debounce } from 'xe-utils';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    options: {
        type: Object,
        required: true
    }
});


const chartRef = ref(null);
let chartInstance = null;

const initChart = () => {
    if (!chartRef.value) return;
    
    chartInstance = echarts.init(chartRef.value);
    props.options &&chartInstance.setOption(props.options, true);
};

const handleResize = debounce(() => {
    if (chartInstance) {
        chartInstance.resize();
    }
}, 200);

watch(() => props.options, (newOptions) => {
    if (chartInstance) {
        newOptions && chartInstance.setOption(newOptions, true);
    }
}, { deep: true });

onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
   
    <div :id="`${props.id}-${Math.random()}`" ref="chartRef" class="resource-chart" ></div>
</template>



<style scoped lang="less">
.resource-chart {
    width: 100%;
    height: 100%;
    
}

</style> 