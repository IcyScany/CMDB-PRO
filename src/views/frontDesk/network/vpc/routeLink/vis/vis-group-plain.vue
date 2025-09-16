<template>
    <div ref="container" class="network-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';
import { transEdge, transNodes } from './transformData2';

const container = ref(null);
let network = null;

let nodes = null;
let edges = null;

// const GRAY = 'gray';

function buildOptions() {
    return {
        layout: { improvedLayout: true, randomSeed: 2 },
        interaction: {
            hover: true,
            tooltipDelay: 100,
            zoomView: true,
            dragView: true,
            multiselect: true
        },
        nodes: {
            scaling: { min: 10, max: 42 },
            font: { size: 12 }
        },
        edges: {
            color: { color: '#c7c7c7', highlight: '#2b7ce9', opacity: 0.6 },
            width: 1.5,
            selectionWidth: 2,
            smooth: false,
            arrows: { to: { enabled: true, scaleFactor: 0.6 } }
        },
        physics: {
            // 物理引擎求解器类型
            solver: 'forceAtlas2Based',
            // forceAtlas2Based 物理参数
            forceAtlas2Based: {
                // 引力常数，负值表示节点间相互排斥
                gravitationalConstant: -150,
                // 中心引力，节点向中心靠拢的强度
                centralGravity: 0.008,
                // 弹簧长度，节点间理想距离
                springLength: 120,
                // 弹簧常数，节点间连线的弹性系数
                springConstant: 0.05,
                // 阻尼系数，影响节点移动速度
                damping: 0.4,
                // 节点间避免重叠的强度
                avoidOverlap: 0.6
            },
            // 稳定化参数，控制物理模拟的迭代次数和更新频率
            stabilization: { iterations: 600, updateInterval: 1 },
            // 最小速度，低于该速度时停止物理模拟
            minVelocity: 25
        },
        groups: {
            switch: { shape: 'triangle', color: '#FF9900' },
            desktop: { shape: 'dot', color: '#2B7CE9' },
            mobile: { shape: 'dot', color: '#5A1E5C' },
            server: { shape: 'square', color: '#C5000B' },
            internet: { shape: 'square', color: '#109618' }
        }
    };
}


// 画组底色
function drawGroupBackground(ctx, groupMap, groupColorMap) {
    const scale = network.getScale();
    const pad = 30 / scale;      // 保持屏幕像素级内边距
    const lineW = 2 / scale;     // 缩放时描边恒定像素宽度

    function roundRect(x, y, w, h, r) {
        const rr = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
    }

    for (const [group, ids] of groupMap.entries()) {
        if (!ids || ids.length < 2) continue;
        const pos = network.getPositions(ids);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const id of ids) {
            const p = pos[id];
            if (!p) continue;
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }
        if (!isFinite(minX)) continue;

        const x = minX - pad;
        const y = minY - pad;
        const w = (maxX - minX) + pad * 2;
        const h = (maxY - minY) + pad * 2;

        const base = groupColorMap.get(group) || '#a0b3ff';
        ctx.save();
        ctx.lineWidth = lineW;
        ctx.fillStyle = hexToRgba(base, 0.08);
        ctx.strokeStyle = hexToRgba(base, 0.45);
        roundRect(x, y, w, h, 16 / scale);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

function hexToRgba(hex, a) {
    const c = hex.replace('#', '');
    const bigint = parseInt(c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${a})`;
}

function draw() {
    nodes = transNodes;
    edges = transEdge;

    // 构建 group->ids 映射，以及 group->颜色（取节点背景色）
    const groupMap = new Map();
    const groupColorMap = new Map();
    for (const n of nodes) {
        if (!groupMap.has(n.data_source)) groupMap.set(n.data_source, []);
        groupMap.get(n.data_source).push(n.id);
        const bg = n?.color?.background || (typeof n.color === 'string' ? n.color : null);
        if (bg && !groupColorMap.has(n.data_source)) groupColorMap.set(n.data_source, bg);
    }

    const mynetwork = container.value;
    const data = { nodes, edges };
    const options = buildOptions();
    network = new Network(mynetwork, data, options);

    drawGroupBackground;
    // // 在节点/边绘制之前画底色，确保底色在最底层
    // network.on('beforeDrawing', (ctx) => drawGroupBackground(ctx, groupMap, groupColorMap));

    // 稳定后居中缩放并停止物理模拟，提升性能与可读性
    network.once('stabilizationIterationsDone', () => {
        network.stopSimulation();
        network.fit({
            animation: { duration: 500, easingFunction: 'easeInOutCubic' }
        });
    });

    // 窗口尺寸变化时自适应
    window.addEventListener('resize', onResize, { passive: true });
}

function onResize() {
    if (!network) return;
    network.redraw();
    network.fit({ animation: false });
}

onMounted(() => {
    if (container.value) {
        draw();
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (network) {
        network.destroy();
        network = null;
    }
});
</script>

<style scoped>
.network-container {
    width: 100%;
    height: 80vh;
    background: #fff;
}
</style>