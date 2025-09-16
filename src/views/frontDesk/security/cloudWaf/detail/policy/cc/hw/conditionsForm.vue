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

const indexTypes = {
    'all_index': '所有子字段',
    'any_index': '任意子字段',
    'custom': '自定义',
};

const addForm = () => {
    emit('update:conditions', [...props.conditions, { ignore_case: false }]);
};

const deleteForm = (index) => {
    emit('update:conditions', props.conditions.filter((_, i) => i !== index));
};

const validateForms = () => {
    return Promise.all(formRefs.value.map(formRef => formRef.validateFields()));
};

const handleCategoryChange = (value, index) => {
    let conditions = [...props.conditions];
    conditions[index].index = '';
    emit('update:conditions', conditions);
};

watch(() => props.conditions, (newVal) => {
    newVal.forEach((item, index) => {
        state.rules[index] = props.rules;

        let needIndex = ['params', 'cookie', 'header', 'ip', 'ipv6'].includes(item['category']);
        item.index = needIndex ? item.index : '';
        state.rules[index]['index'][0].required = needIndex;

        let needContents = !['any', 'all'].includes(item['logic_operation']?.split('_')?.at(-1));
        item.contents = needContents ? item.contents : '';
        state.rules[index]['contents'][0].required = needContents;

        let needIgnoreCase = !['ip', 'ipv6'].includes(item['category']);
        item.ignore_case = needIgnoreCase ? item.ignore_case : false;
        state.rules[index]['ignore_case'][0].required = needIgnoreCase;
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
        <a-form-item v-for="t in editTitle.filter(item => item.block === 3)" :key="t.field" :name="t.field">
            <div>{{ t.field_name }}</div>
            <template v-if="t.field === 'category'">
                <a-select v-model:value="form[t.field]" @change="val => handleCategoryChange(val, index)">
                    <a-select-option v-for="(label, key) in titleData[t.field]" :key="key" :value="key">
                        {{ label }}
                    </a-select-option>
                </a-select>
            </template>

            <template v-else-if="t.field === 'ignore_case'">
                <a-switch v-if="!['ip', 'ipv6'].includes(form['category'])" v-model:checked="form[t.field]"/>
                <span v-else>--</span>
            </template>

            <template v-else-if="t.field === 'logic_operation'">
                <a-select v-model:value="form[t.field]">
                    <a-select-option 
                        v-for="(label, key) in titleData[t.field]?.[form['category']]" 
                        :key="key" 
                        :value="key"
                    >
                        {{ label }}
                    </a-select-option>
                </a-select>
            </template>

            <template v-else-if="t.field === 'index'">
                <template v-if="['ip', 'ipv6'].includes(form['category'])">
                    <a-select v-model:value="form[t.field]">
                        <a-select-option v-for="(label, key) in titleData[t.field]" :key="key" :value="key">
                            {{ label }}
                        </a-select-option>
                    </a-select>
                </template>

                <template v-else>
                    <a-select v-model:value="form[t.field]" :disabled="form['category'] === 'url'">
                        <a-select-option v-for="(label, key) in indexTypes" :key="key" :value="key">
                            {{ label }}
                        </a-select-option>
                    </a-select>

                    <a-form-item-rest v-if="form[t.field] === 'custom'">
                        <a-input v-model:value="form['customIndex']" style="margin-top: 5px"/>
                    </a-form-item-rest>
                </template>
            </template>

            <template v-else-if="t.field === 'contents'">
                <a-input
                    v-model:value="form[t.field]"
                    :disabled="['all', 'any'].includes(form['logic_operation']?.split('_')?.at(-1))"
                />
            </template>

            <template v-else>
                <a-input v-model:value="form[t.field]"/>
            </template>
        </a-form-item>

        <span class="del-btn" @click="deleteForm(index)">删除</span>
    </a-form>

    <div style="color: #999">
        <span v-if="conditions.length < 30" class="text-primary cursor-pointer mr-2" @click="addForm">添加条件</span>
        <span>您还可以添加{{ 30 - conditions.length }}个条件。（多个条件同时成立才生效）</span>
    </div>
</template>

<style scoped>
.del-btn {
    cursor: pointer;
    color: #999;
    position: relative;
    top: 25px;
}

.form-box {
    margin-bottom: 8px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    .ant-form-item {
        flex: 1;
    }
}
</style>