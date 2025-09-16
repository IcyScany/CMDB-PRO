import { data } from "./data";

// 统一节点形状与大小，不根据度数缩放

// 只保留在边里出现过的节点
const filterNodes = data.nodes.filter(node =>
    data.edges.some(edge => edge.src === node.id || edge.dst === node.id)
);

// 类型样式映射（颜色保留，形状统一为 dot）
const typeStyle = {
    vpc: { color: "#69c0ff", shape: "hexagon" },
    subnet: { color: "#95de64", shape: "dot" },
    network_device: { color: "#ffa940", shape: "square" },
    router: { color: "#ffd666", shape: "dot" },
    nat_gateway: { color: "#ff7875", shape: "dot" },
    eip: { color: "#b37feb", shape: "dot" },
    default: { color: "#5c8aff", shape: "dot" }
};

const transNodes = filterNodes.map(node => {
    const type = (node.labels && node.labels[0]) || "default";
    const style = typeStyle[type] || typeStyle.default;
    // 固定大小，取消按度数缩放

    return {
        id: node.id,
        label: node.props.name,
        group: type,
        shape: style.shape,
        data_source: node.props.data_source,
        value: 1,
        size: 20,
        color: {
            background: style.color,
            border: "#888",
            highlight: { background: style.color, border: "#2b7ce9" }
        },
        title: [
            `类型: ${type}`,
            node.props.data_source ? `来源: ${node.props.data_source}` : "",
            node.props.region_name ? `区域: ${node.props.region_name}` : "",
            node.props.status ? `状态: ${node.props.status}` : ""
        ].filter(Boolean).join("\n")
    };
});

const transEdge = data.edges.map(edge => {
    return {
        from: edge.src,
        to: edge.dst,
        arrows: "to",
        color: { color: "#c7c7c7", highlight: "#2b7ce9" },
        label: edge.props.bandwidth == '-1' ? null : edge.props.bandwidth + "MB"
    };
});

export {
    transNodes,
    transEdge
};