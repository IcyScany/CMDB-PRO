<script setup>

defineProps({
    level: {
        type: String,
        default: '',
    }
});


</script>

<template>
    <a-tag :color="$CONFIG?.ALERT_LEVEL_COLOR?.[level.toUpperCase()]?.color">{{level}}</a-tag>
</template>




