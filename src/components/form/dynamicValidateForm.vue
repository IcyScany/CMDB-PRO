<script setup>
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons-vue';
import {onMounted, toRefs, ref} from "vue";

const props = defineProps({
    value: {
        type: Array,
        default() {
            return [];
        },
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        default: '',
    },
    rules: {
        type: Object,
        default() {
            return {};
        }
    }
});
const { value, name } = toRefs(props);
let keyIndex = ref(0);

onMounted(() => {
    keyIndex.value = 0;
});

const addItem = () => {
    keyIndex.value ++;
    value.value.push({
        value: '',
        item_key: `${name.value}_item_${keyIndex.value}`
    });
};

const removeItem = (item) => {
    let index = value.value.indexOf(item);
    if (index !== -1) {
        keyIndex.value --;
        value.value.splice(index, 1);

    }
};
</script>
<template>
<div>
    <a-form-item
        v-for="(item) in value"
        :key="item.value"
        :name="name"
        :rules="rules"
    >
        <a-input
            v-model:value="item.value"
            :placeholder="`请输入 ${name}`"
            style="width: 60%; margin-right: 8px"
        />
        <MinusCircleOutlined
            v-if="value.length > 1"
            class="dynamic-delete-button"
            :disabled="value.length === 1"
            @click="removeItem(item)"
        />
    </a-form-item>
    <a-form-item >
        <a-button type="dashed" style="width: 60%" @click="addItem">
            <PlusOutlined />
            新增
        </a-button>
    </a-form-item>
</div>
</template>

<style scoped>

</style>