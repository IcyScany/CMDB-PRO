<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import * as d3 from 'd3';
import { buildNodePath } from '../nodePath';

const props = defineProps({
    nodes: Array,
    links: Array,
    searchValue: String,
});
const emits = defineEmits(['node-click', 'link-click']);

const container = ref(null);
let simulation = null, svg = null;

const nodeSize = 80;
// 类别示例（如需图例可启用）
// const categorys = ['vpc', 'cloud_virtual_interfaces', 'network_device', '路由器'];

function renderGraph() {
    if (!container.value) return;
    container.value.innerHTML = '';
    svg = d3.select(container.value)
        .append('svg')
        .attr('id', 'svg')
        .attr('width', '100%')
        .attr('height', '100%');

    // 标记双向连线
    const markBidirectionalLinks = (links) => {
        const linkMap = new Map();
        
        // 首先构建连线映射
        links.forEach(link => {
            const key = [link.source, link.target].sort().join('-');
            if (!linkMap.has(key)) {
                linkMap.set(key, []);
            }
            linkMap.get(key).push(link);
        });

        // 标记双向连线
        links.forEach(link => {
            const key = [link.source, link.target].sort().join('-');
            const relatedLinks = linkMap.get(key);
            link.isBidirectional = relatedLinks.length === 2;
            if (link.isBidirectional) {
                // 标记反向连线
                link.isReverse = relatedLinks[0] === link ? 1 : -1;
            }
        });

        return links;
    };

    // 处理连线数据
    const processedLinks = markBidirectionalLinks([...props.links]);

    // // 箭头
    // svg.append('defs').selectAll('marker')
    //     .data(['arrow'])
    //     .enter().append('marker')
    //     .attr('id', d => d)
    //     .attr('viewBox', '0 -5 10 10')
    //     .attr('refX', 8)
    //     .attr('refY', 0)
    //     .attr('markerWidth', 4)
    //     .attr('markerHeight', 4)
    //     .attr('orient', 'auto')
    //     .append('path')
    //     .attr('d', 'M0,-5L10,0L0,5')
    //     .attr('fill', '#aaa');

    // 缩放
    const g = svg.append('g');
    const zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    svg.call(zoom).on('dblclick.zoom', null);

    // 业务分组：基于区域间连线权重的力导向布局，使强相关区域更接近
    const businessGroups = d3.group(props.nodes, d => d.data_source);
    const businessCenters = {};
    const groupRects = {}; // { [data_source]: { x,y,width,height,id } }
    const containerWidth = container.value.clientWidth;
    const containerHeight = container.value.clientHeight;

    const groupCount = businessGroups.size;
    const cols = Math.ceil(Math.sqrt(groupCount));
    const rows = Math.ceil(groupCount / cols);
    const areaPadding = 80; // 每个区域内边距
    const cellWidth = containerWidth / cols * 3;
    const cellHeight = containerHeight / rows * 3;

    // 计算每个业务分组与其他分组的连接数
    const groupConnectionCounts = {};
    // 先为每个分组初始化对象
    for (const groupKey of businessGroups.keys()) {
        groupConnectionCounts[groupKey] = {};
        for (const otherKey of businessGroups.keys()) {
            if (groupKey !== otherKey) {
                groupConnectionCounts[groupKey][otherKey] = 0;
            }
        }
    }
    // 遍历所有连线，统计跨分组的连接数
    processedLinks.forEach(link => {
        const sourceNode = props.nodes.find(n => n.id === (link.source.id || link.source));
        const targetNode = props.nodes.find(n => n.id === (link.target.id || link.target));
        if (!sourceNode || !targetNode) return;
        const sourceGroup = sourceNode.data_source;
        const targetGroup = targetNode.data_source;
        if (sourceGroup && targetGroup && sourceGroup !== targetGroup) {
            // 统计双向
            groupConnectionCounts[sourceGroup][targetGroup] = (groupConnectionCounts[sourceGroup][targetGroup] || 0) + 1;
            groupConnectionCounts[targetGroup][sourceGroup] = (groupConnectionCounts[targetGroup][sourceGroup] || 0) + 1;
        }
    });
    // 可选：输出结果
    console.log('业务分组间连接数:', groupConnectionCounts);

    // businessGroups根据节点数排序
    const sortedBusinessGroups = Array.from(businessGroups.entries())
        .sort((a, b) => b[1].length - a[1].length);
    // 重新构建 businessGroups，保持后续代码兼容
    businessGroups.clear();
    for (const [key, value] of sortedBusinessGroups) {
        businessGroups.set(key, value);
    }

    let index = 0;
    businessGroups.forEach((groupNodes, data_source) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = col * cellWidth + areaPadding / 2;
        const y = row * cellHeight + areaPadding / 2;
        const width = Math.max(200, cellWidth - areaPadding);
        const height = Math.max(200, cellHeight - areaPadding);
        businessCenters[data_source] = [x + width / 2, y + height / 2];
        groupRects[data_source] = { x, y, width, height, id: data_source };
        index++;
    });

    // hull 层
    const groupLayer = g.append('g');

    // link hitbox
    const linkHitbox = g.append('g')
        .selectAll()
        .data(processedLinks)
        .join("path")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", 25)
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr("cursor", 'pointer');
    
    const link = g.append("g")
        .selectAll()
        .data(processedLinks)
        .join("path")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", 3)
        .attr('fill', 'none')
        .attr("marker-end","url(#arrow)")
        .attr('stroke', '#aaa')
        .attr("cursor", 'pointer');

    // 连线文本
    const linkLabel = g.append('g')
        .selectAll('text')
        .data(processedLinks)
        .enter()
        .append('text')
        .attr('font-size', 13)
        .attr('fill', '#888')
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .text(d => d.props?.bandwidth == -1 ? '' : `${d.props?.bandwidth}MB`);

    // 节点分组
    const nodeGroup = g.append('g')
        .selectAll('g')
        .data(props.nodes)
        .enter()
        .append('g')
        .attr('class', 'node-group')
        .attr('cursor', 'pointer')
        .attr('opacity', 1);

    nodeGroup.append('path')
        .attr('id', d => `node-${d.id}`)
        .attr('d', d => buildNodePath(d, nodeSize).dPath)
        .attr('fill', d => buildNodePath(d, nodeSize).fill)
        .attr('stroke', d => buildNodePath(d, nodeSize).stroke)
        .attr('stroke-width', 1.2)
        .attr('transform-origin', `${nodeSize / 2} ${nodeSize / 2}`);

    // label
    const label = g.append('g')
        .selectAll('g')
        .data(props.nodes)
        .enter()
        .append('g');
        
    ['business', 'name'].forEach((item, idx) => {
        label.append('text')
            .text(d => {
                if(item === 'name' && !d.props?.[item]) {
                    return d.description;
                }
                return d.props?.[item] || '';
            })
            .attr('fill', 'black')
            .attr('font-size', 12)
            .attr('opacity', 1)
            .attr('y', (idx) * 15 + nodeSize / 1.5)
            .attr('text-anchor', 'middle')
            .attr('pointer-events', 'none');
    });

    // 力导向
    simulation = d3.forceSimulation(props.nodes)
        .force('link', d3.forceLink(processedLinks).id(d => d.id).distance(500))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('x', d3.forceX(d => businessCenters[d.data_source][0]).strength(0.55))
        .force('y', d3.forceY(d => businessCenters[d.data_source][1]).strength(0.55))
        .force('collide', d3.forceCollide().radius(nodeSize + 150));

    // 手动推进，跳过动画
    simulation.tick(300);

    simulation.on('tick', () => {
        // 限制每个节点在其业务区域内，确保区域互不相交
        props.nodes.forEach(d => {
            const rect = groupRects[d.data_source];
            if (!rect) return;
            const minX = rect.x + nodeSize / 2;
            const maxX = rect.x + rect.width - nodeSize / 2;
            const minY = rect.y + nodeSize / 2;
            const maxY = rect.y + rect.height - nodeSize / 2;
            d.x = Math.max(minX, Math.min(maxX, d.x));
            d.y = Math.max(minY, Math.min(maxY, d.y));
        });
        // 获取连线端点
        const getEdgePoint = (source, target, r) => {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len === 0) return { x: source.x, y: source.y };
            return {
                x: source.x + (dx * r) / len / 1.5,
                y: source.y + (dy * r) / len / 1.5,
            };
        };

        [linkHitbox, link].forEach(g => {
            g.attr('d', (d) => {
                const start = getEdgePoint(d.source, d.target, nodeSize);
                const end = getEdgePoint(d.target, d.source, nodeSize);
                const r = Math.hypot(end.x - start.x, end.y - start.y) * 1.5;
                if(d.isBidirectional) {
                    return `
                        M${start.x},${start.y}
                        A${r * d.isReverse},${r * d.isReverse} 0 0,1 ${end.x},${end.y}
                    `;
                } else {
                    return `
                        M${start.x},${start.y}
                        A${(end.x - start.x) / 2},0 0 0,1 ${end.x},${end.y}
                    `;
                }
            });
        });
            
        nodeGroup.attr('transform', d => `translate(${d.x - nodeSize / 2},${d.y - nodeSize / 2})`);
        
        label
            .attr('transform', d => `translate(${d.x},${d.y})`);
        linkLabel
            .attr('y', 0)
            .attr('transform', d => {
                const start = getEdgePoint(d.source, d.target, nodeSize);
                const end = getEdgePoint(d.target, d.source, nodeSize);
                const r = Math.hypot(end.x - start.x, end.y - start.y);
                
                let cx, cy, offset;
                if (d.isBidirectional) {
                    // 双向连线，文本位置需要考虑弧度
                    offset = d.isReverse * r * 0.09; // 控制文本距离弧线的距离
                    cx = (start.x + end.x) / 2;
                    cy = (start.y + end.y) / 2 + offset;
                } else {
                    // 单向连线，文本位置在中点上方
                    cx = (start.x + end.x) / 2;
                    cy = (start.y + end.y) / 2;
                    offset = -6;
                }

                let angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
                // 让文字始终正向
                if (angle > 90 || angle < -90) angle += 180;
                
                return `translate(${cx},${cy}) rotate(${angle}) translate(0,${offset})`;
            });
            
        // 分组虚线边框和标题（使用预分配的网格，确保不相交）
        const rectData = Object.values(groupRects);
        groupLayer.selectAll('rect')
            .data(rectData)
            .join('rect')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('stroke', '#3d85c6')
            .attr('stroke-dasharray', '8,6')
            .attr('fill', '#e6f0fa')
            .attr('fill-opacity', 0.18)
            .attr('rx', 24);
        groupLayer.selectAll('text')
            .data(rectData)
            .join('text')
            .attr('x', d => d.x + 10)
            .attr('y', d => d.y + 22)
            .text(d => d.id)
            .attr('font-size', 22)
            .attr('font-weight', 'bold')
            .attr('fill', '#222');
    });

    // 连线 hover 和点击
    [linkHitbox, link].forEach(g => {
        g.on('mouseover', function(event, d) {
            link.transition()
                .attr('stroke-opacity', link => 
                    link.source.id === d.source.id && link.target.id === d.target.id ? 1 : 0.7
                )
                .attr('stroke-width', 
                    link => link.source.id === d.source.id && link.target.id === d.target.id ? 7 : 3
                );
        })
            .on('mouseout', function() {
                link.transition()
                    .attr('stroke-opacity', 0.7)
                    .attr('stroke-width', 3);
            })
            .on('click', (event, d) => {
                emits('link-click', d);
            });
    });

    // 节点 hover 和点击
    nodeGroup
        .on('mouseover', function(event, d) {
            const connectedLinks = processedLinks.filter(l => l.source.id === d.id || l.target.id === d.id);
            const connectedNodes = new Set();
            connectedLinks.forEach(l => {
                connectedNodes.add(l.source.id);
                connectedNodes.add(l.target.id);
            });
            nodeGroup.transition()
                .attr('opacity', node => connectedNodes.has(node.id) ? 1 : 0.1);
            link.transition()
                .attr('stroke-opacity', link => connectedLinks.includes(link) ? 0.7 : 0.1);
            label.transition()
                .attr('opacity', label => connectedNodes.has(label.id) ? 1 : 0.1);
            linkLabel.transition()
                .attr('opacity', linkLabel => connectedLinks.includes(linkLabel) ? 1 : 0.1);
        })
        .on('mouseout', function() {
            nodeGroup.transition().attr('opacity', 1);
            link.transition().attr('stroke-opacity', 0.7);
            label.transition().attr('opacity', 1);
            linkLabel.transition().attr('opacity', 1);
        })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on('click', (event, d) => {
            emits('node-click', d);
        });
    
    // // 图例
    // const legend = svg.append('g')
    //     .attr('class', 'legend')
    //     .attr('transform', 'translate(20, 20)');
    // categorys.forEach((category, index) => {
    //     const legendItem = legend.append('g')
    //         .attr('transform', `translate(0, ${index * 25})`);
    //     legendItem.append('image')
    //         .attr('xlink:href', new URL(`./svg/${category}.svg`, import.meta.url).href)
    //         .attr('x', 0)
    //         .attr('y', -8)
    //         .attr('width', 18)
    //         .attr('height', 18);
    //     legendItem.append('text')
    //         .text(category)
    //         .attr('x', 24)
    //         .attr('y', 6)
    //         .attr('font-size', 14)
    //         .attr('fill', '#222');

    //     // 高亮对应类型节点和相关连线
    //     legendItem
    //         .on('mouseover', function() {
    //             nodeGroup.transition()
    //                 .attr('opacity', d => [d.category, d.name].includes(category) ? 1 : 0.1);
    //             link.transition()
    //                 .attr('stroke-opacity', l => 
    //                     [l.source?.category, l.target?.category, l.source.name, l.target.name].includes(category) ? 0.7 : 0.1
    //                 );
    //             label.transition()
    //                 .attr('opacity', d => [d.category, d.name].includes(category) ? 1 : 0.1);
    //             linkLabel.transition()
    //                 .attr('opacity', d => [d.category, d.name].includes(category) ? 1 : 0.1);
                
    //         })
    //         .on('mouseout', function() {
    //             // 恢复所有
    //             nodeGroup.transition().attr('opacity', 1);
    //             link.transition().attr('stroke-opacity', 0.7);
    //             label.transition().attr('opacity', 1);
    //             linkLabel.transition().attr('opacity', 1);
    //         });
    // });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        // 固定节点
        nodeGroup
            .attr("transform", function(d) { 
                d.fx=d.x;
                d.fy=d.y;
                return `translate(${d.x - nodeSize / 2},${d.y - nodeSize / 2})`;
            });
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
    }

    // 初始化缩放
    // 只在初始时执行一次
    if (!props.nodes.length) return;
    const svgEl = document.getElementById('svg');
    const width = svgEl.clientWidth;
    const height = svgEl.clientHeight;

    // 计算所有节点的包围盒
    const xs = props.nodes.map(d => d.x);
    const ys = props.nodes.map(d => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const nodesWidth = maxX - minX;
    const nodesHeight = maxY - minY;

    // 计算缩放比例，留出边距
    const padding = 200; // 作用于视口缩放的边距，与区域内边距不同名
    const scale = Math.min(
        (width - padding) / nodesWidth,
        (height - padding) / nodesHeight,
        1 // 不放大超过1倍
    );

    // 计算平移，使图形居中
    const tx = width / 2 - ((minX + maxX) / 2) * scale;
    const ty = height / 2 - ((minY + maxY) / 2) * scale;

    // 应用缩放和平移
    d3.select(svgEl)
        .transition()
        .duration(0)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(tx, ty)
                .scale(scale)
        );

    // 点击空白处清除 state.selectedNode
    container.value.onclick = (e) => {
        if (e.target?.id === 'svg') {
            emits('node-click', null);
            emits('link-click', null);
        }
    };  
}

