<script setup>
const props = defineProps({
    row: {
        type: Object,
        default: () => ({})
    },
    titleData: {
        type: Object,
        default: () => ({})
    },
    field: {
        type: String,
        default: null
    }
});

const regionName = computed(() => {
    return props.titleData?.region_id?.[props.row?.region_id] || props.row?.region_id;
});

const zoneName = (zoneId) => {
    if(!zoneId) return '';

    let zone = '';
    let region = props.row.region_id;

    if(props.row.cloud_source === '华为云') {
        zone = `${zoneId}`.replace(`${region}`, '').toUpperCase();
    } 
    else if(props.row.cloud_source === '阿里云') {
        zone = `${zoneId}`.replace(`${region}-`, '').toUpperCase();
    }

    return zone ? zone + '区' : '';
};
</script>

<template>
    <template v-if="!field || field === 'zone_id'">
        <template v-if="typeof row.zone_id === 'object'">
            <span v-for="(item, index) in row.zone_id" :key="item">
                {{ zoneName(item) }}
                <span v-if="index !== row.zone_id.length - 1">, </span>
            </span>
        </template>
    
        <div v-else>{{ zoneName(row.zone_id) }}</div>
    </template>

    <template v-if="!field || field === 'region_id'">
        <div>{{ regionName }}</div>
    </template>
</template>
