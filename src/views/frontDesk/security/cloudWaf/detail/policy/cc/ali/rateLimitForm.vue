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
    rateLimit: {
        type: Array,
        default: () => [],
    },
    rules: {
        type: Object,
        default: () => {},
    },
});

const formRef = ref([]);

const FieldStatus = reactive({
    code: false,
    count: false,
    ratio: false,
});

const rateLimitTitle = computed(() => {
    let titles = props.editTitle;
    let rateLimit = props.rateLimit[0];

    titles.forEach(item => {
        if(item.field === 'sub_key') {
            item.edit_display = ['cookie', 'queryarg', 'header'].includes(rateLimit.target);
        }
    });

    return titles.filter(item => item.edit_display && item.block === 3);
});

const computeColSpan = (field) => {
    if(['effect', 'ttl'].includes(field)) return 24;
    if(['code', 'ratio', 'count'].includes(field)) return 8;

    let showSubKey = rateLimitTitle.value.find(item => item.field === 'sub_key')?.edit_display;
    return showSubKey ? 6 : 8;
};

const validateForms = () => {
    return Promise.all(formRef.value.map(formRef => formRef.validateFields()));
};

const handleFieldStatusChange = (field) => {
    if(field === 'count') {
        FieldStatus.ratio = false;
    } else if(field === 'ratio') {
        FieldStatus.count = false;
    }
};

defineExpose({
    validateForms,
});
</script>

<template>
    <a-form
        v-for="(form, index) in rateLimit"
        :key="index"
        ref="formRef"
        :model="form"
        :rules="rules"
        class="form-box"
    >
        <a-row :gutter="24">
            <a-col 
                v-for="t in rateLimitTitle" 
                :key="t.field" 
                :span="computeColSpan(t.field)"
            >
                <a-form-item :name="t.field">
                    <div>
                        <a-form-item-rest v-if="['code', 'count', 'ratio'].includes(t.field)">
                            <a-checkbox 
                                v-model:checked="FieldStatus[t.field]"
                                @change="handleFieldStatusChange(t.field)"
                            />
                        </a-form-item-rest>
                        {{ t.field_name }}
                    </div>
        
                    <template v-if="t.field === 'target'">
                        <a-select v-model:value="form[t.field]">
                            <a-select-option v-for="(item, key) in titleData[t.field]" :key="key" :value="key">
                                {{ item }}
                            </a-select-option>
                        </a-select>
                    </template>

                    <template v-else-if="t.field === 'interval'">
                        <a-input-number v-model:value="form[t.field]" :min="5" :max="1800"/>
                    </template>

                    <template v-else-if="t.field === 'threshold'">
                        <a-input-number v-model:value="form[t.field]" :min="0"/>
                    </template>

                    <template v-else-if="t.field === 'code'">
                        <a-input v-model:value="form[t.field]" :disabled="!FieldStatus.code"/>
                    </template>

                    <template v-else-if="t.field === 'count'">
                        <a-input-number v-model:value="form[t.field]" :min="0" :disabled="!FieldStatus.count"/>
                    </template>

                    <template v-else-if="t.field === 'ratio'">
                        <a-input-number v-model:value="form[t.field]" :min="3" :max="50000" :disabled="!FieldStatus.ratio"/>
                    </template>

                    <template v-else-if="t.field === 'effect'">
                        <a-radio-group v-model:value="form[t.field]">
                            <a-radio v-for="(item, key) in titleData[t.field]" :key="key" :value="key">
                                {{ item }}
                            </a-radio>
                        </a-radio-group>
                    </template>

                    <template v-else-if="t.field === 'ttl'">
                        <a-input-number v-model:value="form[t.field]" :min="60" :max="86400" style="width: 200px;"/>
                    </template>
        
                    <template v-else>
                        <a-input v-model:value="form[t.field]"/>
                    </template>
                </a-form-item>
            </a-col>
        </a-row>
    </a-form>
</template>

<style scoped>
.form-box {
    margin-bottom: 8px;
    border: 1px solid #f0f0f0;
    padding: 10px;
    margin-top: 10px;

    .ant-form-item {
        margin-bottom: 10px;
    }

    .ant-input-number {
        width: 100%;
    }
}
</style>