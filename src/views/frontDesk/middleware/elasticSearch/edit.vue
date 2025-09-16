<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import API from "@/api/middleware/elasticSearch";
import { ADD_TYPE, EDIT_TYPE } from "@/config/globalOption";
import { encodePasswd, encrypt } from "@/composables/encryptField";
import { clone } from "xe-utils";
import http from "@/utils/axios";

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
const addressFormRef = ref([]);
const { putEdit, getDetail, postAdd } = API;

const state = reactive({
    hasInfo: false,
    ori_address_pwd_manage: null
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
    formSubmit
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, addApi: postAdd, editApi: putEdit, oneDataApi: getDetail, customSubmitData, customEditData, customSubmit});

const editTitle = computed(() => {
    const infoFields = ['cluster_type', 'ip', 'primary_user', 'primary_user_pwd'];
    const order = ['cloud_source',  'cluster_type', 'ip','primary_user', 'primary_user_pwd', 'name', 'node_info', 'version', 'environment', 'address_pwd_manage', 'cloud_status', 'status', 'describe'];

    const titles = (formRenderContent.value?.title?.filter(item => item.edit_display) || []).slice().sort((a, b) => {
        const ia = order.indexOf(a.field);
        const ib = order.indexOf(b.field);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });

    return titles.filter(item => {
        if(formType.value === ADD_TYPE) {
            if(infoFields.includes(item.field)) {
                return true;
            }
            else {
                return state.hasInfo;
            }
        }
        else {
            return !['ip'].includes(item.field);
        }
    });
});

