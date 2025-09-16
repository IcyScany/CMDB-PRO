<script setup>
import { VxeUI } from 'vxe-pc-ui';
import tableRender from "@/composables/table/tableRender";
import API from "@/api/security/pwdManagementApi";
import userOperate from "@/composables/form/opsUserOperate";
import { encodePasswd, decodePasswd } from "@/composables/encryptField";
import opsMessageTip from "@/composables/opsMessageTip";
import Edit from "./edit.vue";
import deleteProcess from "@/composables/deleteProcess";
import commonApi from "@/api/common";

const TITLE_LAYER = 1;
const FORM_RULES = {
    encryption_private_key: [{ required: true, message: '此项不能为空', trigger: 'change' }],
    new_key: [{ required: true, message: '此项不能为空', trigger: 'change' }],
    auth_code: [{ required: true, message: '此项不能为空', trigger: 'change' }],
    tips: [{ required: false, message: '此项不能为空', trigger: 'change' }]
};
const FIELD_NAME = {
    'Username with password' : { username: 'Username', pwd: 'password' },
    'SSH Username with private key' : { username: 'SSH Username', pwd: 'private key' },
    'Secret file' : { username: '', pwd: 'Secret file' },
    'Secret text' : { username: '', pwd: 'Secret text' },
    'AccessKey+SecretAccessKey' : { username: 'AccessKey', pwd: 'SecretAccessKey' },
    'Token' : { username: '', pwd: 'Token' },
    'Certificate' : { username: '证书公钥', pwd: '证书私钥' },
};

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    allOptions: {},
    verifyCode: '',
    modalType: 'copy',
    modalForm: {},
    modalRow: null,
    infoRow: null,
    visibleStates: {
        verify: false,
        change: false,
        reset: false,
        info: false
    },
    btnLoading: false,
    // batchAddVisible: false
});

// 表单引用
const formRefs = {
    change: ref(null),
    reset: ref(null)
};

// 用户操作相关
const { userEdit, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    const slotFields = ['uuid', 'share_limits', 'app_name', 'types'];
    
    return state.initColumn.map(col => {
        if (slotFields.includes(col.field)) {
            return {
                ...col,
                slots: { default: col.field }
            };
        }
        if (col.field === 'create_name') {
            return {
                ...col,
                showOverflow: false,
                slots: { default: col.field }
            };
        }
        if (col.field === 'create_time') {
            return {
                ...col,
                showOverflow: false,
                minWidth: '150px',
                slots: { default: col.field }
            };
        }
        return col;
    });
});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    const actionFields = ['edit', 'add', 'edit_key', 'edit_key_other', 'del'];
    return state.initButton.reduce((acc, btn) => {
        if (actionFields.includes(btn.field)) {
            acc[btn.field] = btn;
        }
        return acc;
    }, {});
});

onMounted(async () => {
    const { button, columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    await initializeOptions();
});

// 授权范围选项列表
const initializeOptions = async () => {
    try {
        const [teams, users] = await Promise.all([
            commonApi.getVirtualTeamList(),
            API.getUserList()
        ]);

        Object.values(teams).forEach(team => {
            state.allOptions[`team-${team.id}`] = team.group_name;
        });

        users.forEach(user => {
            state.allOptions[`user-${user.id}`] = `${user.username}`;
        });

        state.allOptions['ALL'] = '公共';
    } catch (error) {
        opsMessageTip({ content: '获取选项数据失败', type: 'error' });
    }
};

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        formOpen.value = false;
        await tableRef.value.commitRequest();
    }
};

