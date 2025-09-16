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

function buildOptions() {
    return {
        layout: { improvedLayout: true, randomSeed: 2 },
        interaction: {
            hover: true,
            tooltipDelay: 100,
            zoomView: true,
            dragView: true,
            multiselect: true,
            hoverConnectedEdges: true
        },
        nodes: {
            scaling: { min: 12, max: 48 },
            font: { 
                size: 11, 
                face: 'Arial, sans-serif',
                color: '#2c3e50',
                strokeWidth: 2,
                strokeColor: '#ffffff'
            },
            borderWidth: 2,
            // shadow: {
            //     enabled: true,
            //     color: 'rgba(0,0,0,0.3)',
            //     size: 10,
            //     x: 2,
            //     y: 2
            // }
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
                gravitationalConstant: -250,
                // 中心引力，节点向中心靠拢的强度
                centralGravity: 0.008,
                // 弹簧长度，节点间理想距离
                springLength: 150,
                // 弹簧常数，节点间连线的弹性系数
                springConstant: 0.05,
                // 阻尼系数，影响节点移动速度
                damping: 0.4,
                // 节点间避免重叠的强度
                avoidOverlap: 0.9
            },
            // 稳定化参数，控制物理模拟的迭代次数和更新频率
            stabilization: { iterations: 600, updateInterval: 200 },
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

// 构建组内"隐形吸引边"（短弹簧），以及星心节点质量提升
function buildCohesionEdges(groupMap, baseLength = 80) {
    const extra = [];
    const hubs = new Set();
    for (const [, ids] of groupMap.entries()) {
        if (!ids || ids.length < 2) continue;
        const hub = ids[0];           // 任选一个作为星心
        hubs.add(hub);
        for (const id of ids) {
            if (id === hub) continue;
            extra.push({
                from: hub,
                to: id,
                length: baseLength,               // 更短=更强吸引
                smooth: false,
                physics: true,
                arrows: { to: { enabled: false } },
                color: { color: 'rgba(0,0,0,0)' }, // 透明，不影响视觉
                width: 0.5,
                selectionWidth: 0
            });
        }
    }
    return { extra, hubs };
}

// 画组底色
function drawGroupBackground(ctx, groupMap, groupColorMap) {
    // const scale = network.getScale();
    const scale = 1;
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

// 计算组包围盒（用于避免交叉）
function computeBBox(ids, pad = 60) {
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
    if (!isFinite(minX)) return null;
    return {
        left: minX - pad,
        right: maxX + pad,
        top: minY - pad,
        bottom: maxY + pad,
        cx: (minX + maxX) / 2,
        cy: (minY + maxY) / 2,
        w: (maxX - minX) + pad * 2,
        h: (maxY - minY) + pad * 2
    };
}

function translateGroup(ids, dx, dy) {
    const pos = network.getPositions(ids);
    for (const id of ids) {
        const p = pos[id];
        if (!p) continue;
        network.moveNode(id, p.x + dx, p.y + dy);
    }
}

// 让每个区域互不相交：迭代处理包围盒碰撞，移动面积较小的组
function resolveGroupOverlaps(groupMap, gap = 40, maxIter = 55) {
    const groups = Array.from(groupMap.keys());
    if (groups.length <= 1) return;

    for (let iter = 0; iter < maxIter; iter++) {
        let moved = false;

        // 预计算包围盒
        const boxes = new Map();
        for (const g of groups) {
            const box = computeBBox(groupMap.get(g));
            if (box) boxes.set(g, { ...box, area: box.w * box.h, group: g });
        }

        // 遍历所有组对，检测并处理包围盒重叠
        for (let i = 0; i < groups.length; i++) {
            for (let j = i + 1; j < groups.length; j++) {
                // 获取当前处理的两个组的ID
                const gi = groups[i], gj = groups[j];
                // 获取这两个组对应的包围盒
                const a = boxes.get(gi), b = boxes.get(gj);
                if (!a || !b) continue; // 跳过无效包围盒

                // 计算X、Y方向的重叠量
                const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
                if (overlapX <= 0 || overlapY <= 0) continue; // 没有重叠则跳过

                // 选择面积较小的组进行移动
                let move = a.area <= b.area ? a : b;
                const other = move === a ? b : a;

                let dx = 0, dy = 0;
                // 优先沿重叠较小的方向移动
                // if (overlapX > overlapY) {
                dx = (move.cx < other.cx ? -(overlapX + gap) : (overlapX + gap));
                // } else {
                dy = (move.cy < other.cy ? -(overlapY + gap) : (overlapY + gap));
                // } 

                // 移动选中的组
                translateGroup(groupMap.get(move.group), dx, dy);

                // 更新移动后包围盒，减少重复计算
                const movedBox = boxes.get(move.group);
                movedBox.left += dx; movedBox.right += dx; movedBox.cx += dx;
                movedBox.top += dy; movedBox.bottom += dy; movedBox.cy += dy;

                moved = true; // 标记本轮有移动
            }
        }

        if (!moved) break;
    }

    network.redraw();
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

    // 组内吸引边 + 星心质量增强
    const { extra: cohesionEdges, hubs } = buildCohesionEdges(groupMap, 70);
    for (const n of nodes) {
        if (hubs.has(n.id)) n.mass = 3; // 星心更稳，增强组内凝聚
    }

    const mynetwork = container.value;
    const data = { nodes, edges: [...edges, ...cohesionEdges] };
    const options = buildOptions();
    network = new Network(mynetwork, data, options);

    // drawGroupBackground;
    // 在节点/边绘制之前画底色，确保底色在最底层
    network.on('beforeDrawing', (ctx) => drawGroupBackground(ctx, groupMap, groupColorMap));

    // 稳定后：停止物理->消除区域交叉->固定位置->居中
    network.once('stabilizationIterationsDone', () => {
        network.stopSimulation();
        resolveGroupOverlaps(groupMap, 40, 30);
        network.storePositions(); // 固化当前位置
        network.setOptions({
            physics: false,               // 全局关闭物理
            interaction: { dragNodes: true }
        });
        network.fit({ animation: { duration: 500, easingFunction: 'easeInOutCubic' } });
    });

    // 拖动时仍保持物理关闭；拖动结束后保存位置
    network.on('dragStart', () => {
        network.setOptions({ physics: false });
    });
    network.on('dragEnd', () => {
        network.storePositions();
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