// 自定义处理单条数据
function customEditData(data) {
    state.ori_address_pwd_manage = clone(data.value.address_pwd_manage, true);
    data.value.node_info = data.value.nodes;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    if(formType.value === EDIT_TYPE) {
        delete data.name;
        delete data.version;
        delete data.cluster_type;
        delete data.node_info;
        delete data.status;
        delete data.cluster_id;

        try{
            // 对比address_pwd_manage是否有差异
            let addressPwdChanged = false;
            if(state.ori_address_pwd_manage === data?.address_pwd_manage) {
                addressPwdChanged = false;
            }
            else {
                if (state.ori_address_pwd_manage?.length !== data?.address_pwd_manage.length) {
                    addressPwdChanged = true;
                } else {
                    for (let i = 0; i < state.ori_address_pwd_manage.length; i++) {
                        const ori = state.ori_address_pwd_manage[i];
                        const cur = data.address_pwd_manage[i];
                        // 简单深度对比
                        if (JSON.stringify(ori) !== JSON.stringify(cur)) {
                            addressPwdChanged = true;
                            break;
                        }
                    }
                }
            }
            
            if(!addressPwdChanged) {
                delete data.address_pwd_manage;
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    delete data.cluster_uuid;
    delete data.ip;
    delete data.nodes;
    delete data.cloud_status;

    return data;
}

async function customSubmit(data) {
    try {
        await Promise.all(addressFormRef.value.map(formRef => formRef.validateFields()));

        const submitData = clone(data, true);
        const key = await http.get('public/random/key');
        const randomKey = key.key;

        if(submitData.address_pwd_manage) {
            submitData.address_pwd_manage.forEach(async addr => {
                if(addr.addr_type === 'Kibana') {
                    addr.username = data.primary_user || null;
                    addr.password = submitData.primary_user_pwd ? encrypt(submitData.primary_user_pwd, randomKey) : null;
                }
                else {
                    addr.username = addr.username || null;
                    addr.password = addr.password ? encrypt(addr.password, randomKey) : null;
                }
            });
        }

        if(!submitData.primary_user_pwd) {
            delete submitData.primary_user;
            delete submitData.primary_user_pwd;
        } else {
            submitData.primary_user_pwd = encrypt(submitData.primary_user_pwd, randomKey);
        }

        await formSubmit(submitData);
    }
    catch (error) {
        console.log(error);
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
        state.hasInfo = formType.value !== ADD_TYPE;
    }
};

// 添加地址
const addAddr = () => {
    formRenderContent.value.formState?.address_pwd_manage.push({ addr_type: 'Kibana' });
};

// 删除地址
const delAddr = (index) => {
    formRenderContent.value.formState?.address_pwd_manage.splice(index, 1);
};

// 获取信息
const getInfo = async () => {
    formRef.value.validateFields(['cluster_type', 'ip']).then(async () => {
        const formState = formRenderContent.value.formState;
        if(formType.value === EDIT_TYPE && (!formState.primary_user || !formState.primary_user_pwd)) {
            return;
        }

        try {
            formDataLoading.value = true;
            confirmLoading.value = true;

            let data;
            if(!formState.primary_user_pwd) {
                data = {
                    ip: formState.ip || formState.node_info?.[0]?.node_ip,
                };
            } else {
                data = {
                    ip: formState.ip || formState.node_info?.[0]?.node_ip,
                    user: formState.primary_user,
                    pwd: await encodePasswd(formState.primary_user_pwd),
                };
            }

            const info = await API.getInfo(formState.cluster_type, data);

            Object.keys(info).forEach(key => {
                formState[key] = info[key];
            });
            formState.node_info = info.nodes;
            formState.cluster_id = info.cluster_uuid;

            state.hasInfo = true;
            formDataLoading.value = false;
            confirmLoading.value = false;
        }
        catch {
            formDataLoading.value = false;
            confirmLoading.value = false;
        }
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
                :rules="formRenderContent.rules"
            >
                <template v-for="t in editTitle" :key="t.field">
                    <template v-if="t.field === 'cloud_source'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="true"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'address_pwd_manage'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-form-item-rest
                                v-for="(addr, index) in formRenderContent.formState[t.field]"
                                :key="index"
                            >
                                <div class="address-box">
                                    <span class="del-btn" @click="delAddr(index)">删除</span>

                                    <a-form
                                        :ref="el => { if(el) addressFormRef[index] = el }"
                                        :model="addr"
                                        layout="inline"                              
                                    >
                                        <a-form-item label="类型" name="addr_type" :rules="[{ required: true }]">
                                            <a-input :id="`addr_type-${index}`" v-model:value="addr.addr_type"/>
                                        </a-form-item>

                                        <a-form-item label="地址" name="addr" :rules="[{ required: true }]">
                                            <a-input :id="`addr-${index}`" v-model:value="addr.addr" placeholder="http或https开头的完整地址"/>
                                        </a-form-item>

                                        <a-form-item label="用户名" name="username">
                                            <a-input :id="`username-${index}`" v-model:value="addr.username" :disabled="addr.addr_type === 'Kibana'"/>
                                        </a-form-item>

                                        <a-form-item label="密码" name="password">
                                            <a-input :id="`password-${index}`" v-model:value="addr.password" :disabled="addr.addr_type === 'Kibana'"/>
                                        </a-form-item>
                                    </a-form>
                                </div>
                            </a-form-item-rest>

                            <a-button type="dashed" block @click="addAddr">
                                <PlusOutlined />
                                新增可视化地址
                            </a-button>
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'cluster_type'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="!(!state.hasInfo && formType === ADD_TYPE)"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'ip'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="(state.hasInfo || !formRenderContent.formState.cluster_type) && formType === ADD_TYPE"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'primary_user'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="(state.hasInfo || !formRenderContent.formState.cluster_type) && formType === ADD_TYPE"
                            :placeholder="formRenderContent.formState.cloud_source === '自建' ? '填写用户名与密码后会验证其准确性' : '云来源的主用户名与密码不做验证，只维护'"
                            @blur="formType === EDIT_TYPE && formRenderContent.formState.cloud_source === '自建' && getInfo()"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'primary_user_pwd'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :disabled="(state.hasInfo || !formRenderContent.formState.cluster_type) && formType === ADD_TYPE"
                            :placeholder="formRenderContent.formState.cloud_source === '自建' ? '填写用户名与密码后会验证其准确性' : '云来源的主用户名与密码不做验证，只维护'"
                            @blur="formType === EDIT_TYPE && formRenderContent.formState.cloud_source === '自建' && getInfo()"
                        >
                            <ops-password
                                v-model:value="formRenderContent.formState[t.field]"
                                :username="formRenderContent.formState?.primary_user"
                                :disabled="(state.hasInfo || !formRenderContent.formState.cluster_type) && formType === ADD_TYPE"
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

                    <template v-else-if="t.field === 'node_info'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                        >
                            <div class="custom-table-responsive">
                                <table class="custom-table custom-table-bordered">
                                    <thead class="thead-light">
                                    <tr>
                                        <th>IP</th>
                                        <th>名称</th>
                                        <th>master</th>
                                        <th>角色</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <template v-if="formRenderContent.formState[t.field]">
                                        <tr v-for="(item, key) in formRenderContent.formState[t.field]" :key="key">
                                            <td>{{ item.node_ip }}</td>
                                            <td>{{ item.node_name }}</td>
                                            <td>{{ item.master }}</td>
                                            <td>{{ item.roles }}</td>
                                        </tr>
                                    </template>
                                    <tr v-else><td colspan="4">无</td></tr>
                                    </tbody>
                                </table>
                            </div>
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
            <vxe-button v-if="!state.hasInfo" status="primary" @click="getInfo">获取集群信息</vxe-button>
            <vxe-button content="取消" @click="handleDrawerClose"/>
            <vxe-button v-if="state.hasInfo" type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>
</template>

<style scope lang="scss">
.address-box {
    border: 1px solid rgb(233, 233, 233);
    border-radius: 5px;
    padding: 0 10px 10px 10px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;

    .del-btn {
        color: rgb(255, 81, 81);
        margin-left: auto;
        cursor: pointer;
    }

    .ant-form-item {
        width: 45%;
        margin: 8px 0;
    }
}
</style>