// 更新info弹窗内容
const handleUpdateFullData = (data) => {
    if(state.visibleStates.info) {
        nextTick(() => {
            state.infoRow = data.find(item => item.id === state.infoRow.id);
        });
    }
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = async (row) => {
    if (row.is_check === 1 && !state.visibleStates.verify) {
        openModal('del', row);
    } else {
        deleteProcess(() => {
            API.delPwdManage(row.id, state.verifyCode).then((res) => {
                opsMessageTip({content: res?.msg, closeCallback: () => {
                    closeModal('del');
                    handleDataRefresh();
                }});
            }).catch(() => {
            });
        });
    }
};

// 展示请求返回信息
const showResMsg = (res) => {
    opsMessageTip({ type: res.status_code === 200 ? 'success' : 'error', content: res.msg });
};

// 模态框操作
const openModal = async (type, row) => {
    state.modalRow = row;
    state.modalType = type;
    state.verifyCode = '';
    
    const modalActions = {
        copy() {
            state.visibleStates.verify = true;
        },
        del() {
            state.visibleStates.verify = true;
        },
        change() {
            formRefs.change.value?.clearValidate();
            state.modalForm = {
                encryption_private_key: '',
                new_key: '',
                tips: ''
            };
            state.visibleStates.change = true;
        },
        reset() {
            formRefs.reset.value?.clearValidate();
            state.modalForm = {
                new_key: '',
                auth_code: '',
                tips: ''
            };
            state.visibleStates.reset = true;
        },
        info() {
            state.infoRow = row;
            state.visibleStates.info = true;
        }
    };

    await modalActions[type]?.();
};

// 模态框确认操作
const handleModalConfirm = async (type) => {
    try {
        state.btnLoading = true;
        
        const handlers = {
            async copy() {
                const res = await API.copyPwd(
                    state.modalRow.id,
                    await encodePasswd(state.verifyCode)
                );
                if (res.status_code === 200) {
                    VxeUI.clipboard.copy(decodePasswd(res));
                    closeModal('verify');
                }
                showResMsg(res);
            },
            
            async change() {
                await formRefs.change.value?.validate();
                const res = await API.changePwd({
                    ...state.modalForm,
                    id: state.modalRow.id
                });
                if (res.status_code === 200) {
                    closeModal('change');
                    handleDataRefresh();
                }
                showResMsg(res);
            },

            async sendCode() {
                API.sendCode(state.infoRow.cmdb_user_v3_id).then(res => {
                    if(res.status_code === 200) {
                        showResMsg(res);
                        openModal('reset', state.modalRow);
                    }
                });
            },
            
            async reset() {
                await formRefs.reset.value?.validate();
                const res = await API.resetPwd({
                    ...state.modalForm,
                    id: state.modalRow.id
                });
                if (res.status_code === 200) {
                    closeModal('reset');
                    handleDataRefresh();
                }
                showResMsg(res);
            },

            async del() {
                handleUserDel(state.modalRow);
            }
        };

        await handlers[type]?.();
    } catch (error) {
        if(error.message) {
            opsMessageTip({ content: error.message, type: 'error' });
        }
    } finally {
        state.btnLoading = false;
    }
};

// 关闭模态框
const closeModal = (type) => {
    state.visibleStates[type] = false;
    state.modalRow = null;
    state.modalForm = {};
    state.verifyCode = '';
};

// 复制username
const copyUsername = async (row) => {
    VxeUI.clipboard.copy(row?.username);
    opsMessageTip({ content: '复制成功', type: 'success' });
};

// 复制密码
const copyPwd = async (row) => {
    try {
        const res = await API.copyPwd(row?.id, '');
        if (res.status_code === 200) {
            VxeUI.clipboard.copy(decodePasswd(res));
        }
        showResMsg(res);
    } catch (error) {
        opsMessageTip({ content: '复制失败', type: 'error' });
    }
};

// 判断是否为URL
const isURL = (str) => {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
};
</script>

<template>
    <!-- 主表格部分 -->
    <ops-table
        ref="tableRef"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :request-config="{
            api: API.getPwdManageList,
            immediate: true
        }"
        :filter-config="{
            remote: false,
            showIcon: true
        }"
        :is-show-doc="true"
        @update:full-data="handleUpdateFullData"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #uuid="{ row }">
            <span class="text-primary cursor-pointer" @click="openModal('info', row)">
                {{ row.uuid }}
            </span>
        </template>

        <template #share_limits="{ row }">
            <span 
                v-for="(item, index) in row.share_limits" 
                :key="index" 
                class="mr-2"
            >
                {{ state.allOptions[item] }}
            </span>
        </template>

        <template #app_name="{ row }">
            <a v-if="isURL(row.app_name)" :href="row.app_name" target="_blank">{{ row.app_name }}</a>
            <span v-else>{{ row.app_name }}</span>
        </template>

        <template #types="{ row }">
            {{ state.initColumn.find(t => t.field === 'types')['page_data_source']['data'][row.types] }}
        </template>

        <template #create_name="{ row }">
            {{ state.allOptions[`user-${row.cmdb_user_v3_id}`] }} <br>
            {{ row.update_name }}
        </template>

        <template #create_time="{ row }">
            {{ row.create_time }} <br>
            {{ row.update_time }}
        </template>
    </ops-table>

    <!-- 凭证详情弹窗 -->
    <ops-form-container
        :title="state.infoRow?.uuid"
        :open="state.visibleStates.info"
        @close="state.visibleStates.info = false"
    >
        <div class="info-box">
            <!-- 用户名信息 -->
            <div v-if="state.infoRow?.username" class="info-content">
                <span class="info-title">{{ FIELD_NAME[state.infoRow?.types]?.username }}:</span>
                <span class="info-item">
                    <template v-if="state.infoRow?.types === 'Certificate'">
                        <vxe-button 
                            icon="vxe-icon-copy" 
                            status="primary" 
                            mode="text"
                            size="mini"
                            class="ml-2 cursor-pointer"
                            @click.stop="copyUsername(state.infoRow)"
                        />
                    </template>
                    <template v-else>
                        {{ state.infoRow?.username }}
                    </template>
                </span>
            </div>

            <!-- 密码信息 -->
            <div class="info-content">
                <span class="info-title">{{ FIELD_NAME[state.infoRow?.types]?.pwd }}:</span>
                <span class="info-item">
                    <vxe-button 
                        icon="vxe-icon-copy" 
                        status="primary" 
                        mode="text"
                        size="mini"
                        class="ml-2 cursor-pointer"
                        @click.stop="state.infoRow?.is_check === 1 
                            ? openModal('copy', state.infoRow)
                            : copyPwd(state.infoRow)"
                    />
                </span>
            </div>

            <!-- 密钥管理区域 -->
            <div class="info-content">
                <span class="info-title">自定义密钥密码:</span>
                <span class="info-item">
                    <template v-if="state.infoRow?.use_limits === '外部使用'">
                        <vxe-button 
                            icon="vxe-icon-edit" 
                            status="primary" 
                            mode="text"
                            size="mini"
                            class="ml-2 cursor-pointer"
                            @click.stop="openModal('change', state.infoRow)"
                        >
                            修改
                        </vxe-button>

                        <a-popconfirm
                            v-if="canUserAction['edit_key_other']"
                            title="重置密码时会将验证码发送至创建者的手机号与邮箱，是否要重置？"
                            ok-text="Yes"
                            cancel-text="No"
                            @confirm="handleModalConfirm('sendCode')"
                        >
                            <vxe-button 
                                icon="vxe-icon-repeat" 
                                status="primary" 
                                mode="text"
                                size="mini"
                                class="ml-2 cursor-pointer"
                            >
                                重置
                            </vxe-button>
                        </a-popconfirm>
                    </template>
                </span>
            </div>

            <!-- 密钥提示信息 -->
            <div class="info-content">
                <span class="info-title">自定义密钥密码提示符:</span>
                <span class="info-item">{{ state.infoRow?.tips }}</span>
            </div>
        </div>
    </ops-form-container>

    <!-- 操作确认弹窗 -->
    <a-modal
        :open="state.visibleStates.verify"
        :confirm-loading="state.btnLoading"
        @ok="handleModalConfirm(state.modalType)"
        @cancel="state.visibleStates.verify = false"
    >
        <template #title>
            {{ state.modalType === 'copy' 
                ? `复制密码 - ${state.modalRow?.uuid}`
                : `删除凭证 - ${state.modalRow?.uuid}`
            }}
        </template>
        
        <div class="flex items-center mb-2">
            <div class="w-40">自定义密钥密码: </div>
            <a-input v-model:value="state.verifyCode" />
        </div>
        <div v-if="state.modalRow?.tips" class="text-primary">
            (自定义密钥密码提示符: {{ state.modalRow?.tips }})
        </div>
    </a-modal>

    <!-- 修改密钥弹窗 -->
    <a-modal
        :open="state.visibleStates.change"
        :title="`修改密码 - ${state.modalRow?.uuid}`"
        :confirm-loading="state.btnLoading"
        @ok="handleModalConfirm('change')"
        @cancel="state.visibleStates.change = false"
    >
        <a-form 
            :ref="formRefs.change" 
            :model="state.modalForm" 
            :rules="FORM_RULES"
            :label-col="{ span: 5 }" 
            label-align="left"
        >
            <a-form-item label="旧密码" name="encryption_private_key">
                <a-input v-model:value="state.modalForm.encryption_private_key" />
            </a-form-item>
            <a-form-item label="新密码" name="new_key">
                <a-input v-model:value="state.modalForm.new_key" />
            </a-form-item>
            <a-form-item label="提示符" name="tips">
                <a-input v-model:value="state.modalForm.tips" />
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- 重置密钥弹窗 -->
    <a-modal
        :open="state.visibleStates.reset"
        :title="`重置密码 - ${state.modalRow?.uuid}`"
        :confirm-loading="state.btnLoading"
        @ok="handleModalConfirm('reset')"
        @cancel="state.visibleStates.reset = false"
    >
        <a-form 
            :ref="formRefs.reset" 
            :model="state.modalForm" 
            :rules="FORM_RULES"
            :label-col="{ span: 5 }" 
            label-align="left"
        >
            <a-form-item label="手机验证码" name="auth_code">
                <a-input v-model:value="state.modalForm.auth_code" />
            </a-form-item>
            <a-form-item label="新密码" name="new_key">
                <a-input v-model:value="state.modalForm.new_key" />
            </a-form-item>
            <a-form-item label="提示符" name="tips">
                <a-input v-model:value="state.modalForm.tips" />
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        :field-name="FIELD_NAME"
        :all-options="state.allOptions"
        @edit-success="handleDataRefresh"
    />
</template>

<style scoped lang="less">
.info-box {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;

    .info-content {
        flex: 1;
        overflow: hidden;
        border-bottom: 1px solid #eaeaea;

        .info-title {
            display: inline-block;
            padding: 10px;
            height: 40px;
            line-height: 20px;
            font-weight: 500;
        }

        .info-item {
            margin-left: 10px;
            height: 50px;
            line-height: 30px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
}
</style>
