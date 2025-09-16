<script setup>
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';
import { transEdge, transNodes } from './transformData2';

const container = ref(null);
let network = null;

let nodes = null;
let edges = null;

// 本地持久化相关
const STORAGE_KEY = 'routeLink_node_positions';
let usingSavedPositions = false;

function loadSavedPositions() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') return obj;
    } catch (error) {
        // ignore JSON/Storage errors
    }
    return null;
}

function savePositions() {
    if (!network || !nodes) return;
    const ids = nodes.map(n => n.id);
    const pos = network.getPositions(ids);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch (error) {
        // ignore Storage errors
    }
}

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
            scaling: { 
                min: 150, 
                max: 150,
                // 始终显示节点标签（不随缩放隐藏）
                label: { enabled: false, drawThreshold: 0, maxVisible: 9999 }
            },
            font: { 
                size: 70, 
                face: 'Arial, sans-serif',
                color: 'black',
                strokeWidth: 1,
                strokeColor: '#000000'
            },
            borderWidth: 1,
            shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.2)',
                size: 6,
                x: 2,
                y: 2
            },
            // 根据节点度数动态调整大小
            // size: 10,
            // 标签高亮效果
            labelHighlightBold: true,
            // 节点悬停效果（如需定制可用 chosen 回调实现）
        },
        edges: {
            color: { color: '#666666', highlight: '#2b7ce9', hover: '#2b7ce9', opacity: 0.8 },
            width: 8,
            selectionWidth: 3,
            // smooth: { type: 'continuous', forceDirection: 'none' },
            smooth: false,
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            font: {
                size: 80,
                color: '#333333',
                strokeWidth: 2,
                strokeColor: '#ffffff'
            },
            scaling: { 
                min: 150, 
                max: 150,
                // 始终显示节点标签（不随缩放隐藏）
                label: { enabled: false, drawThreshold: 0, maxVisible: 9999 }
            },
            hoverWidth: 3
        },
        physics: {
            // 物理引擎求解器类型
            solver: 'forceAtlas2Based',
            // forceAtlas2Based 物理参数
            forceAtlas2Based: {
                // 引力常数，负值表示节点间相互排斥
                gravitationalConstant: -500,
                // 中心引力，节点向中心靠拢的强度
                centralGravity: 0.001,
                // 弹簧长度，节点间理想距离
                springLength: 400,
                // 弹簧常数，节点间连线的弹性系数
                springConstant: 0.02,
                // 阻尼系数，影响节点移动速度
                damping: 0.3,
                // 节点间避免重叠的强度
                avoidOverlap: 0.95
            },
            // 稳定化参数，控制物理模拟的迭代次数和更新频率
            stabilization: { iterations: 800, updateInterval: 150 },
            // 最小速度，低于该速度时停止物理模拟
            minVelocity: 20
        },
        groups: {
            vpc: { 
                shape: 'box', 
                color: '#69c0ff',
            },
            subnet: { 
                shape: 'ellipse', 
                color: '#95de64',
            },
            network_device: { 
                shape: 'hexagon', 
                color: '#ffa940',
            },
            router: { 
                shape: 'triangle', 
                color: '#ffd666',
            },
            nat_gateway: { 
                shape: 'triangleDown', 
                color: '#ff7875',
            },
            eip: { 
                shape: 'dot', 
                color: '#b37feb',
            },
            default: { 
                shape: 'dot', 
                color: '#5c8aff',
            }
        }
    };
}

// 构建组内"隐形吸引边"（短弹簧），以及星心节点质量提升
function buildCohesionEdges(groupMap, baseLength = 120) {
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
                length: ids.length > 10 ? baseLength * 6 : baseLength,               // 更短=更强吸引
                smooth: false,
                physics: true,
                arrows: { to: { enabled: false } },
                color: { color: 'rgba(0,0,0,0)', highlight: 'rgba(0,0,0,0)', hover: 'rgba(0,0,0,0)' }, // 完全透明，包括hover状态
                width: 0.5,
                selectionWidth: 0,
            });
        }
    }
    return { extra, hubs };
}

