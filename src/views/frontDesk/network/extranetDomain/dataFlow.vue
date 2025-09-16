<script setup>
const props = defineProps({
    row: {
        type: Object,
        required: true
    },
    isDesc: {
        type: Boolean,
        default: false
    }
});

const TOOLTIP_STYLE = {
    maxWidth: '500px',
    fontSize: '12px',
};

const SOURCE_CLASS = {
    '源站': 'cyan',
    '华为云OBS': 'obs',
    '阿里云OSS': 'oss',
};

const lastFlowTitle = computed(() => {
    let title = '源站';
    if(props.row.value?.includes('.obs') && props.row.value?.includes('myhuaweicloud.com')) {
        title = '华为云OBS';
    }
    if(props.row.value?.includes('.oss') && props.row.value?.includes('aliyuncs.com')) {
        title = '阿里云OSS';
    }
    return title;
});

// CNAME计算值
const cnameValue = computed(() => {
    if(props.row.cdn_cname || props.row.cloud_protective) {
        return props.row.cdn_cname || props.row.cloud_protective;
    }
    return props.row.value;
});

const dataFlowColumns = computed(() => {
    let columns = [
        { field: 'domain_name', title: '域名' },
        { field: 'cname', title: 'CNAME' },
    ];
    if(props.row.cdn_cname) {
        columns.push({ field: 'cdn_cname', title: `CDN(${props.row.cdn_source})` });
    }
    if(props.row.cloud_protective) {
        columns.push({ field: 'cloud_protective', title: `WAF(${props.row.cloud_source})` });
    }
    if(props.row.cfw_info) {
        columns.push({ field: 'cfw_info', title: 'CFW' });
    }
    columns.push({ field: 'value', title: lastFlowTitle });
    return columns;
});

// 判断是否为IP
const isIp = (value) => {
    if (!value) return false;

    // 简单的 IPv4 验证
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(value)) return false;

    return true;
};
</script>

