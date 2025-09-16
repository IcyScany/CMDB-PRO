// import { data } from "./data";

// const filterNodes = data.nodes.filter(node => 
//     data.edges.some(edge => 
//         edge.src === node.id || edge.dst === node.id
//     )
// );

// const transNodes = filterNodes.map(node => {
//     return {
//         id: node.id,
//         label: node.props.name,
//         color: '',
//         shape: 'box'
//     };
// });

// const transEdge = data.edges.map(edge => {
//     return {
//         from: edge.src,
//         to: edge.dst,
//         arrow: 'to',
//         color: { color: '' },
//     };
// });


const transNodes = [
    { id: 1, label: '互联网VPC', color: '#ccc', shape: 'ellipse' },
    { id: 2, label: '生产VPC', color: 'red', shape: 'circle' },
    { id: 3, label: 'NAT网关', color: 'green', shape: 'cloud' },
    { id: 4, label: '测试VPC', color: '#88c', shape: 'box' },
    { id: 5, label: '交换机', color: '#66ccff', shape: 'square' },
    { id: 6, label: 'R1', color: '#cc99ff', shape: 'hexagon' }
];

// 边数据
const transEdge = [
    { from: 3, to: 2, arrows: 'to', color: { color: 'blue' }, dashes: true },
    { from: 2, to: 1, arrows: 'to', color: { color: 'red' } },
    { from: 1, to: 4, arrows: 'to', color: { color: '#666' } },
    { from: 4, to: 5, arrows: 'to', color: { color: 'green' }, dashes: true },
    { from: 5, to: 6, arrows: 'to', color: { color: '#999' } }
];



export {
    transNodes,
    transEdge
};
