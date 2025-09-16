<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import pwdManagementApi from "@/api/security/pwdManagementApi";
import XEUtils from "xe-utils";
import  { EDIT_TYPE } from "@/config/globalOption";
import { encodePasswd } from "@/composables/encryptField";

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
    },
    fieldName: {
        type: Object,
        default: () => ({}),
    },
    allOptions: {
        type: Object,
    },
});

const { open, sid, formType } = toRefs(props);
const TITLE_LAYER = 1;
const emits = defineEmits(['update:open', 'editSuccess']);
const { putPwdManageEdit, getPwdManageDetail, postPwdManageAdd } = pwdManagementApi;

const formRef = ref(null);
const state = reactive({
    usernameType: 'text',
    usernameFileList: [],
    pwdType: 'text',
    pwdFileList: [],
    originPwd: '',
});

const {
    edit_data,
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, TITLE_LAYER, formType, sid, emits, addApi: postPwdManageAdd, editApi: putPwdManageEdit, oneDataApi: getPwdManageDetail, customSubmitData, customEditData});

// 自定义处理单条数据
function customEditData() {}

// 自定义处理提交数据
async function customSubmitData(data) {
    if(data.pwd == state.originPwd) {
        delete data.pwd;
    } else {
        data.pwd = await encodePasswd(data.pwd);
    }

    data.encryption_private_key = data.encryption_private_key ? await encodePasswd(data.encryption_private_key) : '';
    return data;
}

// 关闭模态框
const handleDrawerClose = () => {
    emits('update:open', false);
};

// 打开模态框
const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
        state.originPwd = formRenderContent.value.formState.pwd;
        formRenderContent.value.formState.share_limits = formRenderContent.value.formState.share_limits || [];
    } else {
        state.usernameFileList = [];
        state.pwdFileList = [];
        state.usernameType = 'text';
        state.pwdType ='text';
    }
};

// 授权范围选项
const shareOptions = computed(() => {
    if(formRenderContent.value?.formState.share_limits.includes('ALL')){
        return [{ label: '公共', value: 'ALL' }];
    } else {
        return [
            {
                label: '公共',
                options: [{ label: '公共', value: 'ALL' }]
            },
            {
                label: '虚拟组',
                options: Object.keys(props.allOptions).reduce((acc, item) => {
                    if(item.startsWith('team-')) {
                        acc.push({ label: props.allOptions[item], value: item });
                    }
                    return acc;
                }, [])
            },
            {
                label: '域账号',
                options: Object.keys(props.allOptions).reduce((acc, item) => {
                    if(item.startsWith('user-')) {
                        acc.push({ label: props.allOptions[item], value: item });
                    }
                    return acc;
                }, [])
            }
        ];
    }
});

// 根据内部/外部使用修改表单验证规则
const formRules = computed(() => {
    if (formRenderContent.value?.formState?.use_limits === 'CMDB内部使用') {
        return formRenderContent.value.rules;
    }
    const rule = XEUtils.clone(formRenderContent.value?.rules, true) || {};
    rule.encryption_private_key = [{ required: edit_data.value.is_check === 1, message: '此项不能为空' }];
    return rule;
});

// 根据表单凭据类型修改表单标题
const editTitle = computed(() => {
    if(!formRenderContent.value.title) return [];
    let type = formRenderContent.value.formState?.types;
    let title = formRenderContent.value.title.map(item => {
        if(type) {
            if(item.field === 'username') {
                item.field_name = props.fieldName[type]?.username || 'username';
            }
            if(item.field === 'pwd') {
                item.field_name = props.fieldName[type]?.pwd || 'pwd';
            }
        }
        return item;
    });
    return title;
});

// 上传文件前的处理
const handleBeforeUpload = (file, type) => {
    const reader = new FileReader();
    reader.onload = async () => {
        formRenderContent.value.formState[type] = reader.result;
    };
    reader.readAsText(file);
    return false;
};

