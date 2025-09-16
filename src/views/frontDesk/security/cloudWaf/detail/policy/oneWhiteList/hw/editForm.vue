<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { policyApi } from "@/api/security/cloudWafApi";
import { ADD_TYPE } from "@/config/globalOption";
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
import ConditionsForm from "./conditionsForm.vue";
import { clone } from "xe-utils";
import HwTemplate from "../../components/hwTemplate.vue";

const props = defineProps({
    sid: { 
        type: [String, Number], 
        default: '', 
    },
    formType: { 
        type: Number,
        default: ADD_TYPE
    },
    editData: {
        type: Object,
        default: () => ({})
    },
    rowData: {
        type: Object,
        default: () => ({})
    }
});

const { sid, formType } = toRefs(props);
const emits = defineEmits(['editSuccess', 'editError']);
const { add, edit } = policyApi.ignore;

const editTitleLayer = 3;
const formRef = ref(null);
const conditionsRef = ref([]);

const advancedOptions = [
    { label: 'Body', value: 'body' },
    { label: 'Cookie', value: 'cookie' },
    { label: 'Header', value: 'header' },
    { label: 'Params', value: 'params' },
    { label: 'Multipart', value: 'multipart' },
];

const filedTypeOptions = [
    { label: '全部', value: 'all' },
    { label: '自定义', value: 'custom' },
];

const advancedData = ref({
    index: '',
    filedType: '',
    filedValue: '',
});

