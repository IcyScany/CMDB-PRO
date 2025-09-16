<script setup>
import { computed, ref, toRefs } from 'vue';
  
const props = defineProps({
    value: {
        type: [Array, String, Number],
        default: undefined
    },
    mode: {
        type: String,
        default: ''
    },
    allowInputValue: {
        type: Boolean,
        default: true
    }
});
  
const emit = defineEmits(['update:value', 'update:mode', 'change']);
  
const { value, mode, allowInputValue } = toRefs(props);
  
const tempValue = computed({
    set: val => emit('update:value', val),
    get: () => value.value
});
  
const tempMode = computed({
    set: val => emit('update:mode', val),
    get: () => mode.value
});
  
const searchText = ref('');
const onSearch = val => {
    // 去除首尾
    const text = val.trim();
    if (text) {
        searchText.value = text;
    }
};
  
const onBlur = () => {
    if (allowInputValue.value && searchText.value) {
        if (tempMode.value === 'multiple') {
            tempValue.value.push(searchText.value);
        } else {
            tempValue.value = searchText.value;
        }
        emit('change', tempValue.value);
        searchText.value = '';
    }
};
  
const onChange = () => {
    emit('change', tempValue.value);
    searchText.value = '';
};
</script>

<template>
    <a-select
      v-bind="$attrs"
      v-model:value="tempValue"
      :mode="tempMode==='multiple' ? 'tags' : tempMode"
      @search="onSearch"
      @blur="onBlur"
      @change="onChange"
    >
        <template v-for="(item, key, index) in $slots" :key="index" #[key]>
            <slot :name="key"></slot>
        </template>
    </a-select>
</template>
  
<style lang="scss" scoped></style>
  