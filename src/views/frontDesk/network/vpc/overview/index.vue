<script setup>
import vpcApi from '@/api/network/vpcApi';
import commonApi from '@/api/common';

const state = reactive({
    overviewData: {},
});

const summaryMeta = {
    vpc: { label: 'VPC总数', color: '#4fb050', icon: 'kvstore.png', pointer: true, view: 'VPC列表', name: 'vpcPage' },
    vpc_subnet: { label: 'VPC子网总数', color: '#e88250', icon: 'kvstore.png', pointer: true, view: 'VPC子网', name: 'vpcSubnet' },
    vpc_route: { label: 'VPC路由总数', color: '#3c79bf', icon: 'kvstore.png', pointer: true, view: 'VPC路由', name: 'vpcRoute' },
    vpc_peering: { label: 'VPC对等连接总数', color: '#4fb050', icon: 'kvstore.png', pointer: true, view: 'VPC对等连接', name: 'vpcPeering' },
};

const overviewMeta = {
    vpc_region_number: { label: 'VPC区域分布', icon: true },
    vpc_subnet_region_number: { label: 'VPC子网区域分布', icon: true },
    vpc_route_region_number: { label: 'VPC路由区域分布', icon: true },
    vpc_peering_region_number: { label: 'VPC对等连接区域分布', icon: true },
};

const getOverview = async () => {
    let res = await vpcApi.getOverview();
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

const handleRouteLink = () => {
    window.open('/network/vpc/route-link/page', '_blank');
};

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

        <a-card title="路由链路图">
            <a-button type="primary" @click="handleRouteLink">
                <ApartmentOutlined />查看路由链路图
            </a-button>
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