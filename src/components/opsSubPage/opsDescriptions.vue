<script setup>
defineProps({
    data: {
        type: Object,
        default: () => ({}),
    },
    columns: {
        type: Array,
        default: () => [],
    },
    commonObjType: {
        type: String,
        default: '',
    }
});

const DESC_STYLE = {
    label: {
        width: '20%',
        marginRight: '10px',
        color: '#868686'
    },
    content: {
        display: 'inline-block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginRight: '10px',
    },
    tooltip: {
        fontSize: '12px',
        maxWidth: '500px',
    },
};
</script>

<template>
    <a-descriptions
        v-bind="$attrs"
        :label-style="DESC_STYLE.label"
        :content-style="DESC_STYLE.content"
        :column="1"
        :colon="false"
        size="small"
    >
        <a-descriptions-item 
            v-for="(col, index) in columns.filter(col => col.field !== 'operation')"
            :key="index"
        >
            <!-- 字段名 -->
            <template #label>
                <slot :name="`${col.field}-label`" :label="col.title">
                    {{ col.title }}
                </slot>
            </template>

            <!-- 字段值 -->
            <slot :name="col.field" :row="data">
                <!-- 常用字段统一展示 -->
               <!-- sub_template_render: 只用于子页面 -->
                <template v-if="(col?.oriTitle?.page_data_source?.template_render || col?.oriTitle?.page_data_source?.sub_template_render) && data[col.field]?.toString()">
                    <VirtualTeamCell
                        v-if="col?.oriTitle?.page_data_source?.template_render?.name === 'opsVirtualTeam'"
                        :field-value="data[col.field]"
                        :data-source="col.title_data?.virtual_team_v3_id || col.title_data?.virtual_teams"
                        :hyphen="false"
                    />
                    <div v-else-if="col?.oriTitle?.page_data_source?.template_render?.name === 'myCloud'" class="flex items-center">
                        <CloudTypeIcon
                            style="width: none; margin-right: 10px;"
                            :type="data[col.field]"
                        />
                        <span v-if="data[col.field] !== '自建'">{{ data[col.field] }}</span>
                    </div>
                    <div v-else-if="col?.oriTitle?.page_data_source?.template_render?.name === 'myPlatform'" class="flex items-center">
                        <SvgIcon
                            :iconname="`icon-${data[col.field]}`"
                        
                            :class="data[col.field] === 'harmonyos' ? 'w-16 h-6 inline-block' : 'w-6 h-6 inline-block'"
                        />
                    </div>
                    <opsStatus
                        v-else-if="col?.oriTitle?.page_data_source?.template_render?.name === 'opsStatus'"
                        :value="data[col.field]"
                        :active-value="col?.oriTitle?.page_data_source?.template_render?.active_value"
                        :transform-rule="col?.oriTitle?.page_data_source?.template_render?.transform_rule"
                    />
                    <UuidNameInfo
                        v-else-if="col?.oriTitle?.page_data_source?.sub_template_render?.name === 'uuidNameRender'" 
                        :obj-type="commonObjType || col?.oriTitle?.page_data_source?.sub_template_render?.obj_type"
                        :uuid="col?.oriTitle?.page_data_source?.sub_template_render?.uuid_field ? data[col?.oriTitle?.page_data_source?.sub_template_render?.uuid_field] : data[col.field]"
                    />

                    <template v-else>
                        {{ data[col.field] }}
                    </template>
                </template>

                <template v-else-if="col.field === 'cloud_master_account_id'">
                    {{ col.title_data?.cloud_master_account_id?.[data[col.field]]?.page_display || '' }}
                </template>

                <template v-else-if="col.field === 'region_id'">
                    <ops-region :row="data" :title-data="col.title_data" :field="col.field" />
                </template>

                <template v-else-if="col.field === 'zone_id'">
                    <ops-region :row="data" :title-data="col.title_data" :field="col.field" />
                </template>

                <!-- 其他字段 -->
                <template v-else>
                    {{ data[col.field] }}
                </template>
            </slot>
        </a-descriptions-item>
    </a-descriptions>
</template>
