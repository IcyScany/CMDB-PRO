<template>
    <div class="resource-card" :style="{ borderColor: color }">
        <div class="card-icon" :style="{ backgroundColor: color }">
            <i :class="'icon-' + icon"></i>
        </div>
        <div class="card-content">
            <div class="card-title">{{ title }}</div>
            <div class="card-value">{{ value }}<span class="card-unit">{{ unit }}</span></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    value: {
        type: [Number, String],
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    }
});
</script>

<style scoped lang="less">
.resource-card {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid;
    transition: all 0.3s;

    &:hover {
        transform: translateX(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        i {
            font-size: 20px;
            color: #fff;
        }
    }

    .card-content {
        .card-title {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.65);
            margin-bottom: 2px;
        }

        .card-value {
            font-size: 20px;
            font-weight: 600;
            color: #1f1f1f;

            .card-unit {
                font-size: 12px;
                margin-left: 4px;
                color: rgba(0, 0, 0, 0.45);
            }
        }
    }
}</style> 