const hasEditData = computed(() => {
    return clone(props.editData, true);
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
    formSubmit
} = opsFormInit({formRef, editTitleLayer, formType, sid, hasEditData, emits, addApi: add, editApi: edit, customSubmit, customSubmitData, customEditData});

const editTitle = computed(() => {
    if(!formRenderContent.value?.title) return [];

    let titles = formRenderContent.value.title;
    let formState = formRenderContent.value.formState;

    titles.forEach(item => {
        if (item.field === 'domain') {
            item.edit_display = formState.protect_type === '指定域名';
        }
        if (item.field === 'not_check_mode') {
            item.edit_display = formState.not_check_module === 'Web基础防护模块';
        }
        if (item.field === 'not_check_type') {
            item.edit_display = formState.not_check_module === 'Web基础防护模块' && formState.not_check_mode === '按类别';
        }
        if (item.field === 'not_check_id') {
            item.edit_display = formState.not_check_module === 'Web基础防护模块' && formState.not_check_mode === '按ID';
        }
        if (item.field === 'advanced') {
            item.edit_display = formState.not_check_module === 'Web基础防护模块';
        }
    });

    titles = titles.filter(item => item.edit_display && item.block === 1);
    return titles;
});

const to2DArray = (arr) => {
    if (!Array.isArray(arr)) return [[]];
    if (arr.length === 0) return [[]];
    if (Array.isArray(arr[0])) return arr;
    return [arr];
};

// 自定义处理单条数据
function customEditData(data) {
    let formData = data.value;
    let titleData = formRenderContent.value.title_data;

    if(formData.domain) {
        formData.protect_type = '指定域名';
    }
    
    if(titleData.not_check_type[props.editData.rule]) {
        formData.not_check_module = 'Web基础防护模块';
        formData.not_check_mode = '按类别';
        formData.not_check_type = props.editData.rule.split(';');
        formData.advanced = titleData.advanced;
    }

    formData.conditions = to2DArray(formData.conditions);
    formData.conditions.forEach(item => {
        item.forEach(item2 => {
            item2.contents = item2.contents[0];
        });
    });

    return formData;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    // 固定字段
    data['cloud_type'] = 'huawei';
    data['cloud_master_account_id'] = props.rowData.cloud_master_account_id;
    data['sid'] = props.rowData.id;
    data['policy_id'] = props.rowData.cc_policy_id;
    data['rule_id'] = props.editData.id;

    // 域名
    data['domain'] = data['domain'].filter(item => item);

    // 规则
    if(data['not_check_module'] === '所有检测模块') {
        data['rule'] = 'bypass';
    }
    else if(data['not_check_module'] === 'Web基础防护模块' && data['not_check_mode'] === '按类别') {
        data['rule'] = data['not_check_type'].join(';');
    }
    else if(data['not_check_module'] === 'Web基础防护模块' && data['not_check_mode'] === '按ID') {
        data['rule'] = data['not_check_id'].join(';');
    }
    else if(data['not_check_module'] === 'Web基础防护模块' && data['not_check_mode'] === '所有内置规则') {
        data['rule'] = 'all';
    }
    else if(data['not_check_module'] === '非法请求') {
        data['rule'] = 'illegal';
    }

    if(data['not_check_module'] === 'Web基础防护模块') {
        data['advanced'] = {
            index: advancedData.index,
            contents: advancedData.filedValue,
        };
    } else {
        delete data['advanced'];
    }

    delete data['not_check_module'];
    delete data['not_check_mode'];
    delete data['not_check_type'];
    delete data['not_check_id'];

    return data;
}

// 自定义处理提交
async function customSubmit(data) {
    let submitData = clone(data, true);
    try {
        await Promise.all(conditionsRef.value.map(item => item.validateForms()))
            .then(() => {
                // 条件内容转为数组
                submitData['conditions'].forEach(condition => {
                    condition.forEach(item => {
                        item.contents = [item.contents];
                        delete item.index_type;
                    });
                });
                formSubmit(submitData);
            });
    } catch (error) {
        confirmLoading.value = false;
        emits('editError', error);
    }
};

// 保护类型切换
const handleProtectTypeChange = ({ target }) => {
    if (target.value === '指定域名') {
        formRenderContent.value.formState.domain = [''];
    }
};

// 添加域名
const addDomain = () => {
    formRenderContent.value.formState.domain.push('');
};

// 删除域名
const removeDomain = (index) => {
    formRenderContent.value.formState.domain.splice(index, 1);
};

// 添加条件
const addConditions = () => {
    formRenderContent.value.formState.conditions.push([{}]);
};

// 删除条件
const removeConditions = (index) => {
    formRenderContent.value.formState.conditions.splice(index, 1);
};

// 高级选项切换
const handleAdvancedChange = (value) => {
    if(['body', 'multipart'].includes(value)) {
        advancedData.value.filedType = 'all';
    }
};

watch(() => formRenderContent.value.formState?.not_check_type, (newVal) => {
    if(newVal.includes('all') && newVal.length > 1) {
        formRenderContent.value.formState.not_check_type = ['all'];
    }
});

onMounted(async () => {
    await initForm();
    await formDataInit();
});

defineExpose({
    editSubmit,
    loading: confirmLoading
});

</script>

<template>
    <a-spin :spinning="formDataLoading">
        <a-form
            ref="formRef"
            :model="formRenderContent.formState"
            :rules="formRenderContent.rules"
        >
            <hw-template :row-data="rowData" />

            <template v-for="t in editTitle" :key="t.field">
                <template v-if="t.field === 'protect_type'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]" @change="handleProtectTypeChange">
                            <a-radio-button 
                                v-for="(item) in ['全部域名', '指定域名']"
                                :key="item"
                                :value="item"
                            >
                                {{ item }}
                            </a-radio-button>
                        </a-radio-group>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'domain'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-form-item-rest v-for="(item, index) in formRenderContent.formState[t.field]" :key="index">
                            <div class="log-path-input">
                                <a-input v-model:value="formRenderContent.formState[t.field][index]"/>
                                <PlusCircleOutlined @click="addDomain(index)" />
                                <MinusCircleOutlined v-if="formRenderContent.formState[t.field].length > 1" @click="removeDomain(index)" />
                            </div>
                        </a-form-item-rest>
                    </ops-form-item>
                </template>
                
                <template v-else-if="t.field === 'conditions'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-card v-for="(item, index) in formRenderContent.formState[t.field]" :key="index" class="conditions-card">
                            <span v-if="formRenderContent.formState[t.field].length > 0" class="text-warning conditions-delete" @click="removeConditions(index)">
                                <MinusCircleOutlined />
                                删除
                            </span>
                            <conditions-form
                                :ref="el => { if(el) conditionsRef[index] = el }"
                                v-model:conditions="formRenderContent.formState[t.field][index]" 
                                :edit-title="formRenderContent.title" 
                                :title-data="formRenderContent?.title_data"
                                :rules="formRenderContent.rules"
                            />
                        </a-card>

                        <div style="color: #999; margin-top: 10px;">
                            <span v-if="formRenderContent.formState[t.field].length < 3" class="text-primary cursor-pointer mr-2" @click="addConditions">添加</span>
                            <span>您还可以添加{{ 3 - formRenderContent.formState[t.field].length }}组“或”条件</span>
                        </div>                        
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'not_check_module'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio v-for="item in formRenderContent.title_data[t.field]" :key="item" :value="item">
                                {{ item }}
                            </a-radio>
                        </a-radio-group>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'not_check_mode'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio v-for="item in formRenderContent.title_data[t.field]" :key="item" :value="item">
                                {{ item }}
                            </a-radio>
                        </a-radio-group>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'advanced'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-switch v-model:checked="formRenderContent.formState[t.field]" />

                        <a-form-item-rest v-if="formRenderContent.formState[t.field]">
                            <div class="flex items-center gap-2 mt-2">
                                <a-select
                                    v-model:value="advancedData.index" 
                                    :options="advancedOptions"
                                    @change="handleAdvancedChange"
                                />

                                <a-select 
                                    v-model:value="advancedData.filedType" 
                                    :options="filedTypeOptions" 
                                    :disabled="['body', 'multipart'].includes(advancedData.index)"
                                />

                                <a-input v-if="advancedData.filedType === 'custom'" v-model:value="advancedData.filedValue" />
                            </div>
                        </a-form-item-rest>
                    </ops-form-item>
                </template>

                <ops-form-item
                    v-else
                    v-model:value="formRenderContent.formState[t.field]"
                    :title="t"
                    :title-data="formRenderContent?.title_data?.[t.field]"
                >
                </ops-form-item>
            </template>
        </a-form>
    </a-spin>
</template>

<style lang="scss" scoped>
.log-path-input {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    .anticon {
        font-size: 16px;
        cursor: pointer;
    }
}

.conditions-card {
    margin-bottom: 10px;

    :deep(.ant-card-body) {
        padding: 5px 15px;
        padding-top: 25px;
    }

    .conditions-delete {
        cursor: pointer;
        position: absolute;
        right: 15px;
        top: 10px;
    }
}
</style>
