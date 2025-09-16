<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import cloudAccountApi from "@/api/cloudManage/cloudAccountApi";
import {encodePasswd} from "@/composables/encryptField";

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
    }
});
const {open, sid, formType} = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
let formRef = ref(null);
const editTitleLayer = 1;
const { postAddAccount, getAccountOneListApi, putEditAccount } = cloudAccountApi;


const customSubmitData = async (data) => {
    let result = [
        "access_key",
        "security_key",
        "status",
        "password",
        "page_display",
        "association_mobile",
        "association_mail",
        "virtual_team_v3_id",
        "describe",
        "write_access_key",
        "write_security_key",
    ]; // 需提交的字段
    if (data.password) {
        data.password = await encodePasswd(data.password);
    }
    let putData = {};
    for (let item in result) {
        putData[result[item]] = data[result[item]];
    };
    return putData;
};
const customTitleInit = async () => {
    if (formRenderContent.value?.rules?.['security_key']?.[0]?.required) {
        formRenderContent.value.rules['security_key'][0].required = false;
    }
};


let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, addApi: postAddAccount, editApi: putEditAccount, oneDataApi: getAccountOneListApi, customSubmitData, customTitleInit});

// 检测相关提示与可用性
const needCheck = computed(() => {
    const state = formRenderContent.value?.formState || {};
    return !!(state.access_key && state.cloud_type && (state.security_key || state.write_security_key));
});
const hasWriteKeyButNoMainKey = computed(() => {
    const state = formRenderContent.value?.formState || {};
    return !!(state.write_security_key && !state.security_key);
});
const canClickCheck = computed(() => needCheck.value && !hasWriteKeyButNoMainKey.value);


// 弹窗的关闭
const handleDrawerClose = () => {
    emits('update:open', false);
};

// 弹窗的打开
const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
        if (formRenderContent.value?.rules?.['security_key']?.[0]?.required) {
            formRenderContent.value.rules['security_key'][0].required = false;
        }
        if(formRenderContent.value.formState.write_access_key !== formRenderContent.value.formState.access_key) {
            formRenderContent.value.formState.key_permissions = '只读';
        } else {
            formRenderContent.value.formState.key_permissions = '读写';
        }
    }
};

/** 账户信息的的check --Start **/
let enterpriseProjects = ref([]);
let formLoading = ref(false);
let isCheckSuccess = ref(false); // 是否检测成功
const handleAccountCheck = async () => {
    formRenderContent.value.formState.check_msg = '';
    formRenderContent.value.formState.regions_list = [];
    enterpriseProjects.value = [];
    isCheckSuccess.value = false;
    if (hasWriteKeyButNoMainKey.value) {
        formRenderContent.value.formState.check_msg = '已填写写密钥，请先填写密钥（security_key）后再进行检测';
        return;
    }
    if (formRenderContent.value.formState.access_key && formRenderContent.value.formState.security_key && formRenderContent.value.formState.cloud_type) {
        formLoading.value = true;
        let passCode = '';
        if(formRenderContent.value.formState.security_key) {
            passCode = await encodePasswd(formRenderContent.value.formState.security_key);
        }
        let passWriteCode = '';
        if(formRenderContent.value.formState.write_security_key) {
            passWriteCode = await encodePasswd(formRenderContent.value.formState.write_security_key);
        }
        let accountPermission = {};
        if(formRenderContent.value.formState.key_permissions === '只读') {
            accountPermission = {
                write_access_key: formRenderContent.value.formState.write_access_key,
                write_security_key: passWriteCode,
            };
        } else if(formRenderContent.value.formState.key_permissions === '读写') {
            accountPermission = {
                write_access_key: formRenderContent.value.formState.access_key,
                write_security_key: passCode,
            };
        } else {
            accountPermission = {
                write_access_key: null,
                write_security_key: formRenderContent.value.formState.write_security_key ? passWriteCode  : null,
            };
        }
        let postData = {
            cloud_type: formRenderContent.value.formState.cloud_type,
            access_key: formRenderContent.value.formState.access_key,
            ...(passCode ? {security_key: passCode} : {}),
            ...accountPermission,
        };

        cloudAccountApi.postCheckAccount(postData)
            .then(res => {
                formLoading.value = false;
                for (let name in res) {
                    formRenderContent.value.formState[name] = res[name];
                }
                enterpriseProjects.value = res.enterprise_projects || [];
                isCheckSuccess.value = true;
                formRenderContent.value.formState.check_msg = '检测通过';
            })
            .catch((error) => {
                let msg = error.response.data.message || error.response.data.msg;
                formRenderContent.value.formState.check_msg = msg;
                formLoading.value = false;
                isCheckSuccess.value = false;
            });
    }
};
// zdns对应的中文名
const zdnsCnName = {
    'access_key': '用户名',
    'security_key': '密码',
};
// 如果云类型为zdns，则不需要显示的字段名
const zdnsNoShowFields = ['username', 'primary_username','password', 'enterprise_projects', 'regions_list', 'write_access_key', 'write_security_key', 'key_permissions'];
/** 账户信息的的check --End **/


