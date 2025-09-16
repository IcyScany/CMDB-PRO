<script setup>
import groupApi from '@/api/backend/groupApi';
import { message, Modal } from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import successModal from '@/composables/successModal';

// 响应式数据
const groups = ref([]);
const selectedGroup = ref(null);
const groupTitles = ref([]);
const allTitles = ref({});
const selectedTitleIds = ref([]);
const addGroupModal = ref(false);
const editGroupModal = ref(false);
const newGroup = reactive({ name: '', description: '' });
const editGroup = reactive({ id: null, name: '', description: '' });
const loading = ref(false);
const getPageDataLoading = ref(false);

// 初始化分组数据
const initGroupData = {
    titles: [],
};
const checkedMenus = ref([]);
const checkedTitles = ref([]);
const expandList = ref({});



let diffGroupPermission = ref(initGroupData);
let groupCheckLoading = ref(false);
let submitGroupLoading = ref(false);

onMounted(async () => {
    await handlePageDataGet();
});

// 处理展开状态变化
function handleExpandChange({ menuId, expanded }) {
    console.log(menuId, expanded);
    expandList.value[menuId] = expanded;
}


// 获取基础数据
async function handlePageDataGet() {
    getPageDataLoading.value = true;
    groupCheckLoading.value = false;
    submitGroupLoading.value = false;
    
    try {
        await loadGroups();
        await loadAllTitles();
        updateCheckAllState();
        getPageDataLoading.value = false;
    } catch (error) {
        getPageDataLoading.value = false;
        message.error('获取数据失败');
    }
}

// 获取所有分组
const loadGroups = async () => {
    try {
        const res = await groupApi.getGroupList();
        groups.value = res || [];
    } catch (error) {
        message.error('获取分组列表失败');
    }
};

// 获取所有title
const loadAllTitles = async () => {
    try {
        const res = await groupApi.getTitleAndMenuTree();
        allTitles.value = res || {};
    } catch (error) {
        message.error('获取title列表失败');
        // 如果API不存在，使用模拟数据
        allTitles.value = {};
    }
};

// 切换分组
function handleChangeGroup(e) {
    diffGroupPermission.value = initGroupData;
    groupCheckLoading.value = true;
    selectedGroup.value = e.target.value;
    
    if (selectedGroup.value) {
        loadGroupTitles();
    } else {
        groupCheckLoading.value = false;
    }
}

// 加载分组下的title
const loadGroupTitles = async () => {
    checkedTitles.value = [];
    checkedMenus.value = [];
    try {
        const res = await groupApi.getTitlesByGroupId(selectedGroup.value);
        checkedTitles.value = res || [];
        groupTitles.value = res.data || [];
        // 初始化选中的title为当前分组中的title
        diffGroupPermission.value.titles = groupTitles.value.map(t => t.id);
        updateCheckAllState();
        groupCheckLoading.value = false;
    } catch (error) {
        message.error('获取分组下的title失败');
        groupCheckLoading.value = false;
    }
};





// 全选复选框状态
let checkboxAllState = ref({
    checkAll: false,
    indeterminate: false,
});

// 计算全选状态
function updateCheckAllState() {
    const checkedCount = diffGroupPermission.value.titles.length;
    const totalCount = allTitles.value?.menus?.length || 0;
    
    checkboxAllState.value.checkAll = checkedCount === totalCount && totalCount > 0;
    checkboxAllState.value.indeterminate = checkedCount > 0 && checkedCount < totalCount;
}




// 新增分组
const addGroup = async () => {
    try {
        if (!newGroup.name.trim()) {
            message.error('请输入分组名称');
            return;
        }
        
        await groupApi.addGroup({
            name: newGroup.name.trim(),
            description: newGroup.description.trim()
        });
        
        message.success('新增分组成功');
        addGroupModal.value = false;
        newGroup.name = '';
        newGroup.description = '';
        loadGroups();
    } catch (error) {
        message.error('新增分组失败');
    }
};

// 编辑分组
const editGroupData = (group) => {
    editGroup.id = group.id;
    editGroup.name = group.name;
    editGroup.description = group.description || '';
    editGroupModal.value = true;
};

const updateGroup = async () => {
    try {
        if (!editGroup.name.trim()) {
            message.error('请输入分组名称');
            return;
        }
        
        await groupApi.editGroup(editGroup.id, {
            name: editGroup.name.trim(),
            description: editGroup.description.trim()
        });
        
        message.success('编辑分组成功');
        editGroupModal.value = false;
        loadGroups();
    } catch (error) {
        message.error('编辑分组失败');
    }
};

// 删除分组（带特别提醒）
const deleteGroup = (groupId) => {
    const group = groups.value.find(g => g.id === groupId);
    if (!group) return;
    
    Modal.confirm({
        title: '危险操作',
        content: `确定要删除分组"${group.name}"吗？删除后，会同步删除所有权限关联数据，请谨慎操作！`,
        okText: '确认删除',
        cancelText: '取消',
        okType: 'danger',
        onOk: async () => {
            try {
                await groupApi.deleteGroup(groupId);
                message.success('删除分组成功');
                if (selectedGroup.value === groupId) {
                    selectedGroup.value = null;
                    groupTitles.value = [];
                    selectedTitleIds.value = [];
                }
                loadGroups();
            } catch (error) {
                message.error('删除分组失败');
            }
        }
    });
};

// 提交分组权限
function handleSubmitGroup() {
    if (selectedGroup.value) {
        submitGroupLoading.value = true;
        groupCheckLoading.value = true;
        
        groupApi.addTitleToGroup({
            group_id: selectedGroup.value,
            title_ids: checkedTitles.value
        })
            .then((res) => {
                groupCheckLoading.value = false;
                submitGroupLoading.value = false;
                successModal({ title: res?.msg || 'Title成功添加到分组' });
                loadGroupTitles();
            })
            .catch(() => {
                groupCheckLoading.value = false;
                submitGroupLoading.value = false;
                message.error('提交失败');
            });
    }
}

