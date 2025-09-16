<script setup>
import { computed } from 'vue';
import { isArray } from 'xe-utils';

// 声明所有可能的事件，包括 touchstartPassive,为解决其子页面控制台出现的警告
defineEmits([
    'contextmenu',
    'click',
    'mousedown',
    'touchstart',
    'touchstartPassive',
    'mouseenter',
    'mouseleave',
    'focus',
    'blur'
]);

const props = defineProps({
    fieldValue: {
        type: [Array, String, Number, null, undefined],
        required: true
    },
    dataSource: {
        type: Object,
        default: () => ({})
    },
    label: {
        type: String,
        default: 'group_name'
    },
    // 是否以破折号分隔
    hyphen: {
        type: Boolean,
        default: true, // true表示以破折号分隔
    }
});
// 判断是否是数组
const isArrayValue = computed(() => isArray(props.fieldValue));
// 计算显示的值
const displayValue = computed(() => {
    if (isArrayValue.value) return '';
    return String(
        props.fieldValue && props.dataSource
            ? props.dataSource?.[props.fieldValue]?.[props.label] || props.fieldValue
            : props.fieldValue
    );
});
// 计算显示的值
const items = computed(() => isArrayValue.value ? props.fieldValue : []);
// 计算是否包含破折号
const hasHyphen = computed(() => displayValue.value.indexOf('-') > -1);
// 计算破折号前的部分
const firstPart = computed(() => hasHyphen.value ? displayValue.value.split('-')[0] : '');
// 计算破折号后的部分
const remainingParts = computed(() => hasHyphen.value ? displayValue.value.split('-').splice(1).join('-') : '');
// 格式化内容
const formatContent = (item) => {
    return String(
        item && props.dataSource
            ? props.dataSource?.[item]?.[props.label] || item
            : item
    );
};
</script>

<template>
    <template v-if="fieldValue">
      <template v-if="isArrayValue">
        <div v-for="item in items" :key="item" style="overflow: hidden">
          <a-tooltip :overlay-style="{ fontSize: '12px' }">
            <template #title>
              {{formatContent(item)}}
            </template>
            <vxe-button
              v-view-virtualteam="String(item)"
              class-name="ml-0 p-0"
              mode="text"
              status="primary"
              style="max-width: 100%;"
            >
              <span class="truncate inline-block">{{formatContent(item)}}</span>
            </vxe-button>
          </a-tooltip>
        </div>
      </template>
      <template v-else>
        <vxe-button
          v-view-virtualteam="String(fieldValue)"
          mode="text"
          status="primary"
          class-name="ml-0 p-0"
        >
          <template v-if="hasHyphen && hyphen">
            <span>
              {{ firstPart }}
              <br />
              {{ remainingParts }}
            </span>
          </template>
          <template v-else>
              {{ displayValue }}
          </template>
        </vxe-button>
      </template>
    </template>
  </template>

<style scoped>
.vxe-button.type--text {
    padding-left: 0px  !important;
}

:deep(.vxe-button--content) {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
}
</style>
  
