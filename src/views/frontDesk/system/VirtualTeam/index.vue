<script setup>
import commonApi from "@/api/common";
import virtualTeamApi from "@/api/system/virtualTeamApi";
import {clone, uniq} from 'xe-utils';
import systemConfig from "@/config/index";
import pageInit from "@/composables/pageInit";
import BatchAddUser  from "./BatchAddUser.vue";
import { message, Modal } from 'ant-design-vue';
import {createVNode} from "vue";


let { getCommonBusinessList } = commonApi;

const {
    business_data,
    requestBusinessData, // 获取公共业态的数据
} = getCommonBusinessList();

const titleLayer = 1;
const userTagOptions = ref([]);
// 获取页面的title、button
let  {
    initFormState,
    button,
    getPageTitleButton,
    formState,
} = pageInit({layer: titleLayer});

const virtualTeamDataItem = {
    list: [], // 获取所有接口组列表的数据
    loading: false, // 获取接口组的loading
    error_msg: null, //
    error_status: null,
    activeKeyTab: null,
};

let virtualTeamData = ref(virtualTeamDataItem);
let pageType = ref(null); // 用于判断当前的页面类型
let oneVirtualTeam = ref({ // 获取单条接口组的详细信息
    loading: false,
    data: {},
});
let searchKey = ref(''); // 当前搜索的接口组



// 用于获取用户的操作权限
const canUserAction = computed(() => {
    let result = {};
    if (button.value) {
        for (let btn of button.value) {
            let { field } = btn;
            switch (field) {
                case 'add':
                case 'user_edit': // 当前虚拟组用户的新增、编辑、删除
                case 'edit':
                    result[field] = btn;
                    break;
            }
        }
    }
    return result;
});

// 获取所有虚拟组列表的数据
const handleGetVirtualTeamData = async () => {
    virtualTeamData.value.loading = true;
    virtualTeamData.value.activeKeyTab = null;
    try {
        virtualTeamData.value.loading = false;
        const allVirtual = await virtualTeamApi.getVirtualTeamList();
        virtualTeamData.value.list = allVirtual.map(team => { // 获取当前页面所有的虚拟组列表数据
            team['value'] = team.group_name;
            return team;
        }).reverse();
        if (virtualTeamData.value.list?.[0]?.id) {
            await handleVirtualTeamClick(virtualTeamData.value.list?.[0]?.id); // 默认第一个给予点击的状态
        }

    } catch (error){
        let response = error?.response;
        virtualTeamData.value.error_status = response?.status;
        virtualTeamData.value.error_msg = response?.message || response?.data?.msg;
        virtualTeamData.value.loading = false;
    };
};



// 读取一个组的用户信息
const virtualTeamOneUser = ref([]);
const handleOneVirtualteamUserMessage = async (val) => {
    userTagOptions.value = [];
    virtualTeamOneUser.value = []; // 清空当前的用户信息
    virtualTeamOneUser.value = await virtualTeamApi.getVirtualTeamOneUserData(val) || [];
    virtualTeamOneUser.value = virtualTeamOneUser.value.map(item => {
        item.user_tag = item.user_tag && item.user_tag !== 'null' ? item.user_tag : '默认分组';
        userTagOptions.value.push(item.user_tag);
        return item;
    });
};

let checkLeader = ref(null);
// 组名称的点击
const handleVirtualTeamClick = async (val) => {
    currentEditVirtualTeam.value.id = val;
    oneVirtualTeam.value.loading = true;
    oneVirtualTeam.value.data = {};
    pageType.value = null;
    virtualTeamData.value.activeKeyTab = val;
    formState = clone(initFormState);
    virtualTeamApi.getVirtualTeamOneData(val)
        .then(async  res => {
            oneVirtualTeam.value.loading = false;
            oneVirtualTeam.value.data = res;
            checkLeader.value = res?.group_leader_id ? res.group_leader_id : null;
            await handleOneVirtualteamUserMessage(val);
        })
        .catch(() => {
            oneVirtualTeam.value.loading = false;
        });
};

// 用于汇总当前编辑的数据
let currentEditVirtualTeam = ref({});

// 添加虚拟组
const handleAddVirtualTeam = () => {
    pageType.value = systemConfig.FORM_TYPE.ADD_TYPE;
    virtualTeamData.value.activeKeyTab = null;
    currentEditVirtualTeam.value.id = null;
    virtualTeamOneUser.value = []; // 清空当前的用户信息
    // 初始化组名选项
    handleSearch('', 'group_name');
};


// 临时存储编辑中的标签值
const editingTags = ref({});