// 处理菜单的勾选
function handleMenuCheck({ menuId, checked }) {
    if (checked) {
        if (!checkedMenus.value.includes(menuId)) {
            checkedMenus.value.push(menuId);
        }
    } else {
        const index = checkedMenus.value.indexOf(menuId);
        if (index > -1) {
            checkedMenus.value.splice(index, 1);
        }
    }
}
// 处理标题的勾选
function handleTitleCheck({ titleId, checked }) {
    if (checked) {
        if (!checkedTitles.value.includes(titleId)) {
            checkedTitles.value.push(titleId);
        }
    } else {
        const index = checkedTitles.value.indexOf(titleId);
        if (index > -1) {
            checkedTitles.value.splice(index, 1);
        }
    }
}
</script>

<template>
  <a-card :loading="getPageDataLoading">
    <a-alert message="注意：必须进行高级授权才能进行Title分组" type="warning" show-icon closable style="margin-bottom: 16px;" />
    <!-- 分组选择区域 -->
    <div class="part-box">
      <vxe-tag status="primary" content="分组" />
      <a-button type="primary" size="small" class="ml-2" @click="addGroupModal = true">
        <template #icon>
          <PlusOutlined />
        </template>
        新增分组
      </a-button>
      <div class="part-content-box">

        <a-radio-group v-if="groups.length" v-model:value="selectedGroup" @change="handleChangeGroup">
          <a-space>
            <a-radio v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
              <span v-if="group.description" style="color: #999; margin-left: 8px;">
                ({{ group.description }})
              </span>
            </a-radio>
          </a-space>
        </a-radio-group>
        <a-empty v-else>
          <template #description>
            无分组数据
          </template>
        </a-empty>

        <!-- 分组管理按钮 -->
        <div class="group-actions" style="margin-top: 16px;">


          <a-button v-if="selectedGroup" type="default"
            @click="editGroupData(groups.find(g => g.id === selectedGroup))">
            <template #icon>
              <EditOutlined />
            </template>
            编辑分组
          </a-button>

          <a-button v-if="selectedGroup" danger @click="deleteGroup(selectedGroup)">
            <template #icon>
              <DeleteOutlined />
            </template>
            删除分组
          </a-button>
        </div>
      </div>
    </div>

    <!-- Title选择区域 -->
    <div class="part-box">

      <a-spin :spinning="groupCheckLoading">
        <template v-if="allTitles?.menus?.length">

          <MenuTitleButtonTree v-model:checkedTitles="checkedTitles" :default-expand-all="true"
            :menus="allTitles?.menus" :show-select-all="true" :checked-menus="checkedMenus" :expand-list="expandList"
            @menu-check="handleMenuCheck" @title-check="handleTitleCheck" @expand-change="handleExpandChange" />
        </template>
        <a-empty v-else>
          <template #description>
            无title数据
          </template>
        </a-empty>
      </a-spin>
    </div>

    <!-- 提交按钮 -->
    <vxe-button v-if="selectedGroup" :loading="submitGroupLoading" status="primary" size="default" content="Title分组提交"
      class="submit-btn" @click="handleSubmitGroup" />
  </a-card>

  <!-- 新增分组模态框 -->
  <a-modal v-model:open="addGroupModal" title="新增分组" :confirm-loading="loading" @ok="addGroup"
    @cancel="() => { addGroupModal = false; newGroup.name = ''; newGroup.description = ''; }">
    <a-form layout="vertical">
      <a-form-item label="分组名称" required>
        <a-input v-model:value="newGroup.name" placeholder="请输入分组名称" />
      </a-form-item>
      <a-form-item label="描述">
        <a-textarea v-model:value="newGroup.description" placeholder="请输入分组描述" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- 编辑分组模态框 -->
  <a-modal v-model:open="editGroupModal" title="编辑分组" :confirm-loading="loading" @ok="updateGroup"
    @cancel="() => { editGroupModal = false; }">
    <a-form layout="vertical">
      <a-form-item label="分组名称" required>
        <a-input v-model:value="editGroup.name" placeholder="请输入分组名称" />
      </a-form-item>
      <a-form-item label="描述">
        <a-textarea v-model:value="editGroup.description" placeholder="请输入分组描述" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped lang="less">
.part-box {
  margin-bottom: 24px;
}

.part-content-box {
  padding: 1.5rem;
}

.group-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.title-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.title-checkbox {
  width: 100%;
  margin: 0;
  
  .ant-checkbox-wrapper {
    width: 100%;
    padding: 12px;
    border: 1px solid #f0f0f0;
    border-radius: 6px;
    transition: all 0.3s;
    
    &:hover {
      border-color: #1890ff;
      background-color: #f6ffed;
    }
  }
}

.title-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-name {
  font-weight: 500;
  color: #262626;
}

.title-field {
  font-size: 12px;
  color: #8c8c8c;
  font-family: monospace;
}

.ant-checkbox-wrapper {
  margin: 5px 0;
}

.ant-checkbox-group {
  width: 100%;
}

.submit-btn {
  position: fixed;
  bottom: 8%;
  right: 2%;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.ant-radio) {
  margin-right: 0;
  padding: 8px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: all 0.3s;
  
  &:hover {
    border-color: #1890ff;
    background-color: #f6ffed;
  }
  
  &.ant-radio-checked {
    border-color: #1890ff;
    background-color: #e6f7ff;
  }
}
</style>