<template>
    <div v-if="!(!row.cdn_cname && !row.cloud_protective && isIp(row.value))" class="data-flow">
        <!-- !isDesc: 数据流向图 -->
        <template v-if="!isDesc">
            <!-- 域名 -->
            <div class="flow-item bg-red">域名</div>
    
            <!-- CNAME -->
            <a-tooltip :title="cnameValue" :overlay-style="TOOLTIP_STYLE">
                <div class="flow-item bg-orange">CNAME</div>
            </a-tooltip>
    
            <!-- CDN -->
            <template v-if="row.cdn_cname">
                <a-tooltip :overlay-style="TOOLTIP_STYLE">
                    <template #title>
                        <div>CNAME: {{ row.cdn_cname }}</div>
                        <div>端口: {{ row.cdn_port }}</div>
                        <pre>回源地址: {{ JSON.stringify(row.cdn_source_address, null, 2) }}</pre>
                    </template>
                    <div class="flow-item bg-blue">
                        CDN(
                            <span :class="{'text-orange': row.cdn_source === '阿里云'}">{{ row.cdn_source }}</span>
                        )
                    </div>
                </a-tooltip>
            </template>
    
            <!-- WAF,包含多个WAF情况 -->
            <template v-if="row.cloud_protective">
                <a-tooltip v-for="(waf, index) in row?.cloud_protective?.split(';')" :key="index" :overlay-style="TOOLTIP_STYLE">
                    <template #title>
                        <div>CNAME: {{ waf }}</div>
                        <div>端口: {{ row.cloud_protective_port }}</div>
                        <pre>回源地址: {{ JSON.stringify(row.cloud_source_address, null, 2) }}</pre>
                    </template>
                    <div class="flow-item bg-green">
                        WAF(
                            <span :class="{'text-orange': !waf.includes('huawei')}">
                                {{ waf.includes('huawei') ? '华为云' : '阿里云' }}
                            </span>
                        )
                    </div>
                </a-tooltip>
            </template>

            <template v-if="row.cfw_info">
                <a-tooltip :overlay-style="TOOLTIP_STYLE">
                    <template #title>
                        <div v-for="(cfw, index) in row?.cfw_info" :key="index" class="flex gap-2">
                            <div>云来源: {{ cfw?.cloud_source }}</div>
                            <div>已绑定设备名称: {{ cfw?.device_name }}</div>
                            <div>弹性公网IP: {{ cfw?.public_ip }}</div>
                        </div>
                    </template>
                    <div class="flow-item bg-yellow">
                        CFW
                    </div>
                </a-tooltip>
            </template>
    
            <!-- 数据流向终点 -->
            <a-tooltip
                :title="row.value"
                :overlay-style="TOOLTIP_STYLE"
            >
                <div class="flow-item" :class="`bg-${SOURCE_CLASS[lastFlowTitle]}`">{{ lastFlowTitle }}</div>
            </a-tooltip>
        </template>


        <!-- isDesc: 描述展示 -->
        <template v-else>
            <a-card>
                <ops-descriptions :columns="dataFlowColumns" :column="1">
                    <template #domain_name-label="{ label }">
                        <div class="flow-item bg-red">{{ label }}</div>
                    </template>
                    <template #domain_name>
                        {{ row.domain_name }}.{{ row.domain_suffix }}
                    </template>
    
                    <template #cname-label="{ label }">
                        <div class="flow-item bg-orange">{{ label }}</div>
                    </template>
                    <template #cname>
                        <div class="absolute">
                            <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ cnameValue }}</a-typography-paragraph>
                        </div>                    
                    </template>
    
                    <template #cdn_cname-label>
                        <div class="flow-item bg-blue">
                            CDN(
                                <span :class="{'text-orange': row.cdn_source === '阿里云'}">{{ row.cdn_source }}</span>
                            )
                        </div>
                    </template>
                    <template #cdn_cname>
                        <div><span class="font-bold">CNAME: </span>{{ row.cdn_cname }}</div>
                        <div><span class="font-bold">端口: </span>{{ row.cdn_port }}</div>
                        <pre><span class="font-bold">回源地址: </span>{{ JSON.stringify(row.cdn_source_address, null, 2) }}</pre>
                    </template>
    
                    <template #cloud_protective-label>
                        <div class="flow-item bg-green">
                            WAF(
                                <span :class="{'text-orange': !row.cloud_protective.includes('huawei')}">
                                    {{ row.cloud_protective.includes('huawei') ? '华为云' : '阿里云' }}
                                </span>
                            )
                        </div>
                    </template>
                    <template #cloud_protective>
                        <div><span class="font-bold">CNAME: </span>{{ row.cloud_protective }}</div>
                        <div><span class="font-bold">端口: </span>{{ row.cloud_protective_port }}</div>
                        <pre><span class="font-bold">回源地址: </span>{{ JSON.stringify(row.cloud_source_address, null, 2) }}</pre>
                    </template>

                    <template #cfw_info-label>
                        <div class="flow-item bg-yellow">
                            CFW
                        </div>
                    </template>
                    <template #cfw_info>
                        <div v-for="(cfw, index) in row?.cfw_info" :key="index" class="flex gap-3">
                            <div><span class="font-bold">云来源</span>: {{ cfw?.cloud_source }}</div>
                            <div><span class="font-bold">已绑定设备名称</span>: {{ cfw?.device_name }}</div>
                            <div><span class="font-bold">弹性公网IP</span>: {{ cfw?.public_ip }}</div>
                        </div>
                    </template>
                    
                    <template #value-label="{ label }">
                        <div class="flow-item" :class="`bg-${SOURCE_CLASS[lastFlowTitle]}`">{{ label }}</div>
                    </template>
                    <template #value>
                        <a-tooltip :overlay-style="TOOLTIP_STYLE" :title="row.value">
                            <span class="truncate inline-block" style="max-width: 100%;">{{ row.value }}</span>
                        </a-tooltip>
                    </template>
                </ops-descriptions>
            </a-card>
        </template>
    </div>
</template>

<style scoped lang="scss">
.data-flow {
    display: flex;
    align-items: center;

    .flow-item {
        position: relative;
        margin-right: 35px;
        font-size: 12px;
        color: #fff;
        padding: 4px 10px;
        border-radius: 18px;

        &:not(:last-of-type):after {
            content: '';
            display: inline-block;
            width: 30px;
            height: 2px;
            background-color: #6ea5f7;
            position: absolute;
            left: 100%;
            top: 50%;
        }

        // 添加箭头样式
        &:not(:last-of-type):before {
            content: '';
            display: inline-block;
            position: absolute;
            left: calc(100% + 27px);  // 横线宽度后的位置
            top: 52%;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 5px 0 5px 8px;  // 三角形箭头大小
            border-color: transparent transparent transparent #6ea5f7;
            transform: translateY(-50%);
        }
    }
}

:deep(.ant-card) {
    margin-top: 20px;
    .ant-card-body {
        padding: 0 5px;

        .ant-descriptions {
            margin-top: 10px;
            padding: 0px;
        }
    }
}

// 定义颜色变量映射
$colors: (
    'red': var(--red-4),
    'orange': var(--orange-6),
    'blue': var(--blue-4),
    'green': var(--green-5),
    'yellow': var(--gold-4),
    'cyan': #08979c,
    'obs': #a84bc0,
    'oss': rgba(55, 24, 255, 0.53)
);

// 生成背景色和文字颜色类
@each $name, $color in $colors {
    .bg-#{$name} {
        background-color: if($name == 'orange', var(--orange-4), $color);
    }
    
    .text-#{$name} {
        color: $color;
    }
}

.font-bold {
    font-weight: bold;
}

:deep(.ant-typography-copy) {
    position: absolute;
    left: -25px;
}
</style>