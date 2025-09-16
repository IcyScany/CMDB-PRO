<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import API from "@/api/monitor/logMonitor";
import { ADD_TYPE, EDIT_TYPE } from "@/config/globalOption";

const props = defineProps({
    open: { 
        type: Boolean, 
        default: false, 
    },
    sid: { 
        type: [String, Number], 
        default: '', 
    },
    formType: { 
        type: Number,
        default: ADD_TYPE
    },
});

const { open, sid, formType } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);

const editTitleLayer = 1;
const formRef = ref(null);
const { putEdit, getDetail, postAdd, getDataSource, getDataSourceIndex } = API;

const ALERT_LEVEL = ['P0', 'P1', 'P2', 'P3']; // 告警级别

const state = reactive({
    ruleLogic: 'and',
    dataSourceOptions: {},
    dataIndexOptions: [],
    dataSourceId: null
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, addApi: postAdd, editApi: putEdit, oneDataApi: getDetail, customSubmitData, customEditData});

const editTitle = computed(() => {
    const titles = (formRenderContent.value.title || []).filter(t => t.edit_display);
    const formState = formRenderContent.value.formState;

    return titles.map(t => {
        if(t.field === 'alert_rule_app_name') {
            if(formState.data_source !== 'Elasticsearch') {
                t.page_data_source.tooltip_level = {
                    "type": "warning",
                    "description": "选择从那些Topic中消费消息，每个Topic单独统计和单独告警"
                };
            }
            else {
                t.page_data_source.tooltip_level = {
                    "type": "warning",
                    "description": "索引后面的序号请使用*表示"
                };
            }
        }
        return t;
    });
});

// 自定义处理单条数据
function customEditData(data) {
    data.value.alert_rule_time = [data.value.alert_rule.alert_time.start_time, data.value.alert_rule.alert_time.end_time];
    data.value.alert_rule_app_name = data.value.alert_rule.data_index;
    data.value.alert_rule_conditions = data.value.alert_rule.alert_conditions;
    state.ruleLogic = data.value.alert_rule?.type;

    state.dataSourceId = data.value.data_source.id;
    data.value.data_source = data.value.data_source.data_source;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    const dataSource = state.dataSourceOptions?.[data.data_source].find(item => item.value === state.dataSourceId).data;
    dataSource.data_source = data.data_source;
    data.data_source = dataSource;

    data.alert_rule = {
        alert_time: {
            start_time: data.alert_rule_time[0],
            end_time: data.alert_rule_time[1]
        },
        data_index: data.alert_rule_app_name,
        alert_conditions: data.alert_rule_conditions,
        type: state.ruleLogic
    };

    delete data.alert_rule_time;
    delete data.alert_rule_app_name;
    delete data.alert_rule_conditions;

    
    return data;
}

// 关闭模态框
const handleDrawerClose = () => {
    emits('update:open', false);
};

// 打开模态
const handleDrawerOpen = async (val) => {
    if (val) {
        state.dataSourceId = null;
        state.ruleLogic = 'and';
        
        await getDataSourceList();
        await initForm();
        await formDataInit();
        if(formType.value === EDIT_TYPE) {
            await setDataSourceIndex();
        }
    }
};

const getDataSourceList = async () => {
    const dataSource = await getDataSource();
    state.dataSourceOptions.type = Object.keys(dataSource).map(item => {
        return { label: item, value: item };
    });

    Object.keys(dataSource).forEach(key => {
        state.dataSourceOptions[key] = dataSource[key].map(item => {
            return {
                value: item.id,
                label: `${item.environment}-${item.cloud_source}-${item.name}`,
                data: item
            };
        });
    });
};

const setDataSourceIndex = async () => {
    const formState = formRenderContent.value.formState;

    const res = await getDataSourceIndex({
        "source_sid": state.dataSourceId,
        "source_type": formState.data_source
    });

    state.dataIndexOptions = res.map((item) => {
        return {
            label: item,
            value: item
        };
    });
};

const handleDataSourceChange = async () => {
    const formState = formRenderContent.value.formState;
    formState.alert_rule_app_name = [];

    await setDataSourceIndex();
};

const addCondition = () => {
    formRenderContent.value.formState?.alert_rule_conditions.push({
        field: "",
        value: "",
        operator: ""
    });
};

const delCondition = (index) => {
    formRenderContent.value.formState?.alert_rule_conditions.splice(index, 1);
};

const toggleAlertLevelCheck = (level) => {
    const formState = formRenderContent.value.formState;
    if (formState['alert_level'][level]) {
        delete formState['alert_level'][level];
    } else {
        if (!formState['alert_level']) {
            formState['alert_level'] = {};
        }
        formState['alert_level'][level] = {
            error_number: null,
        };
    }
};

</script>