// 画组底色
function drawGroupBackground(ctx, groupMap, groupColorMap) {
    // const scale = network.getScale();
    const scale = 1;
    const pad = 280 / scale;      // 保持屏幕像素级内边距
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
        // 在底色框上绘制组名
        const label = String(group ?? '');
        if (label) {
            ctx.save();
            // 文字大小随缩放调整，但限制范围以避免过大或过小
            const baseFontSize = 60;
            ctx.font = `${baseFontSize / scale}px Arial, -apple-system, sans-serif`;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            // 先描边再填充，增强可读性
            ctx.lineWidth = 3 / scale;
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            const textX = x + 10 / scale;
            const textY = y + 8 / scale;
            ctx.strokeText(label, textX, textY);
            ctx.fillText(label, textX, textY);
            ctx.restore();
        }
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

// 同时沿 X 和 Y 轴线性放大，使拓扑图铺满整个页面
function scaleToFill(ratio = 0.95) {
    if (!network || !container.value || !nodes || nodes.length === 0) return;
    const ids = nodes.map(n => n.id);
    const positions = network.getPositions(ids);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const id of ids) {
        const p = positions[id];
        if (!p) continue;
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) return;
    const bboxWidth = maxX - minX;
    const bboxHeight = maxY - minY;
    if (bboxWidth <= 0 || bboxHeight <= 0) return;

    const rect = container.value.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const currScale = typeof network.getScale === 'function' ? network.getScale() : 1;
    
    // 计算 X 和 Y 方向的缩放比例
    const targetCoordWidth = (rect.width * ratio) / currScale;
    const targetCoordHeight = (rect.height * ratio) / currScale;
    const factorX = Math.min(targetCoordWidth / bboxWidth, 2.5);
    const factorY = Math.min(targetCoordHeight / bboxHeight, 2.5);

    // 取较小的缩放比例，确保完全铺满且不变形
    if (factorX <= 1 && factorY < 1) return; // 只放大，不压缩

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // 同时缩放 X 和 Y 坐标
    for (const id of ids) {
        const p = positions[id];
        if (!p) continue;
        const newX = centerX + (p.x - centerX) * factorX;
        const newY = centerY + (p.y - centerY) * factorY;
        network.moveNode(id, newX, newY);
    }
    network.storePositions();
    network.redraw();
    network.moveTo({ position: { x: centerX, y: centerY }, scale: currScale, animation: { duration: 300, easingFunction: 'easeInOutCubic' } });
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

    // 读取本地持久化坐标，若存在则应用并禁用物理引擎
    const saved = loadSavedPositions();
    usingSavedPositions = !!(saved && Object.keys(saved).length > 0);
    if (usingSavedPositions) {
        for (const n of nodes) {
            const sp = saved[n.id];
            if (sp && typeof sp.x === 'number' && typeof sp.y === 'number') {
                n.x = sp.x;
                n.y = sp.y;
            }
        }
    }

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
    const { extra: cohesionEdges, hubs } = buildCohesionEdges(groupMap, 100);
    for (const n of nodes) {
        if (hubs.has(n.id)) n.mass = 3; // 星心更稳，增强组内凝聚
    }

    const mynetwork = container.value;
    const data = { nodes, edges: [...edges, ...cohesionEdges] };
    const options = buildOptions();
    network = new Network(mynetwork, data, options);
    if (usingSavedPositions) {
        network.setOptions({ physics: false });
        network.redraw();
    }

    // drawGroupBackground;
    // 在节点/边绘制之前画底色，确保底色在最底层
    network.on('beforeDrawing', (ctx) => drawGroupBackground(ctx, groupMap, groupColorMap));
    
    // 自定义节点标签渲染，显示更多信息
    network.on('afterDrawing', (ctx) => {
        const scale = network.getScale();
        const positions = network.getPositions();
        
        ctx.save();
        ctx.font = `${12 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 为重要节点添加额外标签
        for (const node of nodes) {
            if (node.value > 3) { // 度数大于3的节点显示额外信息
                const pos = positions[node.id];
                if (pos) {
                    const label = `${node.data_source || 'Unknown'}`;
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
                    ctx.lineWidth = 2 * scale;
                    
                    // 绘制背景
                    const textWidth = ctx.measureText(label).width;
                    const padding = 4 * scale;
                    ctx.fillRect(
                        pos.x - textWidth/2 - padding,
                        pos.y + 25 * scale,
                        textWidth + padding * 2,
                        16 * scale
                    );
                    
                    // 绘制文字
                    ctx.strokeText(label, pos.x, pos.y + 33 * scale);
                    ctx.fillText(label, pos.x, pos.y + 33 * scale);
                }
            }
        }
        ctx.restore();
    });

    // 稳定后：停止物理->消除区域交叉->固定位置->居中（仅在未使用本地坐标时）
    if (!usingSavedPositions) {
        network.once('stabilizationIterationsDone', () => {
            network.stopSimulation();
            resolveGroupOverlaps(groupMap, 40, 30);
            network.storePositions(); // 固化当前位置
            savePositions(); // 首次稳定后也存一次
            network.setOptions({
                physics: false,               // 全局关闭物理
                interaction: { dragNodes: true }
            });
            // 仅沿 X 轴放大以铺满横向
            setTimeout(() => scaleToFill(0.9), 80);
        });
    }

    // 拖动时仍保持物理关闭；拖动结束后保存位置
    network.on('dragStart', () => {
        network.setOptions({ physics: false });
    });
    network.on('dragEnd', () => {
        network.storePositions();
        savePositions();
    });

    // 窗口尺寸变化时自适应
    window.addEventListener('resize', onResize, { passive: true });
}

function onResize() {
    if (!network) return;
    network.redraw();
    // 宽度变大时按需沿 X 轴放大（不压缩）
    // 使用较小的延时避免频繁触发
    setTimeout(() => {
        if (!network) return;
        const prevScale = typeof network.getScale === 'function' ? network.getScale() : 1;
        // 放大逻辑内部会保持当前缩放比例
        // 注意：如果容器变小，不做压缩，保持现状
        // 这样避免抖动
        const ids = nodes ? nodes.map(n => n.id) : [];
        if (!ids.length) return;
        scaleToFill(0.9);
        network.moveTo({ scale: prevScale, animation: false });
    }, 50);
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

<template>
    <div ref="container" class="network-container"></div>
</template>

<style scoped>
.network-container {
    width: 100%;
    height: 100%;
}

/* 确保网络图能够充分利用容器空间 */
.network-container canvas {
    width: 100% !important;
    height: 100% !important;
}

/* 添加一些全局样式优化 */
:deep(.vis-network) {
    outline: none;
}

:deep(.vis-network-tooltip) {
    background: rgba(0,0,0,0.8) !important;
    color: white !important;
    border-radius: 6px !important;
    padding: 8px 12px !important;
    font-size: 12px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
}
</style>