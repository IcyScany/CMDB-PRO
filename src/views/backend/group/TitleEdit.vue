<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import titleApi from "@/api/backend/titleApi";
import {menuTitle} from '@/config/menu/menuTitle';
import {clone} from "xe-utils";

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    sid: {
        type: [String, Number],
        default: '',
    },
    menuId: { // 菜单的id
        type: [String, Number],
        default: '',
    },
    formType: {
        type: Number,
    }
});
const {open, sid, formType, menuId} = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
let formRef = ref(null);
const editTitleLayer = 1;
const {putOneTitleEdit, getOneTitleList, postOneTitleAdd } = titleApi;

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


// 自定义返回的单条数据
const customOneData = (edit_data) => {
    let originEditData = clone(edit_data.value ? edit_data.value : {}, true);
    // 初始化 permissions_url
    if (!originEditData.permissions_url) {
        formRenderContent.value.formState.permissions_url = [];
    } else {
        formRenderContent.value.formState.permissions_url = originEditData.permissions_url.map(item => {
            const [method, url] = item.indexOf(':') > -1 
                ? String(item).split(':') 
                : ['', item];
            return { method, url, id: Date.now() };
        });
    }
};


const customTitleInit = () => {
    // 移除 permissions_url 的必填验证
    const permissionsUrlField = formRenderContent.value.title.find(
        item => item.field === 'permissions_url'
    );
    if (permissionsUrlField) {
        permissionsUrlField.edit_required = false;
    }
};

const customSubmitData = async (data) => {
    const submitData = { ...data };
    submitData.menu_id = menuId.value;
    
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
    if (data.page_data_source && typeof data.page_data_source === 'string') {
        submitData.page_data_source = JSON.parse(data.page_data_source);
    }
    
    return submitData;
};

let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, editApi: putOneTitleEdit, oneDataApi: getOneTitleList,addApi: postOneTitleAdd, customSubmitData, customOneData, customTitle: menuTitle, customTitleInit});


const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
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
        :title="`Title${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}`"
        :open="open"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >

        <a-spin :spinning="formDataLoading">
            <a-form
                ref="formRef"
                :model="formRenderContent.formState"
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
                    <ops-form-item
                        v-else
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                        :required="t?.edit_required? true : false"
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

</style>
