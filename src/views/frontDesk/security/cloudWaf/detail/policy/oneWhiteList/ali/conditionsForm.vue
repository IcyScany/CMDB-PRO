<script setup>
const props = defineProps({
    editTitle: {
        type: Array,
        default: () => [],
    },
    titleData: {
        type: Object,
        default: () => {},
    },
    conditions: {
        type: Array,
        default: () => [],
    },
    rules: {
        type: Object,
        default: () => {},
    },
});

const emit = defineEmits(['update:conditions']);

const formRefs = ref([]);
const state = reactive({
    rules: [],
});

const editTitle = computed(() => {
    if(!props.editTitle) return [];

    let titles = props.editTitle;
    titles.forEach(item => {
        if(item.field === 'subKey') {
            item.edit_display = false;
        }
    });

    return titles.filter(item => item.edit_display && item.block === 2);
});

const addForm = () => {
    emit('update:conditions', [...props.conditions, { ignore_case: false }]);
};

const deleteForm = (index) => {
    emit('update:conditions', props.conditions.filter((_, i) => i !== index));
};

const validateForms = () => {
    return Promise.all(formRefs.value.map(formRef => formRef.validateFields()));
};

watch(() => props.conditions, (newVal) => {
    newVal.forEach((item, index) => {
        state.rules[index] = props.rules;
    });
}, { deep: true });

defineExpose({
    validateForms,
});

</script>

<template>
    <a-form
        v-for="(form, index) in conditions"
        :key="index"
        :ref="el => { if(el) formRefs[index] = el }"
        layout="inline"
        :model="form"
        :rules="state.rules[index]"
        class="form-box"
    >
        <a-form-item v-for="t in editTitle" :key="t.field" :name="t.field">
            <div>{{ t.field_name }}</div>

            <template v-if="t.field === 'key'">
                <a-select v-model:value="form[t.field]">
                    <a-select-option v-for="(item, k_index) in titleData[t.field]" :key="k_index" :value="item">
                        {{ item }}
                    </a-select-option>
                </a-select>
            </template>
            
            <template v-else-if="t.field === 'opValue'">
                <a-select v-model:value="form[t.field]">
                    <a-select-option v-for="(item, k_index) in titleData[t.field]" :key="k_index" :value="item">
                        {{ item }}
                    </a-select-option>
                </a-select>
            </template>

            <template v-else>
                <a-input v-model:value="form[t.field]"/>
            </template>
        </a-form-item>

        <span class="del-btn" @click="deleteForm(index)">删除</span>
    </a-form>

    <div style="color: #999">
        <span v-if="conditions.length < 5" class="text-primary cursor-pointer mr-2" @click="addForm">添加条件</span>
        <span>您还可以添加{{ 5 - conditions.length }}个条件。（多个条件同时成立才生效）</span>
    </div>
</template>

<style scoped>
.del-btn {
    margin-top: 15px;
    cursor: pointer;
    color: #999;
}

.form-box {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .ant-form-item {
        flex: 1;
    }
}
</style>