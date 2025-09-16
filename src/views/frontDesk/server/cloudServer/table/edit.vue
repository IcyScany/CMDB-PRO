<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import cloudServerApi from '@/api/server/cloudServerApi';
import { encodePasswd } from "@/composables/encryptField";
import { EDIT_TYPE } from "@/config/globalOption";
import { message } from "ant-design-vue";

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
const { open, sid, formType } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
const { postAccountAddDataApi, putCloudServerEdit, getCloudServerOneList, getServerInfo } = cloudServerApi;

const formRef = ref(null);
const editTitleLayer = 1;
const canEditField = ['description', 'virtual_team_v3_id', 'server_status', 'environment', 'server_passwd', 'server_type']; // 云上机器可编辑字段

const state = reactive({
    originPsw: null,
    serverInfo: null,
    serverError: null
});

const editTitle = computed(() => {
    const title = formRenderContent.value?.title?.filter(item => item.edit_display) || [];
    const formState = formRenderContent.value.formState;

    // 将cloud_source字段排在最前
    title.sort((a, b) => {
        if (a.field === 'cloud_source') return -1;
        if (b.field === 'cloud_source') return 1;
        return 0;
    });

    return title.map(item => {
        if(formType.value === EDIT_TYPE && formState.cloud_source === '自建') {
            item.edit_change = [...canEditField, 'server_ip'].includes(item.field) ? 1 : 0;
            if(item.field === 'server_type') {
                item.edit_display = true;
            }
        }
        if(formType.value === EDIT_TYPE && formState.cloud_source !== '自建') {
            item.edit_change = canEditField.includes(item.field) ? 1 : 0;
            if(item.field === 'server_type') {
                item.edit_display = false;
            }
        }
        if(state.serverInfo) {
            if(['server_ip', 'server_passwd'].includes(item.field)) {
                item.edit_change = 0;
            }
            if(Object.keys(state.serverInfo).includes(item.field)) {
                item.edit_change = 0;
            }
        }
        return item;
    });
});

const customEditData = (data) => {
    state.originPsw = data.value.server_passwd;
};

const customSubmitData = async (data) => {
    if(data.server_passwd == state.originPsw) {
        delete data.server_passwd;
    } else {
        data.server_passwd = await encodePasswd(data.server_passwd);
    }

    if(formType.value === EDIT_TYPE) {
        if(data.cloud_source === '自建') {
            Object.keys(data).forEach(field => {
                if(![...canEditField, 'server_ip', 'cloud_source'].includes(field)) {
                    delete data?.[field];
                }
            });
        }
        else {
            Object.keys(data).forEach(field => {
                if(![...canEditField, 'cloud_source'].includes(field)) {
                    delete data?.[field];
                }
            });
            delete data?.server_type;
        }
    }

    return data;
};

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, addApi: postAccountAddDataApi, editApi: putCloudServerEdit, oneDataApi: getCloudServerOneList, customSubmitData, customEditData});

const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
        state.serverInfo = null;
        state.serverError = null;
        await initForm();
        await formDataInit();
    }
};

const handleVerify = async () => {
    const formState = formRenderContent.value.formState;

    try {
        formDataLoading.value = true;

        const info = await getServerInfo({
            server_ip: formState.server_ip,
            server_passwd: await encodePasswd(formState.server_passwd),
        });

        state.serverInfo = info;
        state.serverError = null;

        Object.entries(info).forEach(([key, value]) => {
            formState[key] = value;
        });

        message.success('验证成功');
        formDataLoading.value = false;
    } catch (error) {
        state.serverError = error?.response?.data?.msg || error;

        message.error('验证失败');
        formDataLoading.value = false;
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
                :label-col="{ span: 3 }"
                label-align="left"
                :colon="false"
            >
                <template v-for="t in editTitle" :key="t.field">
                    <template v-if="t.field === 'server_ip'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="t.edit_change === 0"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'server_passwd'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="t.edit_change === 0"
                        >
                            <template #tooltip>
                                <a-button 
                                    size="small" 
                                    type="primary" 
                                    style="margin-left: 8px;"
                                    :disabled="Boolean(state.serverInfo || !formRenderContent.formState[t.field] || !formRenderContent.formState.server_ip)"
                                    @click="handleVerify"
                                >
                                    验证
                                </a-button>
                            </template>

                            <ops-password
                                v-model:value="formRenderContent.formState[t.field]"
                                :disabled="t.edit_change === 0"
                            />
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'cloud_source'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="true"
                        >
                        </ops-form-item>
                    </template>

                    <ops-form-item
                        v-else
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                        :disabled="t.edit_change === 0"
                    >
                    </ops-form-item>
                </template>
            </a-form>
        </a-spin>

        <template #footer>
            <span v-if="state.serverError" class="text-error mr-5">
                {{ state.serverError }}
            </span>
            <vxe-button content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>
</template>

<style scoped>

</style>
