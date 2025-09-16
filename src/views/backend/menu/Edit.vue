<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import menusApi from "@/api/backend/menusApi";
import menu from '@/config/menu/menu';
import {clone} from "xe-utils";

/**
 * 注意：其权限url必须以"/"结尾
 * **/

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
const {putOneMenuEdit, getOneMenusList, postOneMenuAdd } = menusApi;
let pageOrginData = ref({});

// 用于权限url的请求方式
const methodOptions = [
    {
        "label": "GET",
        "value": "GET"
    },
    {
        "label": "POST",
        "value": "POST"
    },
    {
        "label": "DELETE",
        "value": "DELETE"
    },
    {
        "label": "PUT",
        "value": "PUT"
    },
    {
        "label": "PATCH",
        "value": "PATCH"
    },
    {
        "label": "ws",
        "value": "ws"
    }
];

// 修改 customSubmitData
const customSubmitData = async (data) => {
    const submitData = { ...data };
    // 直接处理 permissions_url
    if (Array.isArray(submitData.permissions_url)) {
        // 过滤有效的权限URL
        const validUrls = submitData.permissions_url.filter(
            item => item.method && item.url
        );
        if (validUrls.length > 0) {
            // 转换格式
            submitData.permissions_url = validUrls.map(
                item => `${item.method}:${item.url}`
            );
        } else {
            submitData.permissions_url = [];
        }
    }
   
    // 确保 permissions_url 是数组
    if (!submitData.permissions_url) {
        submitData.permissions_url = [];
    }
    if (submitData.page_data_source && typeof data.page_data_source === 'string') {
        submitData.page_data_source = JSON.parse(data.page_data_source);
    } else {
        if(!submitData.page_data_source) {
            submitData.page_data_source = {};
        }
    }

    return submitData;
};

// 修改表单验证规则
const validatePermissionsUrl = async () => {
    const permissions = formRenderContent.value.formState.permissions_url;
    if (!Array.isArray(permissions) || permissions.length === 0) {
        return Promise.resolve();
    }
    // 检查是否有完整的权限URL（同时有method和url）
    const hasValidUrl = permissions.some(item => item.method && item.url);
    if (!hasValidUrl) {
        return Promise.reject('请至少填写一组完整的权限URL');
    }
    return Promise.resolve();
};

// 在 customOneData 中添加表单验证规则
const customOneData = (edit_data) => {
    console.log('edit_data', edit_data);
    let originEditData = clone(edit_data.value ? edit_data.value : {}, true);
   
    // 初始化 permissions_url
    if (!originEditData.permissions_url) {
        formRenderContent.value.formState.permissions_url = [{
            method: '',
            url: '',
            id: Date.now()
        }];
    } else {
        formRenderContent.value.formState.permissions_url = originEditData.permissions_url.map((item, index) => {
            const [method, url] = item.indexOf(':') > -1 
                ? String(item).split(':') 
                : ['', item];
            return { method, url, id: Date.now() + index };
        });
    }

    // 添加表单验证规则
    if (!formRenderContent.value.rules) {
        formRenderContent.value.rules = {};
    }
    formRenderContent.value.rules.permissions_url = [
        { validator: validatePermissionsUrl, trigger: 'change' }
    ];
    pageOrginData.value = originEditData;
};

let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid,emits, editApi: putOneMenuEdit, addApi: postOneMenuAdd, oneDataApi: getOneMenusList, customSubmitData, customOneData, customTitle: menu});


const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
        pageOrginData.value = {};
        await initForm();
        await formDataInit();
       
    }
};
// 新增权限url
const addPermissionUrl = () => {
    if (!Array.isArray(formRenderContent.value.formState.permissions_url)) {
        formRenderContent.value.formState.permissions_url = [];
    }
    
    formRenderContent.value.formState.permissions_url.push({
        method: '',
        url: '',
        id: Date.now()
    });
};
// 删除权限url
const removePermissionUrl = (index) => {
    formRenderContent.value.formState.permissions_url.splice(index, 1);
};

</script>

<template>
    <ops-form-container
        :title="`(${pageOrginData?.['level_2'] !== 0 ? '二级' : '一级'})${pageOrginData?.['menu_name']} - ${$route.meta.title}${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}`"
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
                <template v-for="t in $utils.filter(formRenderContent.title, item => item.edit_display)" :key="t.field">
                    <template v-if="t.field === 'permissions_url'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-row
                                v-for="(permission, index) in formRenderContent.formState.permissions_url"
                                :key="permission.id"
                                class="mb-2"
                                type="flex"
                            >
                                <a-col flex="20%">
                                    <a-form-item
                                        :name="['permissions_url', index, 'method']"
                                        :rules="{
                                      required: true,
                                      message: '请求方式',
                                    }"

                                    >
                                        <a-select
                                            v-model:value="permission.method"
                                            :options="methodOptions"
                                            placeholder="请选择请求方式"
                                            show-arrow
                                            show-search

                                        >
                                        </a-select>
                                    </a-form-item>
                                </a-col>
                                <a-col flex="80%">
                                    <a-row type="flex">
                                        <a-col flex="90%">
                                            <a-form-item
                                                :name="['permissions_url', index, 'url']"
                                                :rules="{
                                              required: false,
                                              message: '请输入权限URL',
                                            }"
                                            >
                                                <a-input v-model:value="permission.url" class="xy-url-input" placeholder="输入权限URL" />
                                            </a-form-item>
                                        </a-col>
                                        <a-col flex="10%">
                                            &nbsp;
                                            <MinusCircleOutlined @click="removePermissionUrl(index)" />
                                        </a-col>
                                    </a-row>

                                </a-col>
                            </a-row>
                            <a-button type="dashed" block @click="addPermissionUrl">
                                <PlusOutlined />
                                新增权限URL
                            </a-button>
                        </ops-form-item>
                    </template>
                    <template v-else>
                        <template v-if="t.field === 'level_2'">
                            <ops-form-item
                                v-if="formRenderContent?.formState?.['level_2'] !== 0"
                                v-model:value="formRenderContent.formState[t.field]"
                                :title="t"
                                :title-data="formRenderContent?.title_data?.[t.field]"
                                :required="t?.edit_required? true : false"
                            >
                            </ops-form-item>
                        </template>
                        <ops-form-item
                            v-else
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :required="t?.edit_required? true : false"
                        >
                        </ops-form-item>
                    </template>


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
:deep(.ant-space-item) {
    width: 100% !important;
}

.xy-url-input  {
     min-width: 100%;
}

</style>