// 处理标签输入变更
const handleTagInput = (value, item) => {
    // 将变更存储在临时对象中，不直接修改原数据
    editingTags.value[item.cmdb_user_v3__id] = value;
};

// 修改提交函数，处理组长设置和标签更新
const handleUserActionSubmit = () => {
    if (formState.group_name) {
        let sendData = {
            group_name: formState.group_name,
            group_leader_id: formState.group_leader_id,
            business_group_id: null,
        };

        // 如果有标签变更，添加到请求数据中
        const tagUpdates = [];
        for (const [userId, newTag] of Object.entries(editingTags.value)) {
            const user = virtualTeamOneUser.value.find(u => u.cmdb_user_v3__id === Number(userId));
            if (user && user.user_tag !== newTag) {
                tagUpdates.push({
                    action: 'edit',
                    cmdb_user_v3_id: userId,
                    user_tag: newTag
                });
            }
        }

        const submitRequests = [];
        
        if (pageType.value === systemConfig.FORM_TYPE.ADD_TYPE) {
            submitRequests.push(
                virtualTeamApi.postAddVirtualTeam(sendData)
                    .then(res => {
                        handleVirtualTeamClick(res?.data?.id);
                        return res;
                    })
            );
        } else {
            // 编辑模式或设置组长
            submitRequests.push(
                virtualTeamApi.putEditVirtualTeam(virtualTeamData.value.activeKeyTab || oneVirtualTeam.value.data.id, sendData)
                    .then(res => {
                        // 如果有标签更新，逐个处理
                        const tagPromises = tagUpdates.map(update => 
                            virtualTeamApi.putEditVirtualTeamUser(virtualTeamData.value.activeKeyTab || oneVirtualTeam.value.data.id, update)
                        );
                        return Promise.all([res, ...tagPromises]);
                    })
            );
        }

        return Promise.all(submitRequests)
            .then(([res]) => {
                handleVirtualTeamClick(virtualTeamData.value.activeKeyTab || oneVirtualTeam.value.data.id);
                message.success(res?.msg || '操作成功');
                // 清空临时存储的标签
                editingTags.value = {};
                oneVirtualTeam.value.loading = false;
            })
            .catch((error) => {
                message.error(error?.response?.message || '操作失败');
                oneVirtualTeam.value.loading = false;
            });
    }
    return Promise.reject('请填写组名');
};

/** 用于左右切换用户的按钮点击，只有编辑表单的时候会触发**/


onMounted(async () => {
    await getPageTitleButton();
    await handleGetVirtualTeamData();
    requestBusinessData();
    // 初始化组名选项
    handleSearch('', 'group_name');
});


// 用户的添加
let userModalOpen = ref(false);
const handleAddUser = () => {
    userModalOpen.value = true;
    handleSearch('', 'group_name');
};
// 确认编辑用户
const handleEditConfirm = (type) => {
    let data = {
        action: type,
        cmdb_user_v3_id: currentOperateUser.value?.cmdb_user_v3__id,
        user_tag: currentOperateUser.value.user_tag,
    };
    virtualTeamApi.putEditVirtualTeamUser(oneVirtualTeam.value.data.id, data)
        .then(async (res) => {
            message.success(res.msg);
            await  handleOneVirtualteamUserMessage(oneVirtualTeam.value.data.id);
        })
        .catch((error) => {
            message.success(error?.response?.message);
        })
    ;

};

// 当前操作的用户
let currentOperateUser = ref({});
const handleOperateUser = (item,idx, type) => {
    currentOperateUser.value = clone(item, true);
    switch (type) {
        case 'edit':
            item.is_edit = true;
            currentOperateUser.value.idx = idx;
            break;
        case 'delete':
            Modal.confirm({
                icon: createVNode('i', {class: 'vxe-icon-warning-triangle-fill text-warning', style:{display: 'inline-black'}}, ` 是否删除 "${oneVirtualTeam.value?.data?.group_name}" 组中的 "${item.cmdb_user_v3__username}" 用户？`),
                okText: '是',
                cancelText: '否',
                onOk() {
                    handleEditConfirm(type);
                },
                onCancel() {
                },
            });
            break;
    }
};

/*** 自动填充搜索**/
const autoCompleteVirtualteamOption = ref([]);

