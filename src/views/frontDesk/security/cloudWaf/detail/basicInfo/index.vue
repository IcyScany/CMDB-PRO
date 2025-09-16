<script setup>
defineProps({
    data: {
        type: Object,
        default: () => {}
    },
    columns: {
        type: Array,
        default: () => []
    },
    column: {
        type: Number,
        default: 1
    },
    titleData: {
        type: Object,
        default: () => {}
    }
});

</script>

<template>
    <ops-descriptions
        :title="null"
        :data="data"
        :columns="columns"
        :column="column"
        size="small"
    >
        <template #cloud_source="{ row }">
            <CloudTypeIcon
                style="width: none; margin-right: 4px;"
                :type="row.cloud_source"
            />
            <span>{{ row.cloud_source }}</span>
        </template>

        <template #policy="{ row }">
            <a-tooltip>
                <template #title>
                    <span class="text-12">{{ Object.keys(row.policy || {})[0] }}</span>
                </template>
                <div class="truncate inline">{{ Object.keys(row.policy || {})[0] }}</div>
            </a-tooltip>
        </template>

        <template #access_status="{ row }">
            <vxe-tag :class="row.access_status == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.access_status == 1 ? '接入' : '未接入' }}
            </vxe-tag>
        </template>

        <template #protect_status="{ row }">
            <vxe-tag :class="row.protect_status == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.protect_status == 1 ? '开启防护' : row.protect_status == 0 ? '暂停防护' : 'bypass' }}
            </vxe-tag>
        </template>

        <template #proxy="{ row }">
            <vxe-tag :class="row.proxy == 1 ? 'theme--primary' : 'theme--error'" size="small">
                {{ row.proxy == 1 ? '是' : '否' }}
            </vxe-tag>
        </template>

        <template #cloud_master_account_id="{row}">
            {{ titleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
        </template>
    </ops-descriptions>
</template>