// 凭据类型切换
const handleTypeChange = (type) => {
    const actions = {
        username() {
            formRenderContent.value.formState.username = '';
            state.usernameFileList = [];
        },
        pwd() {
            formRenderContent.value.formState.pwd = '';
            state.pwdFileList = [];
        },
        types() {
            Object.assign(formRenderContent.value.formState, {
                username: '',
                pwd: '',
                encryption_private_key: '',
                tips: '',
                share_limits: [],
                describe: ''
            });
            state.usernameType = 'text';
            state.pwdType = 'text';
        },
        share_limits() {
            if (formRenderContent.value.formState?.share_limits.includes('ALL')) {
                formRenderContent.value.formState.share_limits = ['ALL'];
            }
        },
        use_limits() {
            if (formRenderContent.value.formState.use_limits === 'CMDB内部使用') {
                formRenderContent.value.formState.tips = '';
                formRenderContent.value.formState.encryption_private_key = '';
            }
        }
    };

    actions[type]?.();
    nextTick(() => {
        formRef.value.clearValidate();
    });
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
                :rules="formRules"
            >
                <template v-for="t in $utils.filter(editTitle, item => item.edit_display)" :key="t.field">
                    <template v-if="t.field === 'username'">
                        <!-- 选择以下类型才展示username字段 -->
                        <ops-form-item
                            v-if="formRenderContent.formState['types'] && ['Username with password', 'SSH Username with private key', 'AccessKey+SecretAccessKey'].includes(formRenderContent.formState['types'])"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                        </ops-form-item>
                        <!-- 选择证书类型则username可上传文件 -->
                        <ops-form-item
                            v-else-if="formRenderContent.formState['types'] && formRenderContent.formState['types'] === 'Certificate'"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-radio-group v-model:value="state.usernameType" size="small" style="margin-bottom: 10px; display: block" @change="handleTypeChange('username')">
                                <a-radio value="text">粘贴文本</a-radio>
                                <a-radio value="file">上传文件</a-radio>
                            </a-radio-group>

                            <a-form-item-rest>
                                <a-upload v-if="state.usernameType === 'file'" v-model:file-list="state.usernameFileList" :before-upload="file => handleBeforeUpload(file, 'username')">
                                    <vxe-button 
                                        icon="vxe-icon-upload" 
                                        status="primary" 
                                        mode="text"
                                        size="mini"
                                        class="ml-2 cursor-pointer"
                                        :disabled="state.usernameFileList.length ? true : false"
                                    >
                                        上传
                                    </vxe-button>
                                </a-upload>

                                <a-textarea v-else v-model:value="formRenderContent.formState[t.field]"></a-textarea>
                            </a-form-item-rest>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'pwd'">
                        <ops-form-item
                            v-if="formRenderContent.formState['types'] && ['Secret file', 'Certificate'].includes(formRenderContent.formState['types'])"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-radio-group v-model:value="state.pwdType" size="small" style="margin-bottom: 10px; display: block" @change="handleTypeChange('pwd')">
                                <a-radio value="text">粘贴文本</a-radio>
                                <a-radio value="file">上传文件</a-radio>
                            </a-radio-group>

                            <a-form-item-rest>
                                <a-upload v-if="state.pwdType === 'file'" v-model:file-list="state.pwdFileList" :before-upload="file => handleBeforeUpload(file, 'pwd')">
                                    <vxe-button 
                                        icon="vxe-icon-upload" 
                                        status="primary" 
                                        mode="text"
                                        size="mini"
                                        class="ml-2 cursor-pointer"
                                        :disabled="state.pwdFileList.length ? true : false"
                                    >
                                        上传
                                    </vxe-button>
                                </a-upload>

                                <a-textarea v-else v-model:value="formRenderContent.formState[t.field]"></a-textarea>
                            </a-form-item-rest>
                        </ops-form-item>

                        <ops-form-item
                            v-else-if="formRenderContent.formState['types']"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <ops-password
                                v-model:value="formRenderContent.formState[t.field]"
                                :username="formRenderContent.formState?.username"
                            />
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'share_limits'">
                        <ops-form-item
                            v-if="formRenderContent.formState['types']"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <ops-a-select
                               v-model:value="formRenderContent.formState[t.field]"
                               :options="shareOptions"
                               :mode="'multiple'"
                               @change="handleTypeChange('share_limits')"
                           >
                           </ops-a-select>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'tips'">
                        <ops-form-item
                            v-if="formRenderContent.formState['types'] && formRenderContent.formState['use_limits'] !== 'CMDB内部使用'"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'encryption_private_key'">
                        <ops-form-item
                            v-if="formRenderContent.formState['types'] && formRenderContent.formState['use_limits'] !== 'CMDB内部使用'"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="(edit_data.is_check !== 1 && formType === EDIT_TYPE)"
                        >
                            <ops-password
                                v-model:value="formRenderContent.formState[t.field]"
                                :username="formRenderContent.formState?.username"
                            />
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'describe'">
                        <ops-form-item
                            v-if="formRenderContent.formState['types']"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'types'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="formType === EDIT_TYPE"
                            @change="handleTypeChange('types')"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'use_limits'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="formType === EDIT_TYPE"
                            @change="handleTypeChange('use_limits')"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'uuid'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="formType === EDIT_TYPE"
                            :label="null"
                            @blur="() => formRenderContent.formState[t.field] = formRenderContent.formState[t.field].replace(/[^\w\.\/]/ig,'')"
                        >
                            <template #label>
                                {{ t.field_name }}
                                <a-tooltip v-if="t.page_data_source.form_tip_text">
                                    <template #title>
                                        {{t.page_data_source.form_tip_text}}
                                    </template>
                                    <i class="bi bi-question-circle-fill text-orange"></i>
                                </a-tooltip>
                            </template>
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