</script>

<template>
    <ops-form-container
        v-if="formType === $CONFIG.FORM_TYPE.EDIT_TYPE"
        :title="`${$route.meta.title}编辑`"
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
                <template v-for="t in $utils.filter(formRenderContent.title, item => (item.edit_display && ['regions_list', 'enterprise_projects'].indexOf(item.field) === -1) && (formRenderContent.formState['cloud_type'].toLowerCase() !== 'zdns' || !zdnsNoShowFields.includes(item.field)))" :key="t.field">
                    <template v-if="t.field === 'write_access_key'">
                        <ops-form-item
                            v-if="formRenderContent.formState['key_permissions'] === '只读'"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :label="undefined"
                            :label-col="{span: 3}"
                        >
                            <template #label>
                                {{ formRenderContent.formState['cloud_type'].toLowerCase() === 'zdns' ? zdnsCnName[t.field] ? zdnsCnName[t.field] : t.field_name : t.field_name }}
                            </template>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'write_security_key'">
                        <ops-form-item
                            v-if="formRenderContent.formState['key_permissions'] === '只读'"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :label="undefined"
                            :label-col="{span: 3}"
                        >
                            <template #label>
                                {{ formRenderContent.formState['cloud_type'].toLowerCase() === 'zdns' ? zdnsCnName[t.field] ? zdnsCnName[t.field] : t.field_name : t.field_name }}
                            </template>

                            <template v-if="t.field === 'write_security_key'">
                                <ops-password
                                    v-model:value="formRenderContent.formState[t.field]"
                                    :username="formRenderContent.formState?.write_access_key"
                                />
                            </template>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'password'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <ops-password
                                v-model:value="formRenderContent.formState[t.field]"
                                :username="formRenderContent.formState?.primary_username"
                            />
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'security_key'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <ops-password
                                v-model:value="formRenderContent.formState[t.field]"
                                :username="formRenderContent.formState?.access_key"
                            />
                        </ops-form-item>
                    </template>

                    <ops-form-item
                            v-else
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :label="undefined"
                        >
                            <template #label>
                                {{ formRenderContent.formState['cloud_type'].toLowerCase() === 'zdns' ? zdnsCnName[t.field] ? zdnsCnName[t.field] : t.field_name : t.field_name }}
                            </template>
                    </ops-form-item>
                </template>
                <div v-if="formRenderContent.formState?.check_msg" style="margin: 8px 0;">
                    <a-tag :color="isCheckSuccess ? 'green' : 'red'">{{ formRenderContent.formState.check_msg }}</a-tag>
                </div>
            </a-form>
        </a-spin>
        
        <template #footer>
            <template v-if="needCheck">
                <span v-if="!isCheckSuccess" class="text-error">* 请先进行检测才能提交 </span>
                <span v-if="hasWriteKeyButNoMainKey" class="text-error">* 已填写写密钥SK，请先填写密钥（security_key）</span>
                <vxe-button :loading="formLoading" :disabled="!canClickCheck" content="检测" status="primary"  @click="handleAccountCheck"/>
            </template>

            <vxe-button  content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading" :disabled="(needCheck && !isCheckSuccess)" status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>


</template>



<style scoped>

</style>
