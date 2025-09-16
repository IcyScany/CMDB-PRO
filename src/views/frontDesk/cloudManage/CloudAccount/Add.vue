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
    if (data.password) {
        data.password = await encodePasswd(data.password);
    }
    if (data.cloud_type.toLowerCase() === 'zdns') {
        data.username = data.access_key;
        data.primary_username = data.access_key;
    }
    delete data.key_permissions;
    return data;
};

let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, addApi: postAddAccount, editApi: putEditAccount, oneDataApi: getAccountOneListApi, customSubmitData});


// 弹窗的打开
const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
    }
};

/** 步骤表单的处理 ***/
const current = ref(0);
const next = () => {
    formRef.value.validate().then(() => {
        if (current.value === 0) {
            handleAccountCheck();
        } else {
            current.value++;
        }

    }).catch((err) => {console.error('表单验证失败：', err);});
};
const prev = () => {
    current.value--;
};
const basicSteps = [
    {
        title: '选择云环境',
        content: 'First-content',
    },
    {
        title: '账号设置',
        content: 'Second-content',
    },
    {
        title: '选择区域',
        content: 'Last-content',
    },
    {
        title: '预览',
        use: 'preview',
        content: 'preview',
    },
];
const steps = computed(() => formRenderContent.value?.formState?.['cloud_type'].toLowerCase() === 'zdns' ? basicSteps.filter((item) => item.content !== 'Last-content') : basicSteps);
const items = computed(() => {
    let result = steps.value.filter(({title, use}) => ({ key: title, title, use }));
    return result;
});

/** 账户信息的的check --Start **/
let enterpriseProjects = ref([]);
let formLoading = ref(false);
let isCheckSuccess = ref(false); // 是否检测成功
const handleAccountCheck = async () => {
    formRenderContent.value.formState.check_msg = '';
    formRenderContent.value.formState.regions_list = [];
    enterpriseProjects.value = [];
    isCheckSuccess.value = false;
    if (formRenderContent.value.formState.access_key && formRenderContent.value.formState.security_key && formRenderContent.value.formState.cloud_type) {
        formLoading.value = true;
        let passCode = await encodePasswd(formRenderContent.value.formState.security_key);
        let accountPermission = {};
        let passWriteCode = await encodePasswd(formRenderContent.value.formState.write_security_key);

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
        cloudAccountApi.postCheckAccount({
            cloud_type: formRenderContent.value.formState.cloud_type,
            access_key: formRenderContent.value.formState.access_key,
            security_key: passCode,
            ...accountPermission,
        })
            .then(res => {
                formLoading.value = false;
                for (let name in res) {
                    formRenderContent.value.formState[name] = res[name];
                }
                enterpriseProjects.value = res.enterprise_projects || [];
                isCheckSuccess.value = true;

                current.value++;
            })
            .catch((error) => {
                let msg = error.response.data.message || error.response.data.msg;
                formRenderContent.value.formState.check_msg = msg;
                formLoading.value = false;
                isCheckSuccess.value = false;
            });
    }
};
/** 账户信息的的check --End **/


/** 区域列表的表格列 --Start**/
const projectTaleColumns = [
    {
        field: 'name',
        title: '名称',
        sortable: true,
    },
    {
        field: 'cn_name',
        title: '中文名',
        sortable: true,

    },
    {
        field: 'en_name',
        title: '英文名',
        sortable: true,

    },
    {
        field: 'sync_status',
        title: '数据同步状态',
        sortable: true,
        slots: {
            default: 'sync_status'
        }
    },
];
const enterpriseTaleColumns = [
    {
        field: 'name',
        title: '名称',
        sortable: true,
    },
    {
        field: 'type',
        title: '类型',
        sortable: true,

    },
    {
        field: 'status',
        title: '状态',
        sortable: true,
        slots: {
            default: 'status'
        }

    }
];

let gridOptions = {
    size: "mini",

    stripe: true,
    border: true
};
const stepStyle = {
    marginBottom: '20px',
    boxShadow: '0px -1px 0 0 #e8e8e8 inset',
};
const handleModalShow = () => {
    handleDrawerOpen(true);
    current.value = 0;

};

function handleHide() {
    emits('update:open', false);
}

// zdns对应的中文名
const zdnsCnName = {
    'access_key': '用户名',
    'security_key': '密码',
};

// 在第二步中，如果云类型为zdns，则不需要显示的字段名
const zdnsNoShowFields = ['username', 'primary_username','password', 'enterprise_projects', 'regions_list', 'write_access_key', 'write_security_key', 'key_permissions'];





</script>

