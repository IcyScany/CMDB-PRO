<script setup>
const props = defineProps({
    data: {
        type: Object,
        default: () => ({}),
    },
    columns: {
        type: Array,
        default: () => [],
    },
    titleData: {
        type: Object,
        default: () => ({}),
    },
});

</script>

<template>
    <a-card :style="{ marginBottom: '20px' }">
        <a-skeleton v-if="data.length === 0" />
        <ops-descriptions
            :data="data"
            :columns="props.columns.filter(col => col?.oriTitle?.block === 1)"
            :column="2"
            :label-style="{
                width: '200px',
                marginRight: '10px',
                color: '#868686'
            }"
            size="small"
        >
            <template #cloud_master_account_id="{row}">
                {{ titleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
            </template>

            <template #charge_type="{row}">
                <ops-expired-time :charge-type="row.charge_type" :expired-time="row.expire_time" :sub-page="true"/>
            </template>

            <template #addresses="{row}">
                <template v-for="item in row.addresses" :key="item.id">
                    <div class="truncate">{{ item.address }} ({{ item.type }} {{ item.scope }})</div>
                </template>
            </template>

            <template #listeners="{row}">
                <template v-for="item in row.listeners" :key="item.id">
                    <div class="truncate">
                        <span class="text-primary">{{ item.name }}</span>
                        <span> ({{ item.protocol }}/{{ item.protocol_port }})</span>
                    </div>
                </template>
            </template>

            <template #enterprise_project_id="{row}">
                {{ titleData?.enterprise_project_id?.[row.enterprise_project_id] || '' }}
            </template>

            <template #edition="{row}">
                {{ titleData?.edition?.[row.edition] || row.edition }}
            </template>
            
            <template #charge_mode="{row}">
                {{ titleData?.charge_mode?.[row.charge_mode] || row.charge_mode }}
            </template>

            <template #modification_protection_status="{row}">
                {{ titleData?.modification_protection_status?.[row.modification_protection_status] || row.modification_protection_status }}
            </template>

            <template #deletion_protection_status="{row}">
                {{ titleData?.deletion_protection_status?.[row.deletion_protection_status] || row.deletion_protection_status }}
            </template>
        </ops-descriptions>
    </a-card>
</template>

<style scoped lang="less">
:deep(.vxe-tag--content) {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
}

.mb-2 {
    &:last-child {
        margin-bottom: 0;
    }
}
</style>
