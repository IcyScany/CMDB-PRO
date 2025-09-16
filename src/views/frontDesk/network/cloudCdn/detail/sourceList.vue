<script setup>
import API from '@/api/network/cloudCdnApi';
import DescCard from './descCard.vue';

const props = defineProps({
    initTitleData: {
        type: Object,
        default: () => ({}),
    },
    rowData: {
        type: Object,
        default: () => ({}),
    },
});
const { initTitleData, rowData } = toRefs(props);

const loading = ref(false);
const descData = reactive({
    type: '',
    data: {
        cdn: {},
        source: [],
        waf: [],
        cfw: [],
        nat: [],
    }
});

const descOptions = reactive({
    cdn: {
        title: 'CDN基本信息',
        fields: {
            cloud_source: '云类型',
            domain_id: '云数据ID',
            domain_name: '域名',
            domain_status: '加速域名状态',
            business_type: '业务类型',
            cname: 'CNAME',
            https_status: 'HTTPS状态',
            description: '备注',
        },
    },
    source: {
        title: '当前回源信息',
        fields: {
            origin_type: '源站类型',
            ip_or_domain: '源站地址',
            active_standby: '优先级',
            http_port: 'HTTP端口',
            https_port: 'HTTPS端口',
            description: '备注',
        },
    },
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

const handleOpen = async () => {
    loading.value = true;
    const res = await API.getNextHop(rowData.value.id);

    descData.type = rowData.value.sources?.[0]?.origin_type;
    descData.data.cdn = rowData.value;
    descData.data.source = rowData.value.sources;

    // 类型为IPADDR
    if(descData.type === 'ipaddr' && res) {
        descData.data.cfw = [res.cfw];
        descData.data.nat = [res.nat];
        descData.data.waf = [res.waf];
    }

    // 类型为domain
    if(descData.type === 'domain') {
        rowData.value.sources.forEach(item => {
            let key = item.ip_or_domain;
            Object.keys(res[key]?.data || {}).length && descData.data.waf.push(res[key]?.data);
            res[key]?.nat?.length && descData.data.nat.push(res[key]?.nat);
            res[key]?.cfw?.length && descData.data.cfw.push(res[key]?.cfw);
        });
    }

    loading.value = false;
};

onMounted(async () => {
    await handleOpen();
});
</script>

<template>
    <div v-for="(item, index) in descData.data.waf?.length || 1" :key="index">
        <template v-if="descData.data.waf?.length > 1">
            <div v-if="index" style="margin: 50px 0;">
                <a-divider style="background-color: var(--warning-color); margin: 2px 0;"/>
                <a-divider style="background-color: var(--warning-color); margin: 2px 0;"/>
            </div>
            <a-typography-title :level="3">
                <span class="ml-4 text-primary">源站信息{{ index+1 }}</span>
            </a-typography-title>
        </template>

        <!-- CDN基本信息 -->
        <desc-card
            :desc-data="descData.data.cdn"
            :desc-fields="descOptions.cdn.fields"
            :slots="['https_status', 'domain_status']"
            title="CDN基本信息"
            :card-style="{borderColor: 'var(--primary-color)'}"
        >
            <template #https_status>
                <vxe-tag :class="descData.data.cdn?.https_status !== 0 ? 'theme--primary' : 'theme--error'" size="small">
                    {{ descData.data.cdn?.https_status !== 0 ? '已开启' : '未启用' }}
                </vxe-tag>
            </template>

            <template #domain_status>
                <vxe-tag :class="descData.data.cdn?.domain_status === '已开启' ? 'theme--primary' : 'theme--error'" size="small">
                    {{ descData.data.cdn?.domain_status }}
                </vxe-tag>
            </template>
        </desc-card>

        <!-- 当前回源信息 -->
        <template 
            v-if="descData.type === 'obs_bucket' ||
            (['ipaddr', 'domain'].includes(descData.type) && !descData.data.waf?.[index]?.length && !descData.data.nat?.[index]?.length && !descData.data.cfw?.[index]?.length)"
        >
            <desc-card
                :desc-data="descData.data.source?.[0]"
                :desc-fields="descOptions.source.fields"
                :slots="['active_standby', 'origin_type']"
                title="当前回源信息"
                :arrow="true"
            >
                <template #active_standby>
                    <span v-if="descData.data.source?.[0]?.active_standby == 1">主源站</span>
                    <span v-else>备源站</span>
                </template>
                
                <template #origin_type>
                    <span>{{ initTitleData[descData.type] || descData.type }}</span>
                </template>
            </desc-card>

            <div v-if="descData.type !== 'obs_bucket'">
                <a-alert
                    type="warning"
                    show-icon
                    class="alert-message"
                >
                    <template #icon>
                        <vxe-icon name="warning-triangle-fill"  class-name="alert-message-icon"></vxe-icon>
                    </template>
                    <template #description>
                        <span>没有查询到回源信息</span>
                    </template>
                </a-alert>
            </div>
        </template>

        <!-- WAF/NAT信息 -->
        <!-- WAF信息 -->
        <div v-if="descData.data.waf?.[index]">
            <desc-card
                :desc-data="descData.data.waf?.[index]"
                :desc-fields="descOptions.waf.fields"
                :slots="['access_status']"
                title="WAF信息"
                :arrow="true"
            >
                <template #access_status>
                    <vxe-tag :class="descData.data.waf?.[index]?.access_status == 1 ? 'theme--primary' : 'theme--error'" size="small">
                        {{ descData.data.waf?.[index]?.access_status == 1 ? '接入' : '未接入' }}
                    </vxe-tag>
                </template>
            </desc-card>
        </div>

        <!-- CFW信息 -->
        <div v-if="descData.data.cfw?.[index]?.length">
            <desc-card
                :desc-data="descData.data.cfw?.[index]"
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
                        v-for="(cfw, cfw_index) in descData.data.cfw?.[index]"
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
        <div v-if="descData.data.nat?.[index]?.length">
            <desc-card
                :desc-data="descData.data.nat?.[index]"
                :desc-fields="descOptions.nat.fields"
                :slots="['description']"
                title="NAT信息"
                :arrow="true"
                :custom-item="'customItem'"
                :custom-span="{description: 3}"
            >
                <!-- 描述 -->
                <template #description>
                    <a-tooltip :title="descData.data.nat?.[index]?.reduce((acc, curr) => acc + curr.description + '; ', '')" :overlay-style="tooltipStyle">
                        <div class="truncate">{{ descData.data.nat?.[index]?.reduce((acc, curr) => acc + curr.description + '; ', '') }}</div>
                    </a-tooltip>
                </template>

                <!-- ip列表 -->
                <template #customItem>
                    <a-descriptions-item
                        v-for="(nat, nat_index) in descData.data.nat?.[index]"
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
        </div>
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