<template>
    <ops-form-container
        :title="`${$route.meta.title}${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}`"
        :open="open"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
        <a-spin :spinning="formDataLoading">
            <a-form
                ref="formRef"
                :model="formRenderContent.formState"
                :rules="formRenderContent.rules"
            >
                <template v-for="t in editTitle" :key="t.field">
                    <template v-if="t.field === 'alert_rule_app_name'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :custom-form-label="formRenderContent.formState.data_source == 'Kafka' ? 'Topic' : '索引前缀'"
                        >
                            <a-form-item-rest v-if="formRenderContent.formState.data_source == 'Kafka'">
                                <a-select
                                    v-model:value="formRenderContent.formState[t.field]"
                                    mode="tags"
                                    :options="state.dataIndexOptions"
                                />
                            </a-form-item-rest>

                            <a-form-item-rest v-else>
                                <a-select
                                    v-model:value="formRenderContent.formState[t.field]"
                                    :open="false"
                                    :token-separators="[',', '，', ' ']"
                                    mode="tags"
                                />
                            </a-form-item-rest>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'alert_rule_time'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-time-range-picker v-model:value="formRenderContent.formState[t.field]" value-format="HH:mm" format="HH:mm"/>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'alert_rule_conditions'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-form-item-rest
                                v-for="(condition, index) in formRenderContent.formState[t.field]"
                                :key="index"
                            >
                                <div class="address-box">
                                    <span class="del-btn" @click="delCondition(index)">删除</span>

                                    <div class="flex-2">
                                        <div>字段名</div>
                                        <a-input v-model:value="condition.field"/>
                                        <a-alert
                                            type="warning"
                                            show-icon
                                            class="alert-messages"
                                        >
                                            <template #icon>
                                                <vxe-icon name="warning-triangle-fill" class-name="alert-message-icon"></vxe-icon>
                                            </template>
                                            <template #description>
                                                <span>此字段为日志中输出的key值</span>
                                            </template>
                                        </a-alert>
                                    </div>

                                    <div class="flex-1">
                                        <div>比较符</div>
                                        <a-select v-model:value="condition.operator" :options="[{label: 'in', value: 'in'}, {label: 'not in', value: 'not in'}]"/>
                                    </div>

                                    <div class="flex-2">
                                        <div>关键词</div>
                                        <a-textarea v-model:value="condition.value" :rows="1"/>
                                    </div>

                                    <div class="flex-1">
                                        <div>条件逻辑</div>
                                        <a-select v-model:value="state.ruleLogic" :disabled="formRenderContent.formState[t.field].length === 1" :options="[{label: 'and', value: 'and'}, {label: 'or', value: 'or'}]"/>
                                    </div>
                                </div>
                            </a-form-item-rest>

                            <a-button type="dashed" block @click="addCondition">
                                <PlusOutlined />新增
                            </a-button>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'alert_level'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                                <a-form-item-rest>
                                    <a-checkbox 
                                        v-for="level in ALERT_LEVEL" 
                                        :key="level"
                                        :checked="formRenderContent.formState[t.field].hasOwnProperty(level)" 
                                        @click="toggleAlertLevelCheck(level)"
                                    >
                                        {{ level }}
                                    </a-checkbox>
                                </a-form-item-rest>

                                <div class="flex flex-col gap-2 mt-2">
                                    <a-form-item-rest v-for="level in ALERT_LEVEL" :key="level" >
                                        <div>
                                            <template v-if="formRenderContent.formState[t.field].hasOwnProperty(level)">
                                                <span style="display: inline-block; width: 20px;">{{ level }}</span> 大于等于
                                                <a-input v-model:value="formRenderContent.formState[t.field][level].error_number" style="width: 150px;"/>
                                            </template>
                                        </div>
                                    </a-form-item-rest>
                                </div>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'data_source'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-radio-group v-model:value="formRenderContent.formState[t.field]" :options="state.dataSourceOptions.type" style="margin-bottom: 6px;" @change="state.dataSourceId = null; formRenderContent.formState.alert_rule_app_name = []"/>

                            <a-form-item-rest>
                                <a-select v-model:value="state.dataSourceId" :options="state.dataSourceOptions?.[formRenderContent.formState[t.field]]" @change="handleDataSourceChange"/>
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
        <template #footer>
            <vxe-button  content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>
</template>

<style scoped lang="less">
.alert-messages {
    padding: 4px 8px;
    margin-top: 2px;
    width: fit-content;  // 宽度自适应内容
    max-width: 100%;     // 最大不超过容器
    color:#616266;
    border: none;
    font-size: 13px;
    
    :deep(.ant-alert-message),
    :deep(.ant-alert-description) {
        white-space: pre-wrap; // 允许文本换行
        word-break: break-word; // 长单词换行
    }
    .alert-message-icon {
        margin-right: 4px;
        font-size: 16px;
        line-height: 1;
    }
}

.address-box {
    position: relative;
    border: 1px solid rgb(233, 233, 233);
    border-radius: 5px;
    padding: 15px 25px 5px 10px;
    margin-bottom: 6px;
    display: flex;
    gap: 8px;

    .del-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        color: rgb(255, 81, 81);
        cursor: pointer;
    }
}
</style>

