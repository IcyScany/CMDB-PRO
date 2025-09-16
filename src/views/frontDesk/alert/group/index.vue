<script setup>
import OverView from './OverView.vue';
import List from './List.vue';
import Group from './Group.vue';
import Level from './Level.vue';
import DocRenderer from '@/components/common/DocRenderer.vue';



const tabType = [
    {label: '总览', value: 'overview'}, 
    {label: '告警清单', value: 'alert_total_number'},
    {label: '告警分组', value: 'alert_group_number'},
    {label: '告警等级', value: 'alert_level_number'},
    {label: '告警接入', value: 'alert_access'},
];

let tabRef = ref(null);

const handleChange = (item) => {
    nextTick(() => {
        tabRef.value && tabRef.value?.handleClick?.(item);
    });
   
};







</script>

<template>
    <ops-render-tab
        ref="tabRef"
        :tab-type="tabType"
    >
        <template #overview>
            <over-view  @custom-change="handleChange"/>
        </template>
        <template #alert_total_number>
          <list/>
        </template>
        <template #alert_group_number>
            <group/>
        </template>
        <template #alert_level_number>
            <level/>
        </template>
        <template #alert_access>
           <doc-renderer :custom-file-md="{prefix: 'alert', name: 'alert_receive_docs.md'}" />
        </template>
    </ops-render-tab>
</template>