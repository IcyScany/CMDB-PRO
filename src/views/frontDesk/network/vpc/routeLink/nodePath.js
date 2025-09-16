import * as d3 from 'd3';

// 基于 category 使用 path 绘制节点图标
const categoryStyleMap = {
    vpc: { fill: '#9dd1ff', stroke: '#1a5f8a', shape: 'circle' },
    cloud_virtual_interfaces: { fill: '#b3d9f2', stroke: '#1a5f8a', shape: 'roundedRect' },
    network_device: { fill: '#c4b3f0', stroke: '#4a4a4a', shape: 'hex' },
    router: { fill: '#c4b3f0', stroke: '#4a4a4a', shape: 'oct' },
    '路由器': { fill: '#c4b3f0', stroke: '#4a4a4a', shape: 'oct' },
    nat: { fill: '#a8e6b8', stroke: '#2e7d32', shape: 'roundedRect' },
    vpn: { fill: '#9de7d8', stroke: '#156a5f', shape: 'diamond' },
};

const toLower = (v) => (v || '').toString().toLowerCase();

const pathCircle = (cx, cy, r) => `M ${cx - r},${cy}
    a ${r},${r} 0 1,0 ${2 * r},0
    a ${r},${r} 0 1,0 -${2 * r},0`;

const pathRegularPoly = (cx, cy, r, sides) => {
    const pts = d3.range(sides).map(i => {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    });
    return `M ${pts.map(p => p.join(',')).join(' L ')} Z`;
};

const pathDiamond = (cx, cy, r) => `M ${cx},${cy - r} L ${cx + r},${cy} L ${cx},${cy + r} L ${cx - r},${cy} Z`;

const pathRoundedRect = (x, y, w, h, r) => `M ${x + r},${y}
    H ${x + w - r}
    A ${r},${r} 0 0 1 ${x + w},${y + r}
    V ${y + h - r}
    A ${r},${r} 0 0 1 ${x + w - r},${y + h}
    H ${x + r}
    A ${r},${r} 0 0 1 ${x},${y + h - r}
    V ${y + r}
    A ${r},${r} 0 0 1 ${x + r},${y}
    Z`;

export const buildNodePath = (d, nodeSize) => {
    const cat = toLower(d.category);
    const name = toLower(d.name || d.label || '');
    let style = categoryStyleMap[cat] || categoryStyleMap[name] || null;
    if (!style) {
        // 额外匹配关键词
        if (cat.includes('router') || name.includes('ar') || name.includes('er') || name.includes('路由')) {
            style = categoryStyleMap.router;
        } else if (cat.includes('vpc')) {
            style = categoryStyleMap.vpc;
        } else if (cat.includes('nat') || name.includes('nat')) {
            style = categoryStyleMap.nat;
        } else if (cat.includes('vpn')) {
            style = categoryStyleMap.vpn;
        } else {
            style = { fill: '#d1d8e0', stroke: '#4a4a4a', shape: 'circle' };
        }
    }

    const cx = nodeSize / 2;
    const cy = nodeSize / 2;
    const r = nodeSize / 2;

    let dPath = '';
    switch (style.shape) {
        case 'circle':
            dPath = pathCircle(cx, cy, r);
            break;
        case 'hex':
            dPath = pathRegularPoly(cx, cy, r * 0.95, 6);
            break;
        case 'oct':
            dPath = pathRegularPoly(cx, cy, r * 0.95, 8);
            break;
        case 'diamond':
            dPath = pathDiamond(cx, cy, r * 0.9);
            break;
        case 'roundedRect':
            dPath = pathRoundedRect(0, nodeSize * 0.18, nodeSize, nodeSize * 0.64, 16);
            break;
        default:
            dPath = pathCircle(cx, cy, r);
    }

    return { dPath, fill: style.fill, stroke: style.stroke };
};