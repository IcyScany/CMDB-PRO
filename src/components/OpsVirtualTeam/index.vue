<script setup>
import { computed } from 'vue';
import { isArray } from "xe-utils";
  
const props = defineProps({
    field: {
        type: String,
        required: true
    },
    rowData: {
        type: Object,
        required: true
    },
    dataSource: {
        type: Object,
        default: () => ({})
    },
    labelKey: {
        type: String,
        default: 'group_name'
    }
});

// 处理数组类型数据
const itemList = computed(() => {
    return props.rowData[props.field].map(item => ({
        content: String(item && props.dataSource 
            ? props.dataSource?.[props.field]?.[item]?.[props.labelKey] || item 
            : item),
        value: item
    }));
});
  
// 处理单个值
const singleResult = computed(() => {
    const value = props.rowData[props.field];
    return String(value && props.dataSource 
        ? props.dataSource?.[props.field]?.[value]?.[props.labelKey] || value 
        : value);
});
  
// 连字符处理
const hasHyphen = computed(() => singleResult.value.indexOf('-') > -1);
const hyphenParts = computed(() => {
    const parts = singleResult.value.split('-');
    return [parts[0], parts.slice(1).join('-')];
});
</script>

<template>
    <template v-if="rowData[field]">
        <template v-if="isArray(rowData[field])">
        <div 
            v-for="(item, index) in itemList" 
            :key="index" 
            style="overflow: hidden"
        >
            <VxeButton 
            v-view-virtualteam="String(item.value)" 
            style="padding: 0" 
            :content="item.content" 
            mode="text" 
            status="primary"
            />
        </div>
        </template>
        <template v-else>
        <VxeButton 
            v-view-virtualteam="String(rowData[field])" 
            mode="text" 
            status="primary"
        >
            <span v-if="hasHyphen">
            {{ hyphenParts[0] }}<br/>{{ hyphenParts[1] }}
            </span>
            <span v-else>{{ singleResult }}</span>
        </VxeButton>
        </template>
    </template>
</template>
  