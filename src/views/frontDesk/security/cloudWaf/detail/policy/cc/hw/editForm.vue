<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { policyApi } from "@/api/security/cloudWafApi";
import { ADD_TYPE } from "@/config/globalOption";
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
    rowData: {
        type: Object,
        default: () => ({}),
    },
    editData: {
        type: Object,
        default: () => ({}),
    },
});

const { sid, formType } = toRefs(props);
const emits = defineEmits(['editSuccess', 'editError']);
const { edit, add } = policyApi.cc;

const editTitleLayer = 2;
const formRef = ref(null);
const conditionsRef = ref(null);

const state = reactive({
    limit_num: 0,
    limit_period: 0,
    lock_page: {
        content_type: 'application/json',
        content: ''
    },
    tagIndexType: '',
    timeRange: []
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
} = opsFormInit({ formRef, editTitleLayer, formType, sid, hasEditData, emits, addApi: add, editApi: edit, customSubmitData, customEditData, customSubmit });

const tagOptions = computed(() => {
    return formRenderContent.value.title_data['tag_type'];
});

// 处理编辑title
const editTitle = computed(() => {
    if(!formRenderContent.value?.title) return [];

    let titles = formRenderContent.value?.title;
    let formState = formRenderContent.value?.formState;
    titles.forEach(item => {
        if(item.field === 'unlock_num') {
            item.edit_display = formState['action'] === 'dynamic_block';
        }
        if(item.field === 'lock_time') {
            item.edit_display = formState['action'] === 'block';
        }
        if(item.field === 'lock_page') {
            item.edit_display = ['block', 'dynamic_block'].includes(formState['action']);
        }
        if(item.field === 'tag_index') {
            item.edit_display = formState['tag_type2'] === 'user';
        }
    });

    titles = titles.filter(item => item.edit_display && item.block === 1);
    // 将description放在第二个
    let descriptionIndex = titles.findIndex(item => item.field === 'description');
    if (descriptionIndex !== -1) {
        let description = titles.find(item => item.field === 'description');
        titles.splice(descriptionIndex, 1);
        titles.splice(1, 0, description);
    }
    return titles;
});

// 自定义处理单条数据
function customEditData(data) {
    let formData = data.value;

    // 限速模式
    formData['tag_type2'] = formData['tag_type'];
    formData['tag_type'] = Object.entries(tagOptions.value).find(([, arr]) => 
        arr.map(item => item.value).includes(formData['tag_type2'])
    )?.[0];

    // 条件转为字符串
    formData.conditions.forEach(item => {
        item.contents = item.contents[0];
    });

    // 动作
    formData.action = formData.action?.category;
    return formData;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    // 固定字段
    data['cloud_type'] = 'huawei';
    data['cloud_master_account_id'] = props.rowData.cloud_master_account_id;
    data['sid'] = props.rowData.id;
    data['policy_id'] = props.rowData.cc_policy_id;

    // 限速模式
    data['mode'] = 1;
    if(data['tag_type2'] === 'user') {
        data['tag_type'] = state.tagIndexType;
    } else {
        data['tag_type'] = data['tag_type2'];
        delete data['tag_index'];
    }
    delete data['tag_type2'];

    // 限速次数和周期
    data['limit_num'] = state.limit_num;
    data['limit_period'] = state.limit_period;

    // 拦截措施字段
    data['action'] = { category: data['action'] };
    if(!['block', 'dynamic_block'].includes(data['action'].category)) {
        delete data['lock_time'];
        delete data['unlock_num'];
        delete data['lock_page'];
    } 
    else {
        if(data['action'].category === 'dynamic_block') {
            delete data['lock_time'];
        } else {
            delete data['unlock_num'];
        }
        data['action'].detail = {
            response: {
                content_type: state.lock_page.content_type,
                content: state.lock_page.content
            }
        };
    }

    if(data['timestamp'] === 'custom') {
        data['start'] = state.timeRange[0] ? new Date(state.timeRange[0]).getTime() : undefined;
        data['terminal'] = state.timeRange[1] ? new Date(state.timeRange[1]).getTime() : undefined;
    }
    
    // 删除多余字段
    delete data['timestamp'];
    delete data['limit_num_limit_period'];
    formRenderContent.value.title.filter(item => item.block === 3).forEach(item => {
        delete data[item.field];
    });

    return data;
}

// 自定义处理提交
async function customSubmit(data) {
    try {
        await conditionsRef.value[0].validateForms();

        // 条件内容转为数组
        data['conditions'].forEach(item => {
            item.contents = [item.contents];
            if(item.index === 'all_index') {
                item.check_all_indexes_logic = 1;
                delete item.index;
            }
            else if(item.index === 'any_index') {
                item.check_any_indexes_logic = 2;
                delete item.index;
            }
            else if(item.index === 'custom') {
                item.index = item.customIndex;
            }
            delete item.customIndex;
        });
        await formSubmit(data);
    } catch (error) {
        confirmLoading.value = false;
        emits('editError', error);
    }
};

onMounted(async () => {
    await initForm();
    await formDataInit();
});

// 处理tag_type2的变化
const handleTagTypeChange = ({ target }) => {
    formRenderContent.value.formState['tag_type2'] = tagOptions.value[target.value][0].value;
};

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

            <a-typography-title :level="5">配置防护规则</a-typography-title>
            <template v-for="t in editTitle" :key="t.field">
                <template v-if="t.field === 'tag_type'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]" @change="handleTagTypeChange">
                            <a-radio-button 
                                v-for="(option, key) in tagOptions"
                                :key="key"
                                :value="key"
                            >
                                {{ key }}
                            </a-radio-button>
                        </a-radio-group>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'tag_type2'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio-button 
                                v-for="(option, key) in tagOptions[formRenderContent.formState['tag_type']]" 
                                :key="key" 
                                :value="option.value"
                            >
                                {{ option.label }}
                            </a-radio-button>
                        </a-radio-group>
                        <div style="color: #999">
                            {{ tagOptions[formRenderContent.formState['tag_type']]?.find(item => item.value === formRenderContent.formState[t.field])?.desc }}
                        </div>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'tag_index'">
                    <ops-form-item
                        v-model:value="state.tagIndexType"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="state.tagIndexType">
                            <a-radio-button 
                                v-for="(option, key) in formRenderContent?.title_data?.[t.field]" 
                                :key="key" 
                                :value="option.value"
                            >
                                {{ option.label }}
                            </a-radio-button>
                        </a-radio-group>
                        <a-form-item-rest>
                            <a-input v-model:value="formRenderContent.formState[t.field]" style="width: 250px; margin-left: 10px"></a-input>
                        </a-form-item-rest>
                       
                        <div style="color: #999">
                            {{ formRenderContent?.title_data?.[t.field]?.find(item => item.value === state.tagIndexType)?.desc }}
                        </div>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'conditions'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <conditions-form 
                            ref="conditionsRef"
                            v-model:conditions="formRenderContent.formState[t.field]" 
                            :edit-title="formRenderContent.title" 
                            :title-data="formRenderContent?.title_data"
                            :rules="formRenderContent.rules"
                        />
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'limit_num_limit_period'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <div class="flex items-center">
                            <a-input-number v-model:value="state.limit_num" :min="0" style="margin-right: 10px"/>次
                            <a-form-item-rest>
                                <a-input-number v-model:value="state.limit_period" :min="0" style="margin: 0 10px"/>秒
                            </a-form-item-rest>
                        </div>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'action'">
                    <a-typography-title :level="5">采取防护措施</a-typography-title>
                    <ops-form-item
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]" :options="formRenderContent?.title_data?.[t.field]"/>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'lock_time'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <div class="flex items-center">
                            <a-input-number v-model:value="formRenderContent.formState[t.field]" :min="0" style="margin-right: 10px"/>秒
                        </div>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'unlock_num'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <div class="flex items-center">
                            <a-input-number v-model:value="formRenderContent.formState[t.field]" :min="0" style="margin-right: 10px"/>次
                        </div>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'lock_page'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio value="默认设置">默认设置</a-radio>
                            <a-radio value="自定义">自定义</a-radio>
                        </a-radio-group>

                        <a-form-item-rest v-if="formRenderContent.formState[t.field] === '自定义'">
                            <a-radio-group v-model:value="state.lock_page.content_type" style="margin: 10px 0; display: block">
                                <a-radio-button v-for="option in ['application/json', 'text/html', 'text/xml']" :key="option" :value="option">
                                    {{ option }}
                                </a-radio-button>
                            </a-radio-group>
                            <a-textarea v-model:value="state.lock_page.content"/>
                        </a-form-item-rest>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'timestamp'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio-button value="立即生效">立即生效</a-radio-button>
                            <a-radio-button value="自定义">自定义</a-radio-button>
                        </a-radio-group>
                        <br>

                        <a-form-item-rest v-if="formRenderContent.formState[t.field] === '自定义'">
                            <div class="mt-2">
                                <a-range-picker
                                    v-model:value="state.timeRange"
                                    :show-time="{ format: 'HH:mm:ss' }"
                                    format="YYYY-MM-DD HH:mm:ss"
                                />
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
