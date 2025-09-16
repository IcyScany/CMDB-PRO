<script setup>
import API from '@/api/monitor/expireRemind';

const state = reactive({
    overviewData: {},
});

const summaryMeta = {
    total: { label: '总数', color: '#4fb050', icon: 'kvstore.png', pointer: true, name: 'expireRemindPage' },
    expire_days: { label: '到期天数', color: '#e88250' },
    status: { label: '状态', color: '#e88250' },
};

const overviewMeta = {
    environment: { label: '环境分布' },
};

// 获取数据
const getData = async () => {
    const res = await API.getOverview({
        "expire_days": [10, 30],
        "group_by_fields": [
            [
                "environment"
            ],
            [
                "status"
            ]
        ],
    });

    // 总数
    state.overviewData.total = [
        {
            total: '总数',
            count: res.count,
        },
    ];

    // 资源分布
    res.group_by.forEach(item => {
        let filed = item.fields[0];
        let data = item.items.sort((a, b) => b.count - a.count);

        state.overviewData[filed] = data;
    });

    // 处理到期天数
    state.overviewData.expire_days = res.expire_days.map(item => {
        return {
            expire_days: `即将过期（小于${item.days}天）`,
            count: item.items.length,
        };
    });
};

// 格式化数据
const formatData = async    () => {
    let data = state.overviewData;

    // 处理空值
    Object.entries(data).forEach(([key, value]) => {
        value.forEach(item => {
            if(!item[key]) {
                item[key] = '其他';
            }
        });
    });
};

onMounted(async () => {
    await getData();
    await formatData();
});
</script>

<template>
    <a-empty v-if="state.overviewData.total?.[0]?.count === 0" class="mt-10"/>

    <div v-else class="overview-container">
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

        <!-- 描述列表分布 -->
        <a-card title="资源分布">
            <div class="desc-box">
                <div v-for="(item, key) in overviewMeta" :key="key" class="desc-card">
                    <div class="desc-title">{{ item.label }}</div>
                    <div class="desc-list">
                        <div 
                            v-for="data in state.overviewData?.[key]" 
                            :key="data.label"
                            :class="{ 'two-col': key === 'spec_code' }"
                        >
                            <a-tooltip :title="data[key]">
                                <span 
                                    class="desc-label truncate"
                                >
                                    <CloudTypeIcon 
                                        v-if="item.icon && !(key === 'cloud_source' && data.cloud_source === '自建')" 
                                        :type="data.cloud_source"
                                        style="width: 22px;"
                                    />
                                    {{ data[key] }}：
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
                                                    {{ otherItem[key] }}:
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
