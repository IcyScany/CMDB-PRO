<script setup>
import API from '@/api/security/cloudWafApi';
import DescCard from './descCard.vue';

const props = defineProps({
    rowData: {
        type: Object,
        default: () => ({}),
    },
});
const { rowData } = toRefs(props);

const descData = reactive({
    type: '',
    data: {
        waf: [],
        cfw: [],
        nat: [],
    }
});

const descOptions = reactive({
    waf: {
        title: 'WAF信息',
        fields: {
            cloud_source: '云类型',
            hostname: '域名',
            access_status: '接入状态',
            access_code: 'CNAME',
            description: '备注',
        },
    },
    source: {
        title: '源站信息',
        fields: {
            ip: 'IP地址',
        },
    },
    cfw: {
        title: 'CFW信息',
        fields: {
        },
        addressFields: {
            cloud_source: '云类型',
            device_name: '绑定设备名称',
            public_ip: '弹性公网IP', 
        },
    },
    nat: {
        title: 'NAT信息',
        fields: {
            description: '备注',
        },
        addressFields: {
            public_ip: '外网IP',
            public_port: '外网端口',
            arrow: '',
            internal_ip: '内网IP',
            internal_port: '内网端口',
            status: '状态', 
        },
    },
});

const descStyle = {
    label: {
        fontWeight: 500,
    },
    content: {
        display: 'inline-block',
        paddingRight: '30px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
};

const tooltipStyle = {
    maxWidth: '500px',
    fontSize: '12px',
};

onMounted(async () => {
    const res = await API.getNextHop(rowData.value.id);
    descData.data.waf = rowData.value;
    descData.data.nat = res?.nat_data_list || [];
    descData.data.cfw = res?.cfw_data_list || [];
    descData.data.source = rowData.value.server;
});
</script>

<template>
    <div style="padding: 10px;">
        <desc-card
            :desc-data="descData.data.waf"
            :desc-fields="descOptions.waf.fields"
            :slots="['access_status']"
            title="WAF信息"
        >
            <template #access_status>
                <vxe-tag :class="descData.data.waf?.access_status == 1 ? 'theme--primary' : 'theme--error'" size="small">
                    {{ descData.data.waf?.access_status == 1 ? '接入' : '未接入' }}
                </vxe-tag>
            </template>
        </desc-card>
    
        <!-- CFW信息 -->
        <div v-if="descData.data.cfw">
            <desc-card
                :desc-data="descData.data.cfw"
                :desc-fields="descOptions.cfw.fields"
                :slots="['description']"
                title="CFW信息"
                :arrow="true"
                :custom-item="'customItem'"
                :custom-span="{description: 3}"
            >
                <!-- ip列表 -->
                <template #customItem>
                    <a-descriptions-item
                        v-for="(cfw, cfw_index) in descData.data.cfw"
                        :key="cfw_index"
                        :span="3"
                    >
                        <a-descriptions
                            :label-style="descStyle.label"
                            :content-style="descStyle.content"
                        >
                            <a-descriptions-item  
                                v-for="(label, field) in descOptions.cfw.addressFields" 
                                :key="field" 
                                :label="label" 
                                :style="{ paddingBottom: 0 }"
                            >
                                <a-tooltip :title="cfw?.[field]" :overlay-style="tooltipStyle">
                                    <template v-if="field === 'arrow'">
                                        <div class="text-left"><ArrowRightOutlined :style="{ fontSize: '20px' }"/></div>                                    
                                    </template>

                                    <template v-else>{{ cfw?.[field] }}</template>
                                </a-tooltip>
                            </a-descriptions-item>
                        </a-descriptions>
                    </a-descriptions-item>
                </template>
            </desc-card>
        </div>

        <!-- NAT信息 -->
        <desc-card
            v-if="descData.data.nat.length"
            :desc-data="descData.data.nat"
            :desc-fields="descOptions.nat.fields"
            :slots="['description']"
            title="NAT信息"
            :arrow="true"
            :custom-item="'customItem'"
            :custom-span="{description: 3}"
        >
            <!-- 描述 -->
            <template #description>
                <a-tooltip :title="descData.data.nat?.reduce((acc, curr) => acc + curr.description + '; ', '')" :overlay-style="tooltipStyle">
                    <div class="truncate">{{ descData.data.nat?.reduce((acc, curr) => acc + curr.description + '; ', '') }}</div>
                </a-tooltip>
            </template>
    
            <!-- ip列表 -->
            <template #customItem>
                <a-descriptions-item
                    v-for="(nat, nat_index) in descData.data.nat"
                    :key="nat_index"
                    :span="3"
                >
                    <a-descriptions
                        :column="19"
                        :label-style="descStyle.label"
                        :content-style="descStyle.content"
                    >
                        <a-descriptions-item  
                            v-for="(label, field) in descOptions.nat.addressFields" 
                            :key="field" 
                            :label="label" 
                            :span="field === 'arrow' ? 1 : ['public_port', 'internal_port', 'status'].includes(field) ? 2 : 3"
                            :style="{ paddingBottom: 0 }"
                        >
                            <a-tooltip :title="nat?.[field]" :overlay-style="tooltipStyle">
                                <template v-if="field === 'status'">
                                    <vxe-tag :class="nat?.[field] == '可用' ? 'theme--primary' : 'theme--error'" size="small">
                                        {{ nat?.[field] }}
                                    </vxe-tag>
                                </template>
    
                                <template v-else-if="field === 'arrow'">
                                    <div class="text-left"><ArrowRightOutlined :style="{ fontSize: '20px' }"/></div>                                    
                                </template>
    
                                <template v-else>{{ nat?.[field] }}</template>
                            </a-tooltip>
                        </a-descriptions-item>
                    </a-descriptions>
                </a-descriptions-item>
            </template>
        </desc-card>
    
        <!-- 源站信息 -->
        <desc-card
            v-else
            :arrow="true"
            title="回源地址"
            :custom-item="'customItem'"
        >
            <template #customItem>
                <a-descriptions-item
                    v-for="(source, source_index) in descData.data.source"
                    :key="source_index"
                    :span="3"
                >
                    <a-descriptions
                        :column="1"
                        :label-style="descStyle.label"
                        :content-style="descStyle.content"
                    >
                        <a-descriptions-item  
                            v-for="(label, field) in descOptions.source.fields" 
                            :key="field" 
                            :label="label" 
                            :style="{ paddingBottom: 0 }"
                        >
                            <a-tooltip :title="source" :overlay-style="tooltipStyle">
                                {{ source }}
                            </a-tooltip>
                        </a-descriptions-item>
                    </a-descriptions>
                </a-descriptions-item>
            </template>
        </desc-card>
    </div>
</template>

<style scoped lang="less">
.alert-message {
    padding: 4px 16px;
    margin-top: 2px;
    width: fit-content;  // 宽度自适应内容
    min-width: 200px;    // 最小宽度
    max-width: 100%;     // 最大不超过容器
    color:#616266;
    border: none;
    
    :deep(.ant-alert-message),
    :deep(.ant-alert-description) {
        white-space: pre-wrap; // 允许文本换行
        word-break: break-word; // 长单词换行
    }
    .alert-message-icon {
        font-size: 20px;
        line-height: 1;
    }
}
</style>