// 搜索处理函数
const handleSearch = (val, type) => {
    // 根据搜索类型获取不同的数据源
    const getDataSource = () => {
        switch (type) {
            case 'group_name':
                // 从虚拟组列表中获取组名选项
                return virtualTeamData.value.list.map(item => ({
                    value: item.group_name,
                    label: item.group_name
                }));
            case 'user_tag':
                // 从用户标签中获取选项
                return uniq(userTagOptions.value).map(tag => ({
                    value: tag,
                    label: tag
                }));
            default:
                return [];
        }
    };

    // 如果没有搜索值，返回所有选项
    if (!val) {
        autoCompleteVirtualteamOption.value = getDataSource();
        return;
    }

    // 搜索值处理
    const searchValue = val.toString().trim().toLowerCase();
    
    // 根据不同类型进行过滤
    autoCompleteVirtualteamOption.value = getDataSource().filter(option => {
        const targetValue = option.label.toString().toLowerCase();
        return targetValue.includes(searchValue);
    });
};

// 监听虚拟组列表变化，更新选项
watch(() => virtualTeamData.value.list, (newVal) => {
    if (newVal.length) {
        handleSearch('', 'group_name');
    }
}, { deep: true });

// 监听用户标签选项变化，更新选项
watch(() => userTagOptions.value, (newVal) => {
    if (newVal.length) {
        handleSearch('', 'user_tag');
    }
}, { deep: true });


// 当前编辑状态
const editingState = ref({
    userId: null,
    isEditing: false,
    originalValue: null
});

// 处理开始编辑
const handleUserTag = (user) => {
    // 初始化编辑状态
    editingState.value = {
        userId: user.cmdb_user_v3__id,
        isEditing: true,
        originalValue: user.user_tag
    };
    
    // 初始化自动完成选项
    handleSearch('', 'user_tag');
    
    return false; // 阻止默认的编辑行为
};

// 处理标签确认
const handleTagConfirm = async (user) => {
    try {
        const newTag = editingTags.value[user.cmdb_user_v3__id];
        if (newTag !== user.user_tag) {
            const data = {
                action: 'edit',
                cmdb_user_v3_id: user.cmdb_user_v3__id,
                user_tag: newTag
            };
            
            await virtualTeamApi.putEditVirtualTeamUser(oneVirtualTeam.value.data.id, data);
            message.success('更新分组成功');
            await handleOneVirtualteamUserMessage(oneVirtualTeam.value.data.id);
        }
    } catch (error) {
        message.error(error?.response?.message || '更新分组失败');
    } finally {
        editingState.value.isEditing = false;
    }
};

// 处理标签取消
const handleTagCancel = (user) => {
    // 恢复原始值
    editingTags.value[user.cmdb_user_v3__id] = editingState.value.originalValue;
    editingState.value.isEditing = false;
};

// 处理设置组长
const handleSetGroupLeader = (user) => {
    Modal.confirm({
        title: '',
        icon: createVNode('i', {class: 'vxe-icon-warning-triangle-fill text-warning', style:{display: 'inline-black'}}, ` 是否设置 "${user.cmdb_user_v3__username}" 为 "${oneVirtualTeam.value?.data?.group_name}" 组的组长？`),
        okText: '是',
        cancelText: '否',
        onOk() {
            // 设置组长时，使用当前组名和新的组长ID
            formState.group_name = oneVirtualTeam.value.data.group_name;
            formState.group_leader_id = user.cmdb_user_v3__id;
            // 调用共用的提交方法
            return handleUserActionSubmit();
        }
    });
};


provide('business_data', business_data);

</script>

