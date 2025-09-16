<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import API from "@/api/middleware/rabbitmq";
import { ADD_TYPE } from "@/config/globalOption";
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
import { encodePasswd } from "@/composables/encryptField";
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
        default: ADD_TYPE
    },
});

const { open, sid, formType } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);

const TITLE_LAYER = 1;
const formRef = ref(null);
const { putEdit, getDetail, postAdd, verifyAddr } = API;

const state = reactive({
    check_uuid: null,
    verifyError: null,
    origin_manage_address: null,
    origin_manage_passwd: null,
});

const editTitle = computed(() => {
    const priorityFields = ['cloud_source', 'manage_address', 'manage_port', 'manage_user', 'manage_passwd'];

    const titles = (formRenderContent.value?.title?.filter(item => item.edit_display) || []).slice().sort((a, b) => {
        const ia = priorityFields.indexOf(a.field);
        const ib = priorityFields.indexOf(b.field);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });

    return titles;
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
    formSubmit
} = opsFormInit({formRef, TITLE_LAYER, formType, sid, emits, addApi: postAdd, editApi: putEdit, oneDataApi: getDetail, customSubmitData, customEditData, customSubmit});

// 自定义处理单条数据
function customEditData(data) {
    if(!data.value.haproxy) {
        data.value.haproxy = [];
    }

    if(!data.value.vip_domain) {
        data.value.vip_domain = [];
    }

    if(!data.value.manage_domain) {
        data.value.manage_domain = [];
    }

    state.origin_manage_address = data.value.manage_address;
    state.origin_manage_passwd = data.value.manage_passwd;

    return data;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    delete data.cloud_status;

    return data;
}

// 自定义提交
async function customSubmit(data) {
    try {
        data.check_uuid = state.check_uuid;

        if(data.manage_passwd !== state.origin_manage_passwd) {
            data.manage_passwd = data.manage_passwd ? await encodePasswd(data.manage_passwd) : '';
        } else {
            delete data.manage_passwd;
        }

        if(data.manage_address === state.origin_manage_address) {
            delete data.manage_address;
        }

        formSubmit(data);
    } catch (error) {
        confirmLoading.value = false;
    }
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
    } else {
        state.check_uuid = null;
        state.origin_manage_address = null;
        state.origin_manage_passwd = null;
    }
};

// 添加haproxy
const addList = (type) => {
    formRenderContent.value.formState[type].push('');
};

// 删除haproxy
const removeList = (type, index) => {
    formRenderContent.value.formState[type].splice(index, 1);
};

// 验证管理地址
const handleVerifyAddr = async () => {
    let data = formRenderContent.value.formState;

    try {
        formDataLoading.value = true;

        const res = await verifyAddr({
            manage_address: data.manage_address,
            manage_port: data.manage_port,
            manage_user: data.manage_user,
            manage_passwd: data.manage_passwd ? await encodePasswd(data.manage_passwd) : '',
        });

        state.check_uuid = res?.check_uuid;
        state.verifyError = null;
        formDataLoading.value = false;

        message.success('管理地址验证成功');
    } 
    catch (error) {
        state.verifyError = error?.response?.data?.msg || error;
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
            >
                <template v-for="t in editTitle" :key="t.field">
                    <template v-if="t.field === 'haproxy'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-form-item-rest v-for="(item, index) in formRenderContent.formState[t.field]" :key="index">
                                <div class="log-path-input">
                                    <a-input v-model:value="formRenderContent.formState[t.field][index]"/>
                                    <PlusCircleOutlined @click="addList(t.field)" />
                                    <MinusCircleOutlined v-if="formRenderContent.formState[t.field]?.length > 1" @click="removeList(t.field, index)" />
                                </div>
                            </a-form-item-rest>
                            <PlusCircleOutlined v-if="formRenderContent.formState[t.field]?.length === 0 || !formRenderContent.formState[t.field]" @click="addList(t.field)" />
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'vip_domain'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-form-item-rest v-for="(item, index) in formRenderContent.formState[t.field]" :key="index">
                                <div class="log-path-input">
                                    <a-input v-model:value="formRenderContent.formState[t.field][index]"/>
                                    <PlusCircleOutlined @click="addList(t.field)" />
                                    <MinusCircleOutlined v-if="formRenderContent.formState[t.field]?.length > 1" @click="removeList(t.field, index)" />
                                </div>
                            </a-form-item-rest>
                            <PlusCircleOutlined v-if="formRenderContent.formState[t.field]?.length === 0 || !formRenderContent.formState[t.field]" @click="addList(t.field)" />
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'manage_domain'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-form-item-rest v-for="(item, index) in formRenderContent.formState[t.field]" :key="index">
                                <div class="log-path-input">
                                    <a-input v-model:value="formRenderContent.formState[t.field][index]"/>
                                    <PlusCircleOutlined @click="addList(t.field)" />
                                    <MinusCircleOutlined v-if="formRenderContent.formState[t.field]?.length > 1" @click="removeList(t.field, index)" />
                                </div>
                            </a-form-item-rest>
                            <PlusCircleOutlined v-if="formRenderContent.formState[t.field]?.length === 0 || !formRenderContent.formState[t.field]" @click="addList(t.field)" />
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

                    <template v-else-if="t.field === 'manage_address'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="state.check_uuid ? true : false"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'manage_port'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="state.check_uuid ? true : false"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'manage_user'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="state.check_uuid ? true : false"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'manage_passwd'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="state.check_uuid ? true : false"
                        >
                            <template #tooltip>
                                <a-button 
                                    size="small" 
                                    type="primary" 
                                    style="margin-left: 8px;"
                                    :disabled="Boolean(state.check_uuid || !(formRenderContent.formState.manage_address && formRenderContent.formState.manage_port && formRenderContent.formState.manage_user && formRenderContent.formState.manage_passwd))"
                                    @click="handleVerifyAddr"
                                >
                                    验证
                                </a-button>
                            </template>

                            <ops-password
                                v-model:value="formRenderContent.formState[t.field]"
                                :username="formRenderContent.formState?.manage_user"
                                :disabled="state.check_uuid ? true : false"
                            />
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'cloud_status'">
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
                    >
                    </ops-form-item>
                </template>
            </a-form>
        </a-spin>
        <template #footer>
            <span v-if="state.verifyError" class="text-error mr-5 inline-block" style="width: calc(100% - 150px);">
                {{ state.verifyError }}
            </span>
            <vxe-button content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
            
        </template>
    </ops-form-container>
</template>

<style lang="scss" scoped>
.log-path-input {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    &:last-child {
        margin-bottom: 0;
    }

    .anticon {
        font-size: 16px;
        cursor: pointer;
    }
}
</style>
