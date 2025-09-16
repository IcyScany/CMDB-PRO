
<script setup>
const props = defineProps({
    type: {
        type: [String, undefined],
        default: ''
    }
});

const CLOUD_TYPE_ICONS = {
    "华为云": "icon-huaweiyun",
    "阿里云": "icon-aliyun",
    "ZDNS": "icon-ZDNS",
};

const iconName = computed(() => CLOUD_TYPE_ICONS?.[props.type] || null);
</script>

<template>
    <SvgIcon v-if="iconName" :iconname="iconName" style="width: 5em" />
    <span v-else>{{ type }}</span>
</template>
  
