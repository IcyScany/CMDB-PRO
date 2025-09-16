<script setup>
import API from '@/api/network/routeLink';
import http from '@/utils/axios';
import { ref, reactive, onMounted } from 'vue';
import D3NetworkGraph from './D3NetworkGraph.vue';
// import { data } from './data';

const state = reactive({
    data: {},
    searchValue: '',
    direction: 'BOTH',
    selectedNode: null,
    selectedLink: null,
    regionData: {},
    accountData: {},
    loading: false,
});

const nodeDetailMap = {
    id: 'ID',
    name: '名称',
    status: '状态',
    business: '业态',
    data_source: '分区',
    region_name: '位置',
    environment: '环境',
    expire_time: '过期时间',
    sid: 'SID',
    labels: '类型',
    description: '描述',
    connectedGroupId: '连通分组',
};

const linkDetailMap = {
    sid: 'SID',
    name: '连线名称',
    src: '源节点',
    dst: '目标节点',
    data_source: '分区',
    region_name: '位置',
    ip_rule: '目的地址',
    bandwidth: '带宽',
    expire_time: '过期时间',
    description: '描述',
};

const nodes = ref([]);
const links = ref([]);

const getData = async (dir) => {
    state.loading = true;
    try {
        const chartData = await API.getData(dir, 'all');
        state.data = chartData;
        // state.data = data;
        
        // 只保留有连线的节点
        state.data.nodes = state.data.nodes.filter(node => 
            state.data.edges.some(edge => 
                edge.src === node.id || edge.dst === node.id
            )
        );

        // 节点信息
        nodes.value = state.data.nodes.map(node => {
            node.props.expire_time = new Date(node.props.expire_time * 1000).toLocaleString();
            node.props.region_id = state.regionData[node.props.region_id];
            node.props.labels = node.labels[0];
            node.props.connectedGroupId = node.connectedGroupId;
            return {
                ...node,
                name: node.props?.name || node.id,
                category: node.labels?.[0] || undefined,
                business: node.props?.business || 'Unknown',
                data_source: node.props?.data_source || 'Unknown',
            };
        });

        // 连线信息
        links.value = state.data.edges.map(edge => {
            edge.props.expire_time = new Date(edge.props.expire_time * 1000).toLocaleString();
            return {
                source: edge.src,
                target: edge.dst,
                name: edge.name,
                props: {
                    ...edge.props,
                    name: edge.name,
                    src: edge.src,
                    dst: edge.dst,
                },
                groupId: state.data.nodes.find(n => n.id === edge.src).connectedGroupId
            };
        }); 
    } catch (error) {
        console.error(error);
    } finally {
        state.loading = false;
    }
};

const handleDirectionChange = (val) => {
    state.direction = val;
    getData(val);
};

const getPublicData = async () => {
    const regionRes = await http.get('/public/cloud-regions/list');
    const accountRes = await http.get('/public/cloud-account-name/list');
    state.regionData = regionRes;
    state.accountData = accountRes;
};

onMounted(async () => {
    await getData('BOTH');
});

const handleNodeClick = (node) => {
    state.selectedLink = null;
    state.selectedNode = state.selectedNode?.id === node?.id ? null : node;
};
const handleLinkClick = (link) => {
    state.selectedNode = null;
    state.selectedLink = state.selectedLink?.source.id === link?.source?.id && state.selectedLink?.target.id === link?.target?.id ? null : link;
};

onMounted(() => {
    getPublicData();
});
</script>

<template>
    <D3NetworkGraph
        :nodes="nodes"
        :links="links"
        :search-value="state.searchValue"
        @node-click="handleNodeClick"
        @link-click="handleLinkClick"
    />

    <!-- 节点详情 -->
    <div 
        v-if="state.selectedNode" 
        class="detail-box"
        :style="{
            border: `1px solid #5470c6`,
        }"
    >
        <CloseOutlined class="detail-box-close" @click="state.selectedNode = null"/>
        <div v-for="(item, key) in nodeDetailMap" :key="key" class="desc-item">
            <span class="desc-label">{{ item }}:</span>
            <span class="desc-value">{{ state.selectedNode.props[key] }}</span>
        </div>
    </div>

    <!-- 连线详情 -->
    <div v-if="state.selectedLink" class="detail-box">
        <CloseOutlined class="detail-box-close" @click="state.selectedLink = null"/>
        <div v-for="(item, key) in linkDetailMap" :key="key" class="desc-item">
            <span class="desc-label">{{ item }}</span>
            <span class="desc-value">{{ state.selectedLink.props[key] }}</span>
        </div>
    </div>

    <!-- 工具栏 -->
    <div v-if="false" class="tool-box">
        <div>
            <vxe-button 
                v-for="(item, key) in { BOTH: '双向', IN: '流入', OUT: '流出' }" 
                :key="key" 
                size="mini" 
                :status="state.direction === key ? 'primary' : 'default'" 
                @click="handleDirectionChange(key)"
            >
                {{ item }}
            </vxe-button>
        </div>

        <a-input 
            v-model:value="state.searchValue"
            placeholder="搜索节点" 
            allow-clear
        />
    </div>
</template>

<style scoped lang="scss">
#container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 500px;
    background-color: #fff;
}

.detail-box {
    position: absolute;
    top: 200px;
    left: 35px;
    padding: 20px 10px 10px 10px;
    background: #fff;
    margin-right: 24px;
    z-index: 1000;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    border: 1px solid #e3e8ee;

    .detail-box-close {
        position: absolute;
        top: 5px;
        right: 5px;
        cursor: pointer;
        font-size: 12px;
        color: #5d5d5d;
    }
}

.desc-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.desc-label {
    color: #222;
    width: 80px;
    font-weight: 500;
}

.desc-value {
    color: #4a5568;
    max-width: 350px;
}

.tool-box {
    position: absolute;
    width: 300px;
    top: 60px;
    right: 0;
    padding: 6px;
    margin-right: 24px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
}
</style>