<template>

    <a-card
        :loading="virtualTeamData.loading"
        :bordered="false"
        class="vitual-team-card"
    >
        <template #title>
            <vxe-button v-if="canUserAction?.add?.page_display" icon="vxe-icon-add" status="primary" content="新增" @click="handleAddVirtualTeam"/>
        </template>
        <template #extra>
            <vxe-button :loading="virtualTeamData.loading" content="刷新"  icon="vxe-icon-refresh" status="primary" @click="handleGetVirtualTeamData"/>
        </template>
        <template v-if="pageType">
            <a-alert
                message="提示"
                :description="`页面处于【${pageType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}】用户组中...`"
                type="warning"
                show-icon
                closable
            />
            <br/>
        </template>

        <div class="virtualteam-box">
            <div class="virtualteam-list-box">
                <div>
                    <a-input v-model:value="searchKey"  placeholder="仅支持组名的搜索">
                        <template #prefix>
                            <i class="vxe-icon-search" style="color: #adb5bd;"></i>
                        </template>
                    </a-input>
                </div>
                <a-tabs
                    v-model:active-key="virtualTeamData.activeKeyTab"
                    :tab-bar-style="{width: '100%'}"
                    tab-position="left"
                    animated
                    @change="handleVirtualTeamClick"
                >
                    <a-tab-pane v-for="group in virtualTeamData.list"  :key="group.id" :team="group">
                        <template #tab>
                            <div v-show="!searchKey.trim() || group.group_name.toLowerCase().indexOf(searchKey.trim().toLowerCase()) !== -1">
                                {{group.group_name}}

                            </div>
                        </template>
                    </a-tab-pane>
                </a-tabs>
            </div>
            <a-spin  :spinning="oneVirtualTeam.loading" wrapper-class-name="virtual-team-detail-message">
                <a-flex justify="space-between" class="mb-2">
                    <div  style="width: 25%; height: 50px">
                        <a-badge-ribbon text="组名"  >
                            <a-card>
                                <template #title>
                                    <a-auto-complete v-if="pageType === $CONFIG.FORM_TYPE.ADD_TYPE" v-model:value="formState.group_name" :options="autoCompleteVirtualteamOption"   :allow-clear="true"  style="width: 100%" @search="(val) => handleSearch(val, 'group_name')"></a-auto-complete>
                                    <template v-else>
                                        {{oneVirtualTeam.data?.group_name}}
                                    </template>
                                </template>
                            </a-card>
                        </a-badge-ribbon>
                    </div>
                    <vxe-button v-if="pageType != $CONFIG.FORM_TYPE.ADD_TYPE && canUserAction?.user_edit?.page_display " status="primary" class="mb-2" icon="vxe-icon-add" content="添加用户" @click="handleAddUser"/>
                </a-flex>
                <div style="width: 100%;">
                    <div v-if="virtualTeamOneUser && virtualTeamOneUser.length" >
                        <a-radio-group v-model:value="checkLeader" class="w-1" style="width: 100%; background-color: #f5f5f5;padding: 1.5% 1% 1.5% 1%" name="cmdb_user_v3__id" button-style="solid"  size="small">
                        <a-card v-for="(user, tag) in $utils.groupBy(virtualTeamOneUser, 'user_tag')" :key="tag" style="margin-bottom: .5%" >
                            <template #title>
                                {{tag && tag !== 'null' ? tag :'默认分组'}}
                            </template>
                            <template v-if="user.length">
                                <a-flex  class="user-box" wrap="wrap" gap="16">
                                    <div v-for="(item, idx) in user" :key="item.cmdb_user_v3__id" class="min-w-[300px]">
                                        <a-badge-ribbon v-if="oneVirtualTeam.data?.group_leader_id === item.cmdb_user_v3__id && !pageType" 
                                            text="组长" class="z-10">
                                        </a-badge-ribbon>
                                        <a-card style="box-shadow: rgba(0, 0, 0, 0.13) 0px 2px 8px" class="user-card">
                                            <div>
                                                <div class="user-info">
                                                    <div class="info-item">
                                                        <span class="label">用户名：</span>
                                                        <span class="value">{{item.cmdb_user_v3__username}}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="label">手机号：</span>
                                                        <span class="value">{{item.cmdb_user_v3__mobile}}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="label">邮箱：</span>
                                                        <span class="value">{{item.cmdb_user_v3__email}}</span>
                                                    </div>
                                                    <div class="info-item">
                                                        <span class="label">分组：</span>
                                                        <span class="value">
                                                                <template v-if="editingState.isEditing && editingState.userId === item.cmdb_user_v3__id">
                                                                    <a-space>
                                                                        <a-auto-complete
                                                                            :value="editingTags[item.cmdb_user_v3__id] ?? item.user_tag"
                                                                            :options="autoCompleteVirtualteamOption"
                                                                            :allow-clear="true"
                                                                            style="width: 120px"
                                                                            @search="(val) => handleSearch(val, 'user_tag')"
                                                                            @change="(value) => handleTagInput(value, item)"
                                                                        />
                                                                        <a-button
                                                                            type="link"
                                                                            size="small"
                                                                            @click="handleTagConfirm(item)"
                                                                        >
                                                                            <template #icon><check-outlined /></template>
                                                                        </a-button>
                                                                        <a-button
                                                                            type="link"
                                                                            size="small"
                                                                            @click="handleTagCancel(item)"
                                                                        >
                                                                            <template #icon><close-outlined /></template>
                                                                        </a-button>
                                                                          <a-tooltip>
                                                                      <template #title>
                                                                         不填写时为 默认分组
                                                                      </template>
                                                                      <i class="vxe-icon-question-circle "></i>
                                                                  </a-tooltip>
                                                                    </a-space>
                                                                </template>
                                                                <a-typography-paragraph
                                                                    v-else
                                                                    :content="editingTags[item.cmdb_user_v3__id] ?? item.user_tag"
                                                                    :editable="canUserAction?.user_edit?.page_display ? { onStart: () => handleUserTag(item) } : false"
                                                                />
                                                            </span>
                                                    </div>

                                                </div>
                                                <div v-if="oneVirtualTeam.data?.group_leader_id !== item.cmdb_user_v3__id && canUserAction?.user_edit?.page_display" class="edit-controls pl-2">
                                                    <div  class="leader-select mb-0.5">
                                                        <vxe-button mode="text" status="primary" icon="vxe-icon-setting" @click="handleSetGroupLeader(item)">
                                                            设为组长
                                                            <a-tooltip>
                                                                <template #title>
                                                                    一个虚拟用户组仅有一个组长
                                                             </template>
                                                                <i class="vxe-icon-question-circle "></i>
                                                            </a-tooltip>
                                                        </vxe-button>
                                                    </div>
                                                </div>
                                            </div>

                                            
                                            <div  v-if="canUserAction?.user_edit?.page_display"  class="delete-btn">
                                                <vxe-button
                                                    mode="text" 
                                                    status="error" 
                                                    icon="vxe-icon-delete" 
                                                    content="删除" 
                                                    size="mini" 
                                                    @click="handleOperateUser(item,idx, 'delete')"
                                                />
                                            </div>
                                        </a-card>
                                    </div>
                                </a-flex>
                            </template>
                        </a-card>
                        </a-radio-group>
                    </div>

                    <template v-else>
                        <a-empty>
                            <template #description>
                               该虚拟组无用户
                            </template>
                        </a-empty>
                    </template>
                </div>
            </a-spin>
        </div>
        <template v-if="canUserAction?.edit?.page_display || canUserAction?.add?.page_display" #actions>
            <vxe-button v-if="pageType" content="提交" status="primary" @click="handleUserActionSubmit"/>
        </template>
        <BatchAddUser v-model:open="userModalOpen" :one-virtual-team="oneVirtualTeam.data || {}" @user-reload="handleOneVirtualteamUserMessage"></BatchAddUser>
    </a-card>
