<template>
    <div ref="networkContainer" style="width: 100%; height: 800px; border: 1px solid lightgray;"></div>
</template>
  
<script setup>
import { onMounted, ref } from 'vue';
import { DataSet, Network } from 'vis-network/standalone';
import { transNodes, transEdge } from './transformData';
  
const networkContainer = ref(null);
  
onMounted(() => {
    // 节点数据
    const nodes = new DataSet(transNodes);
  
    // 边数据
    const edges = new DataSet(transEdge);
  
    // 网络参数
    const data = { nodes, edges };
    const options = {
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            stabilization: { iterations: 100 }
        },
        edges: {
            smooth: true
        },
        nodes: {
            font: { size: 14 }
        }
    };
  
    // 创建网络
    new Network(networkContainer.value, data, options);
});
</script>
  