<script setup>
import API from '@/api/network/virtualInterfaces';
import commonApi from '@/api/common';

const state = reactive({
    overviewData: {},
});

const summaryMeta = {
    virtual_interfaces: { label: '云专线总数', color: '#3c79bf', icon: 'kvstore.png', pointer: true, view: '云专线列表', name: 'virtualInterfaces' },
    direct_connects: { label: '云物理接入总数', color: '#e88250', icon: 'kvstore.png', pointer: true, view: '云物理接入列表', name: 'directConnectsPage' },
    virtual_gateway: { label: '虚拟网关总数', color: '#4fb050', icon: 'kvstore.png', pointer: true, view: '虚拟网关列表', name: 'virtualGatewayPage' },
    enterprise_router: { label: '企业路由器总数', color: '#4fb050', icon: 'kvstore.png', pointer: true, view: '企业路由器列表', name: 'enterpriseRouter' },
};

const overviewMeta = {
    vi_region_number: { label: '云专线区域分布', icon: true },
    dc_region_number: { label: '云物理接入区域分布', icon: true },
    vg_region_number: { label: '虚拟网关区域分布', icon: true },
    er_region_number: { label: '企业路由器区域分布', icon: true },
};

const getOverview = async () => {
    let res = await API.getOverview();
    Object.keys(summaryMeta).forEach(key => {
        state.overviewData[key] = [
            {
                count: res[`${key}_number`],
                [key]: summaryMeta[key].label,
            },
        ];
    });

    Object.keys(overviewMeta).forEach(key => {
        state.overviewData[key] = res[key];
    });
};

const sortData = (data) => {
    return data.sort((a, b) => b.count - a.count);
};

const formatData = async () => {
    let cloudRegionList = await commonApi.getCloudRegionList();
    Object.keys(state.overviewData).forEach(key => {
        state.overviewData[key].forEach(item => {
            item.region_id = cloudRegionList[item.region_id] || item.region_id;
        });

        let sortedRegionId = sortData(state.overviewData[key]);
        if(sortedRegionId.length > 5) {
            state.overviewData[key] = sortedRegionId.slice(0, 4);
            state.overviewData[key].push({
                region_id: '其他',
                count: sortedRegionId.slice(4).reduce((acc, item) => acc + item.count, 0),
                other_data: sortedRegionId.slice(4),
            });
        }
    });
};

onMounted(async () => {
    await getOverview();
    await formatData();
});
</script>

<template>
    <div class="overview-container">
        <!-- 统计卡片 -->
        <div class="summary-box">
            <div 
                v-for="(item, key) in summaryMeta" 
                :key="key" 
                class="summary-item"
                :class="{'cursor-pointer': item.pointer}"
                :style="{'--summary-color': item.color}" 
                @click="item.pointer ? $router.push({ name: item.name }) : null"
            >
                <template v-for="(data, label) in state.overviewData[key]" :key="label">
                    <div>
                        <div class="summary-value" :style="{'font-size': key === 'total' ? '32px' : ''}" >
                            {{ data.count }}
                        </div>
                        <div class="summary-title">{{ data[key] }}</div>
                    </div>
                    <img v-if="item.icon" class="summary-icon" :src="`/images/${item.icon}`" >
                    <div class="summary-border"></div>
                </template>
            </div>
        </div>

        <a-card title="资源分布">
            <div class="desc-box">
                <div v-for="(item, key) in overviewMeta" :key="key" class="desc-card">
                    <div class="desc-title">{{ item.label }}</div>
                    <div class="desc-list">
                        <div 
                            v-for="data in state.overviewData?.[key]" 
                            :key="data.label"
                        >
                            <a-tooltip :title="data[key]">
                                <span 
                                    class="desc-label truncate"
                                >
                                    <CloudTypeIcon 
                                        v-if="item.icon" 
                                        :type="data.cloud_source"
                                        style="width: 22px;"
                                    />
                                    {{ data.region_id }}：
                                </span>
                            </a-tooltip>

                            <span class="desc-value">
                                <!-- 其他项 -->
                                <span v-if="data.other_data">
                                    <a-popover placement="right">
                                        <template #content>
                                            <div v-for="(otherItem, o_index) in data.other_data" :key="o_index">
                                                <span style="color: #888;">
                                                    <CloudTypeIcon 
                                                        v-if="item.icon" 
                                                        :type="otherItem.cloud_source"
                                                        style="width: 22px;"
                                                    />
                                                    {{ otherItem.region_id }}:
                                                </span>
                                                {{ otherItem.count }}
                                            </div>
                                        </template>
                                        <span>{{ data.count }}</span>
                                    </a-popover>
                                </span>

                                <span v-else>{{ data.count }}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a-card>
    </div>
</template>

<style scoped lang="less">
.overview-container {
    flex: auto;
    overflow: auto;
    padding: 0 4px;
    padding-bottom: 24px;
}

:deep(.ant-card) {
    margin-top: 14px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.08);

    .ant-card-body {
        padding: 0px 24px 24px 24px;
    }
}

.summary-box {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin: 20px 0;

    .summary-item {
        position: relative;
        flex: 1 1 160px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        padding: 20px 10px;

        .summary-value {
            font-size: 26px;
            font-weight: 600;
            color: var(--summary-color);
            margin-bottom: 8px;
        }

        .summary-title {
            font-size: 14px;
            color: #666;
        }

        .summary-icon {
            width: 40px;
            height: 40px;
            background: var(--summary-color);
            opacity: 0.4;
            border-radius: 8px;

            img {
                width: 100%;
                height: 100%;
            }
        }

        .summary-border {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 90%;
            transform: translateX(5%);
            height: 3px;
            border-radius: 2px;
            background: var(--summary-color);
        }
    }
}

.desc-box {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    justify-content: flex-start;

    .desc-card {
        flex: 1 1 220px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        padding: 16px 18px 12px 18px;
    }
    .desc-title {
        font-weight: 600;
        font-size: 17px;
        margin-bottom: 12px;
        text-align: center;
        color: var(--primary-color);
    }
    .desc-list {
        min-width: 250px;

        div {
            width: 100%;
            display: flex;
            margin-bottom: 8px;
        }
        .two-col {
            display: inline-flex;
            width: 50%;
        }
        .desc-label {
            color: #888;
            font-size: 14px;
            display: inline-block;
            min-width: 100px;
            max-width: 80%;
        }
        .desc-value {
            margin-left: 5px;
            font-size: 15px;
            font-weight: 500;
            color: #333;
        }
    }
}
</style>