</template>



<style scoped lang="less">
.vitual-team-card {

    .virtualteam-box {
        display: flex;
        flex-direction: row;
        .virtualteam-list-box {
            width: 200px;
            margin-right: 1rem;
            flex-shrink: 0;
        }
        .virtual-team-detail-message {
            width: 100%;

        }
        :deep(.ant-tabs-tab.ant-tabs-tab-active) {
            background-color: aliceblue;
        }
        :deep(.ant-transfer-operation .ant-btn:not(:last-child)) {
            margin-right: 0px;

        }
    }
}
.tag-user {
    background-color: var(--vxe-ui-font-primary-color);
    margin-bottom: 3px;
    width: 100%;
}
.user-box {
    margin-bottom: 5px;
   
   
   

}

.user-card {
    position: relative;
    min-height: 100px;
    min-width: 300px;
    
    :deep(.ant-card-body) {
        padding: 12px;
    }

    .edit-controls {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 1;
        
        .leader-select {
            .vxe-button {
              
                font-size: 12px;
                
                &:hover {
                    background-color: #e6f7ff;
                }
                
                .vxe-icon-question-circle {
                    margin-left: 4px;
                }
            }
        }
    }

    .user-info {
        .info-item {
            margin-bottom: 8px;
            line-height: 1.5;
            display: flex;
            white-space: nowrap; // 防止换行
            
            .label {
                color: #666;
                width: 70px;
                flex-shrink: 0;
            }
            
            .value {
                flex: 1;
                overflow: hidden; // 超出隐藏
                text-overflow: ellipsis; // 显示省略号
                white-space: nowrap; // 防止换行
                position: relative;
                
                // 只对纯文本内容应用悬停效果
                > span:not(.ant-btn-link):not(.ant-typography-edit):not(.vxe-button) {
                    &:hover {
                        overflow: visible;
                        white-space: normal;
                        word-break: break-all;
                        background-color: #fff;
                        z-index: 2;
                    }
                }
                
                // 保持操作按钮可见
                :deep(.vxe-button),
                :deep(.ant-typography-edit),
                :deep(.ant-btn-link) {
                    visibility: visible !important;
                    display: inline-flex !important;
                }
            }
        }
    }

    .delete-btn {
        position: absolute;
        bottom: 12px;
        right: 12px;
        z-index: 3; // 确保删除按钮始终可见
        
        :deep(.vxe-button) {
            padding: 4px 8px;
            visibility: visible !important;
            display: inline-flex !important;
            
            &:hover {
                background-color: #fff1f0;
            }
        }
    }
}

// 调整卡片间距
.user-box {
    .ant-col {
        margin-bottom: 16px;
    }
}



</style>
