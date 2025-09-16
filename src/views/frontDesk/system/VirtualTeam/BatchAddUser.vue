<script setup>
/** 该模块用于虚拟组批量新增用户**/
import UserSearchSelect from "./UserSearchSelect.vue";
import virtualTeamApi from "@/api/system/virtualTeamApi";


const props = defineProps({
    oneVirtualTeam: {
        type: Object,
        default: () => ({}),
    },
    open: {
        type: Boolean,
        default: false,
    }
});

const dynamicValidateFormRef = ref(null);
const dynamicValidateForm = reactive({
    users: [],
});

const emits = defineEmits(['update:open', 'userReload']);

// 跟踪已选择的用户ID
const selectedUserIds = ref(new Set());

// 弹窗打开时初始化一行
const handleDrawerOpen = () => {
    selectedUserIds.value.clear(); // 清空已选用户集合
    dynamicValidateForm.users = [{
        cmdb_user_v3_id: null,
        user_tag: null,
        loading: false,
        id: Date.now(),
    }];
};

const handleDrawerClose = () => {
    emits('update:open', false);
};

const removeUser = (item) => {
    const index = dynamicValidateForm.users.indexOf(item);
    if (index !== -1) {
        dynamicValidateForm.users.splice(index, 1);
        // 如果删除后没有行了，自动添加一行
        if (dynamicValidateForm.users.length === 0) {
            addUser();
        }
    }
};

// 用户选择后的处理
const handleUserSelect = (value, index) => {
    const oldValue = dynamicValidateForm.users[index].cmdb_user_v3_id;
    // 如果之前有选择，从已选集合中移除
    if (oldValue) {
        selectedUserIds.value.delete(oldValue);
    }
    
    // 如果选择了新值，添加到已选集合
    if (value) {
        selectedUserIds.value.add(value);
        
        // 如果是最后一行，添加新行
        if (index === dynamicValidateForm.users.length - 1) {
            addUser();
        }
    }
};

// 添加新行
const addUser = () => {
    dynamicValidateForm.users.push({
        cmdb_user_v3_id: null,
        user_tag: null,
        loading: false,
        id: Date.now(),
    });
};

// 在指定位置后添加新行
const addUserAfter = (index) => {
    const newUser = {
        cmdb_user_v3_id: null,
        user_tag: null,
        loading: false,
        id: Date.now(),
    };
    // 在指定索引后插入新行
    dynamicValidateForm.users.splice(index + 1, 0, newUser);
};

const handleSubmitData = async () => {
    try {
        // 过滤出已选择用户的数据
        const validUsers = dynamicValidateForm.users.filter(user => user.cmdb_user_v3_id);
        
        if (validUsers.length) {
            for (const user of validUsers) {
                const currentIndex = dynamicValidateForm.users.indexOf(user);
                dynamicValidateForm.users[currentIndex].loading = true;
                dynamicValidateForm.users[currentIndex].msg = ''; // 清空之前的消息
                
                const data = {
                    action: 'add',
                    cmdb_user_v3_id: user.cmdb_user_v3_id,
                    user_tag: user.user_tag || '',
                };
                
                try {
                    const res = await virtualTeamApi.putEditVirtualTeamUser(props.oneVirtualTeam.id, data);
                    // 设置成功消息
                    dynamicValidateForm.users[currentIndex].msg = res.msg;
                    dynamicValidateForm.users[currentIndex].status = 'success';
                } catch (error) {
                    // 设置错误消息
                    dynamicValidateForm.users[currentIndex].msg = error?.response?.data?.msg || '添加失败';
                    dynamicValidateForm.users[currentIndex].status = 'error';
                } finally {
                    dynamicValidateForm.users[currentIndex].loading = false;
                }
            }
            
            // 检查是否所有用户都添加成功
            const allSuccess = validUsers.every(user => {
                const index = dynamicValidateForm.users.indexOf(user);
                return dynamicValidateForm.users[index].status === 'success';
            });
            
            if (allSuccess) {
                // 全部成功时关闭弹窗并刷新列表
                setTimeout(() => {
                    emits('update:open', false);
                    emits('userReload', props.oneVirtualTeam.id);
                }, 1000); // 延迟关闭，让用户看到成功消息
            }
        }
    } catch (error) {
        console.log('Failed:', error);
    }
};

// 提供已选用户ID集合给子组件
const getDisabledUserIds = computed(() => Array.from(selectedUserIds.value));

// 搜索说明文本
const searchTips = `搜索规则：
1. 输入用户名可进行模糊搜索
2. 输入完整手机号可精确匹配用户
3. 输入完整邮箱地址可精确匹配用户
4. 已选择的用户将被禁用，无法重复选择`;

defineExpose({
    dynamicValidateFormRef
});
</script>

<template>
    <ops-form-container
        :title="`【${oneVirtualTeam?.group_name}】组中批量新增用户`"
        :open="open"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
        <div class="batch-add-container">
            <a-alert
                class="search-tips"
                :message="searchTips"
                type="info"
                show-icon
            />
            <a-form
                ref="dynamicValidateFormRef"
                name="dynamic_form_nest_item"
                :model="dynamicValidateForm"
            >
                <div 
                    v-for="(user, index) in dynamicValidateForm.users"
                    :key="user.id"
                    class="user-row"
                >
                    <a-space
                        style="display: flex; margin-bottom: 8px"
                        align="baseline"
                    >
                        <a-form-item
                            :name="['users', index, 'cmdb_user_v3_id']"
                        >
                            <user-search-select
                                v-model:value="user.cmdb_user_v3_id"
                                style="width: 500px"
                                :disabled-user-ids="getDisabledUserIds"
                                @select-change="(val) => handleUserSelect(val, index)"

                            />
                        </a-form-item>
                        <a-form-item
                            :name="['users', index, 'user_tag']"
                        >
                            <a-input v-model:value="user.user_tag" placeholder="分组" />
                        </a-form-item>
                        <div class="action-buttons">
                            <MinusCircleOutlined 
                                v-if="dynamicValidateForm.users.length > 1"
                                class="action-icon delete-icon"
                                @click="removeUser(user)" 
                            />
                            <i
                                class="action-icon add-icon vxe-icon--circle-plus"
                                @click="addUserAfter(index)"
                            ></i>
                        </div>
                        <a-spin :spinning="user.loading">
                            <span :class="['message', user.status]">{{ user?.msg }}</span>
                        </a-spin>
                    </a-space>
                </div>
            </a-form>
        </div>
        <template #footer>
            <a-button type="primary" @click="handleSubmitData">提交</a-button>
        </template>
    </ops-form-container>
</template>

<style scoped lang="less">
.batch-add-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.search-tips {
    margin-bottom: 8px;
}

:deep(.ant-alert-message) {
    white-space: pre-line;
}

.user-row {
    position: relative;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-icon {
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    transition: all 0.3s;
}

.delete-icon {
    color: #ff4d4f;
    &:hover {
        color: #ff7875;
    }
}

.add-icon {
    color: #52c41a;
    &:hover {
        color: #73d13d;
    }
}

.message {
    font-size: 12px;
    margin-left: 8px;
    
    &.success {
        color: #52c41a;
    }
    
    &.error {
        color: #ff4d4f;
    }
}
</style>