<template>
    <vxe-modal
        v-if="formType === $CONFIG.FORM_TYPE.ADD_TYPE"
        :model-value="open"
        show-footer
        resize
        :title="`${$route.meta.title}新增`"
        :loading="formDataLoading"
        @show="handleModalShow"
        @close="handleHide"
        @hide="handleHide"
    >
        <a-steps :current="current"  :items="items"  type="navigation"  size="small" :style="stepStyle"></a-steps>
        <div class="steps-content">
            <a-form
                ref="formRef"
                :model="formRenderContent.formState"
                :rules="formRenderContent.rules"
                :label-col="{span: 3}"
                label-align="left"
            >
                <template v-for="(t, index) in $utils.filter(formRenderContent.title, item => (item.block === current + 1 && item.edit_display && item.field !== 'status' ) ||  (steps?.[current]?.use === 'preview' && item.edit_display))" :key="t.field">
                    <template v-if="t.field === 'cloud_type'" >
                        <ops-form-item
                            :title="t"
                            :label="undefined"
                            :disabled="steps?.[current]?.use === 'preview'"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :label-col="{span: 3}"
                        >
                            <h3><b>选择公有云</b></h3>
                            <a-radio-group  v-model:value="formRenderContent.formState[t.field]" size="large" :disabled="steps?.[current]?.use === 'preview'">
                                <a-radio-button v-for="type in formRenderContent.title_data[t.field]" :key="type.value" :value="type.value" button-style="solid">
                                    <svg-icon :iconname="`icon-${type.icon}`" class="menu-icon" style="font-size: 50px;width: 6rem"></svg-icon>
                                </a-radio-button>
                            </a-radio-group>
                        </ops-form-item>
                        <a-divider  v-if="steps?.[current]?.use === 'preview'" style="height: 2px; background-color: rgba(204,204,204,0.6)"/>
                    </template>

                    <template v-else-if="t.field === 'regions_list'">
                        <template v-if="formRenderContent.formState['cloud_type'].toLowerCase() !== 'zdns'">
                            <a-divider  v-if="steps?.[current]?.use === 'preview'" style="height: 2px; background-color: rgba(204,204,204,0.6)"/>
                            <h3><b>{{t.field_name}}</b></h3>
                            <div>
                                <vxe-grid v-bind="gridOptions" :columns="projectTaleColumns" :data="formRenderContent.formState[t.field]" >
                                    <template #sync_status="{row}">
                                        <a-tooltip title="打开为自动同步此区域的数据到CMDB系统">
                                            <a-switch
                                                :checked="row.sync_status"
                                                :checked-value="1"
                                                :un-checked-value="0"
                                                :disabled="steps?.[current]?.use === 'preview'"
                                                checked-children="开"
                                                un-checked-children="关"
                                                @change="(checked) => row.sync_status = checked"
                                            />
                                        </a-tooltip>
                                    </template>
                                </vxe-grid>
                            </div>
                        </template>

                    </template>
                    <template v-else-if="t.field === 'enterprise_projects'">
                        <template v-if="formRenderContent.formState['cloud_type'].toLowerCase() !== 'zdns'">
                            <a-divider  v-if="steps?.[current]?.use === 'preview'" style="height: 2px; background-color: rgba(204,204,204,0.6)"/>
                            <h3><b>{{t.field_name}}</b></h3>
                            <div>
                                <vxe-grid v-bind="gridOptions"  :columns="enterpriseTaleColumns" :data="enterpriseProjects" >
                                    <template #status="{row}">
                                        <a-tag :color="row.status === 1 ? 'green': ''">{{row.status === 1 ? '正常': '禁用'}}</a-tag>
                                    </template>
                                </vxe-grid>
                            </div>
                        </template>
                    </template>
                    <template v-else-if="t.field === 'write_access_key' || t.field === 'write_security_key' ">
                        <ops-form-item
                            v-if="formRenderContent.formState['key_permissions'] === '只读'"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :disabled="steps?.[current]?.use === 'preview'"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :label="undefined"
                            :label-col="{span: 3}"
                            @change="handlerKeyPermissionsChange"
                        >
                            <template #label>
                                {{ formRenderContent.formState['cloud_type'].toLowerCase() === 'zdns' ? zdnsCnName[t.field] ? zdnsCnName[t.field] : t.field_name : t.field_name }}
                            </template>
                        </ops-form-item>
                    </template>
                    <template v-else>
                        <template v-if="t.block === 1 && index === 1">
                            <h3 v-if="steps?.[current]?.use === 'preview'"><b>账号密钥信息</b></h3>
                            <template v-else><h3><b>录入账号密钥</b></h3></template>
                        </template>
                        
                        <ops-form-item
                            v-if="formRenderContent.formState['cloud_type'].toLowerCase() !== 'zdns' || !zdnsNoShowFields.includes(t.field)"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :disabled="steps?.[current]?.use === 'preview'"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :label="undefined"
                            :label-col="{span: 3}"
                        >
                            <template #label>
                                {{ formRenderContent.formState['cloud_type'].toLowerCase() === 'zdns' ? zdnsCnName[t.field] ? zdnsCnName[t.field] : t.field_name : t.field_name }}
                            </template>
                        </ops-form-item>
                    </template>
                </template>

                <a-form-item v-if="formRenderContent?.formState?.check_msg">
                    <div class="text-error">
                        <a-divider><b>验证结果</b></a-divider>
                        {{formRenderContent?.formState?.check_msg}}
                    </div>
                </a-form-item>
            </a-form>

        </div>
        <template #footer>
            <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
            &nbsp;&nbsp;
            <a-button v-if="current < steps.length - 1" type="primary" @click="next">下一步</a-button>
            &nbsp;&nbsp;
            <a-button
                v-if="current == steps.length - 1"
                :loading="confirmLoading"
                type="primary"
                @click="editSubmit"
            >
                提交
            </a-button>
        </template>
    </vxe-modal>
</template>

<style scoped lang="less">
:deep(.ant-radio-button-wrapper-checked:after) {
    content: '✓';
    text-align: center;
}

#form_item_cloud_type {
    display: flex;
}

:deep(.ant-radio-group-large .ant-radio-button-wrapper)
{
    border-radius: unset !important;
    margin-right: 2%;
    height: 56px;
}

</style>
