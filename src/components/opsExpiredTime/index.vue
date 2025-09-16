<script setup>
import {getRemainingDays} from 'xe-utils';

const props = defineProps({
    chargeType: {
        type: String,
        default: '',
    },
    expiredTime: {
        type: String,
        default: '',
    },
    subPage: {
        type: Boolean,
        default: false,
    }
});

const getExpiredClass = () => {
    const remainingDays = getRemainingDays(props.expiredTime);
    return {
        'text-warning': remainingDays < 30,
        'text-error': remainingDays < 10
    };
};

const getExpiredText = () => {
    const restDays = getRemainingDays(props.expiredTime);
    if (restDays <= 0) {
        return restDays === 0 ? '已到期' : `已到期${Math.abs(restDays)}天`;
    }
    const years = Math.floor(restDays / 365);
    const days = Math.floor(restDays % 365);
    return `剩余${years? `${years}年` : ''}${days}天到期`;
};

</script>

<template>
    <!-- 表格展示 -->
    <template v-if="!subPage">
        <!-- 付费类型 -->
        <div v-if="chargeType">{{ chargeType }}</div>
    
        <!-- 到期时间 -->
        <div v-if="expiredTime" :class="getExpiredClass()">
            <a-tooltip :title="expiredTime" :overlay-style="{fontSize: '12px'}">
                <div class="truncate">{{ getExpiredText() }}</div>
            </a-tooltip>
        </div>
    </template>

    <!-- 子页面展示 -->
    <span v-else-if="expiredTime" :class="getExpiredClass()">
        <span>{{ getExpiredText() }}</span>
        <span>(到期时间：{{ expiredTime }})</span>
    </span>
</template>
