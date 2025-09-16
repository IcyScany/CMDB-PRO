<script setup>
const props = defineProps({
    descData: {
        type: Object,
        default: () => ({}),
    },
    descFields: {
        type: Object,
        default: () => ({}),
    },
    slots: {
        type: Array,
        default: () => [],
    },
    customItem: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    arrow: {
        type: Boolean,
        default: false,
    },
    customSpan: {
        type: Object,
        default: () => ({}),
    },
    cardStyle: {
        type: Object,
        default: () => ({}),
    },
});

const { descData, descFields } = toRefs(props);

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
</script>

<template>
    <!-- 箭头 -->
    <div v-if="arrow" class="flex items-center justify-center mt-5 text-primary">
        <svg-icon iconname="icon-a-DownArrow" style="font-size: 50px;"/>
        <span>下一跳</span>
    </div>

    <a-typography-title :level="4">
        <span class="ml-4">{{ title }}</span>
    </a-typography-title>

    <a-card :style="cardStyle">
        <a-descriptions
            :label-style="descStyle.label"
            :content-style="descStyle.content"
        >
            <a-descriptions-item 
                v-for="(label, field) in descFields"
                :key="field"
                :label="label"
                :span="customSpan?.[field] || 1"
            >
                <slot v-if="slots.includes(field)" :name="field"></slot>

                <template v-else>
                    <a-tooltip :title="descData[field]" :overlay-style="tooltipStyle">
                        <div class="truncate" style="max-width: fit-content;">{{ descData[field] }}</div>
                    </a-tooltip>
                </template>
            </a-descriptions-item>

            <slot v-if="customItem" :name="customItem"></slot>
        </a-descriptions>
    </a-card>
</template>
