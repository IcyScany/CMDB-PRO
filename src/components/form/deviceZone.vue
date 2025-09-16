<script setup>
import {toRefs, ref, watch} from 'vue';
const props = defineProps({
    initValue: {
        type: String,
        default: '',
    },
    value: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        default: '',
    },
    options: {
        type: [Array, Object],
        default() {
            return [];
        },
    }

});
const {initValue, options, name} = toRefs(props);
const emit = defineEmits(['update:value']);
let str = ref({});
let location = ref('');
let floor = ref('');
let layer = ref('');
let ulayer = ref('');
// 监听初始值的变化
watch(initValue, () => {
    str.value = initValue.value ? initValue.value.split('-') : ['', '', '', ''];
    location.value = str.value[0];
    floor.value = str.value[1] ? str.value[1].indexOf('F') > -1 ? str.value[1].replace('F', '') : str.value[1] : '';
    layer.value = str.value[2];
    ulayer.value = str.value[3] ? str.value[3].indexOf('U') > -1 ? str.value[3].replace('U', '') : str.value[3] : '';
});

// 向父组件更新value
function handleUpdate() {
    if (location.value) { // 只校验第一个仓库字段必填，后面字段可为空
        let result = `${location.value}`;
        if (floor.value) {
            result += `-${floor.value}F`;
        }
        if (layer.value) {
            result += `-${layer.value}`;
        }
        if (ulayer.value) {
            result += `-${ulayer.value }U`;
        }
        emit('update:value', result);
    } else {
        emit('update:value', '');
    }
}
</script>
<template>

    <a-input-group compact>
        <a-select
            v-model:value="location"
            :options="options"
            :allow-clear="true"
            :show-search="true"
            :name="name"
            option-filter-prop="label"
            style="width: 40%; border-left: 0;"
            @change="handleUpdate"
        >
        </a-select>
        <a-input
            style="width: 5%; border-left: 0; pointer-events: none;"
            placeholder="-"
            disabled
        />
        <a-input-number
            v-model:value="floor"
            style="width: 10%; border-left: 0;"
            :name="name"
            @change="handleUpdate"
        />
        <a-input
            style="width: 6%; border-left: 0; pointer-events: none;"
            placeholder="F-"
            disabled
        />

        <a-input
            v-model:value="layer"
            style="width: 15%; border-left: 0; background-color: #fff"
            :name="name"
            @change="handleUpdate"
        />
        <a-input
            style="width: 5%; border-left: 0;"
            placeholder="-"
            disabled
        />

        <a-input
            v-model:value="ulayer"
            style="width: 10%; border-left: 0;"
            @change="handleUpdate"
        />
        <a-input
            style="width: 6%; border-left: 0; pointer-events: none;"
            placeholder="U"
            disabled
        />
        <a-tooltip v-if="initValue" title="点击复制" color="cyan" style="width: 1%" >
            <i v-click-copy="initValue" class="iconfont icon-copy text-primary table-opera-icon"></i>
        </a-tooltip>
    </a-input-group>
</template>

<style scoped lang="less">

</style>