// 搜索节点
const handleSearch = async () => {
    // 先移除所有高亮
    d3.selectAll('.search-highlight').classed('search-highlight', false);

    if (!props.searchValue) return;

    setTimeout(() => {
        // 找到匹配节点
        const matchedIds = props.nodes
            .filter(node => {
                const nodeString = JSON.stringify(node).toLowerCase() || '';
                return nodeString.includes(props.searchValue.toLowerCase());
            })
            .map(node => node.id);
        // 给匹配的节点分组加上高亮类
        matchedIds.forEach(id => {
        // 选中父g（node-group）
            d3.select(`#node-${id}`).classed('search-highlight', true);
        });
    });
};

watch(() => props.searchValue, handleSearch);

watch(() => [props.nodes, props.links], () => {
    renderGraph();
});

onMounted(() => {
    renderGraph();
});
onBeforeUnmount(() => {
    simulation && simulation.stop();
});
</script>

<template>
    <div ref="container" style="width:100%;height:100%"></div>
  </template>
  
<style>
@keyframes node-flash-scale {
    0%   { transform: scale(1);   opacity: 1; }
    20%  { transform: scale(1.4); opacity: 1; }
    40%  { transform: scale(1.2); opacity: 0.3; }
    60%  { transform: scale(1.4); opacity: 1; }
    80%  { transform: scale(1.2); opacity: 0.3; }
    100% { transform: scale(1);   opacity: 1; }
}
.search-highlight {
    animation: node-flash-scale 1.5s ease-in-out 3;
}
</style>
  