<script setup>

import http from "@/utils/axios";
import successModal from "@/composables/successModal";
import { isValidMobilePhone, isValidEmail, groupBy } from 'xe-utils';
import commonApi from "@/api/common";
import { message } from 'ant-design-vue';
import tableRender from "@/composables/table/tableRender";
import userGroupPermissionApi from "@/api/system/userGroupPermissionApi";
import XEUtils, { debounce } from "xe-utils";


const props = defineProps({
    sid: {
        type: String,
        default: ''
    }
});
const { sid } = toRefs(props);
const groupNamePreFix = 'system/user-group/';
const urlPrefix = `${groupNamePreFix}permissions`;
let expandList = ref({}); // 二级菜单是否展开列表
let pageTitleGroup = ref([]); // 页面的title的分组
let checkedTitleGroup = ref([]); // 选中的title的分组
let titleGroupMapping = ref({}); // title分组映射，用于标识每个title属于哪个分组
let titleGroupCache = ref({}); // 缓存已加载的title分组数据
let titleGroupLoading = ref(false); // title分组加载状态

// --- NEW CODE: Toggle for Fine-Grained Permissions ---
let showFineGrainedPermissions = ref(false); // 控制精细权限模块的显示隐藏
// --- END NEW CODE ---

let { getCommonBusinessList } = commonApi;

/**
 * 获取用户组权限列表/v3/{business}/system/user-group/permissions
 * **/
let userGroupLists = ref({
    loading: false,
    list: [],
    error: '',
});
let currentGroup = ref(null);
let currentUserGroup = ref([]); // 当前用户组绑定的用户

// 获取业态
const {
    business_data,
    requestBusinessData,
} = getCommonBusinessList();

// 用户弹窗相关
const showUserModal = ref(false);
const selectedUserIds = ref([]);
const modalLoading = ref(false);

const handleGetUserGroupName = async () => { // 获取组名的数据
    userGroupLists.value.loading = true;
    await http.get(`${groupNamePreFix}list`, { noErrorTip: true })
        .then((res) => {
            userGroupLists.value.list = res;
            userGroupLists.value.loading = false;
        })
        .catch((error) => {
            let errorResponseStatus = error?.response?.status;
            userGroupLists.value.error = error?.response?.message || error?.response?.data?.msg + `【${errorResponseStatus}】`;
            userGroupLists.value.loading = false;
        });
    currentGroup.value = sid.value;
    handleChangeUserGroup();
};

let pageData = ref([]); // 页面的数据
let getPageDataLoading = ref(false); // 初始进入页面获取数据的loading
const handleGetUserGroupPermission = () => {
    pageData.value = {};
    getPageDataLoading.value = true;
    pageTitleGroup.value = [];
    expandList.value = {};
    titleGroupMapping.value = {};
    http.get(urlPrefix)
        .then(res => {
            let result = res?.data ? res.data : [];
            pageData.value = result;
            result.forEach(item => {
                expandList.value = {
                    ...expandList.value,
                    ...item.menus,
                };
            });


            if (res?.title_groups) {
                for (let item in res.title_groups) {
                    pageTitleGroup.value.push({
                        label: res.title_groups[item],
                        value: Number(item),
                    });
                }
            }

            getPageDataLoading.value = false;
            // 初始化时加载所有title分组数据
            loadAllTitleGroups();
        })
        .catch(() => {
            getPageDataLoading.value = false;
        });


};

const initUserGroupPermission = { // 用于不同的菜单对应的权限
    menu: [],
    title: [],
    layer: [],
};
let diffUserGroupPermission = ref(initUserGroupPermission);

// 勾选/取消权限：checked表示是否指定勾选/取消勾选
const toggleCheck = ({ key, type, checked }) => {
    let index = diffUserGroupPermission.value[type].indexOf(key);
    if (!checked && index !== -1) { // 1. 不指定的情况；2. 指定取消勾选的情况。并且目前已勾选。则需要去除
        diffUserGroupPermission.value[type].splice(index, 1);
    }
    if (index === -1 && (checked === true || checked === undefined)) { // 1. 不指定的情况；2. 指定勾选的情况。并且目前未勾选。则需要增加
        diffUserGroupPermission.value[type].push(key);
    }
};

const handleCheckPermission = ({ key, level1, level2, type, layer, title, button, num, idx }) => {
    toggleCheck({ key, type });
    let index = diffUserGroupPermission.value[type].indexOf(key);
    let currentMenuIdxRow = pageData.value?.[idx]?.['menus'];
    switch (index) {
        case -1: { // 未选中的时候
            if (type === 'layer') { // 所有title取消选中
                for (let t of title) {
                    toggleCheck({ key: t.sid, type: 'title', checked: false });
                }
                for (let b of button) {
                    toggleCheck({ key: b.sid, type: 'title', checked: false });
                }
            }


            if (type === 'menu' && num === 2) { // 二级菜单未勾选的时候所有title、层号无需选中
                let data = currentMenuIdxRow?.[level2]?.title_button;
                if (data) {
                    for (let item in data) {
                        let { title, button } = data[item];
                        toggleCheck({ key: `${level1}_${level2}_${item}`, type: 'layer', checked: false });
                        for (let t of title) {
                            toggleCheck({ key: t.sid, type: 'title', checked: false });
                        }
                        for (let b of button) {
                            toggleCheck({ key: b.sid, type: 'title', checked: false });
                        }
                    }

                }
            }
            if (type === 'menu' && num === 1) { // 一级菜单未勾选的时候所有二级菜单、层号、title无需选中
                let currentCheckedMenuData = currentMenuIdxRow;
                if (currentCheckedMenuData) {
                    for (let level2_id in currentCheckedMenuData) {
                        toggleCheck({ key: level2_id * 1, type: 'menu', checked: false });
                        let { title_button } = currentCheckedMenuData[level2_id];
                        if (title_button) {
                            for (let item in title_button) {
                                let { title, button } = title_button[item];
                                toggleCheck({ key: `${level1}_${level2_id * 1}_${item}`, type: 'layer', checked: false });
                                for (let t of title) {
                                    toggleCheck({ key: t.sid, type: 'title', checked: false });
                                }
                                for (let b of button) {
                                    toggleCheck({ key: b.sid, type: 'title', checked: false });
                                }
                            }
                        }
                    }
                }
            }
            break;
        }
        default: {// 选中的时候
            if (type === 'title') { // 其对应的父级一级菜单、二级菜单、层号需选中
                toggleCheck({ key: level1, type: 'menu', checked: true });
                toggleCheck({ key: level2, type: 'menu', checked: true });
                toggleCheck({ key: `${level1}_${level2}_${layer}`, type: 'layer', checked: true });
            }
            if (type === 'layer') { // 其对应的父级一级菜单、二级菜单、所有title需选中
                toggleCheck({ key: level1, type: 'menu', checked: true });
                toggleCheck({ key: level2, type: 'menu', checked: true });
                for (let t of title) {
                    toggleCheck({ key: t.sid, type: 'title', checked: true });
                }
                for (let b of button) {
                    toggleCheck({ key: b.sid, type: 'title', checked: true });
                }

            }
            if (type === 'menu' && num === 2) { // 二级菜单勾选的时候所有title、层号、一级菜单需选中
                let data = currentMenuIdxRow?.[level2]?.title_button;
                toggleCheck({ key: level1, type: 'menu', checked: true });
                if (data) {
                    for (let item in data) {
                        let { title, button } = data[item];
                        toggleCheck({ key: `${level1}_${level2}_${item}`, type: 'layer', checked: true });
                        for (let t of title) {
                            toggleCheck({ key: t.sid, type: 'title', checked: true });
                        }
                        for (let b of button) {
                            toggleCheck({ key: b.sid, type: 'title', checked: true });
                        }
                    }

                }
            }
            if (type === 'menu' && num === 1) { // 一级菜单选中的时候所有二级菜单、层号、title需选中
                let currentCheckedMenuData = currentMenuIdxRow;
                if (currentCheckedMenuData) {
                    for (let level2_id in currentCheckedMenuData) {
                        toggleCheck({ key: level2_id * 1, type: 'menu', checked: true });
                        let { title_button } = currentCheckedMenuData[level2_id];
                        if (title_button) {
                            for (let item in title_button) {
                                let { title, button } = title_button[item];
                                toggleCheck({ key: `${level1}_${level2_id * 1}_${item}`, type: 'layer', checked: true });
                                for (let t of title) {
                                    toggleCheck({ key: t.sid, type: 'title', checked: true });
                                }
                                for (let b of button) {
                                    toggleCheck({ key: b.sid, type: 'title', checked: true });
                                }
                            }
                        }
                    }
                }
            }
            break;
        }

    }
};

/** 全选复选框勾选相关 --Start**/
// 全选复选框的处理
let checkboxAllState = ref({
    checkAll: false,
    indeterminate: false,
});

// 全选/取消
const toggleCheckAll = () => {
    checkboxAllState.value.checkAll = !checkboxAllState.value.checkAll;
    checkAllData(checkboxAllState.value.checkAll);
};

const checkAllData = (isChecked) => {
    let currentCheckedMenuData = pageData.value;
    if (currentCheckedMenuData) {
        for (let level1Data of currentCheckedMenuData) {
            let { sid, menus } = level1Data;
            toggleCheck({ key: sid, type: 'menu', checked: isChecked });
            for (let level2_id in menus) {
                toggleCheck({ key: level2_id * 1, type: 'menu', checked: isChecked });
                let { title_button } = menus[level2_id];
                if (title_button) {
                    for (let item in title_button) {
                        let { title, button } = title_button[item];
                        toggleCheck({ key: `${sid}_${level2_id * 1}_${item}`, type: 'layer', checked: isChecked });
                        for (let t of title) {
                            toggleCheck({ key: t.sid, type: 'title', checked: isChecked });
                        }
                        for (let b of button) {
                            toggleCheck({ key: b.sid, type: 'title', checked: isChecked });
                        }
                    }
                }
            }
        }

    }
};
/** 全选复选框勾选相关 --End**/

/**
 * 用户组提交的更新
 * --Start**/
let submitUserGrouploading = ref(false);
let checkUserGrouploading = ref(false);
const handleSubmitUserGroup = () => {
    if (currentGroup.value) {
        submitUserGrouploading.value = true;
        checkUserGrouploading.value = true;
        http.put(`${urlPrefix}/edit/${currentGroup.value}`, {
            title_sid: diffUserGroupPermission.value.title,
            menu_sid: diffUserGroupPermission.value.menu,
            title_group_sid: checkedTitleGroup.value,
        })
            .then((res) => {
                checkUserGrouploading.value = false;
                submitUserGrouploading.value = false;
                successModal({ title: res?.msg });
                handleChangeUserGroup();
            })
            .catch(() => {
                checkUserGrouploading.value = false;
                submitUserGrouploading.value = false;
            });
    }
};
/**
 * 用户组提交的更新
 * ---End**/

/** 不同的用户组切换的时候 --Start**/
const handleChangeUserGroup = () => {
    showFineGrainedPermissions.value = false;
    diffUserGroupPermission.value = { // 用于不同的菜单对应的权限
        menu: [],
        title: [],
        layer: [],
    };
    checkedTitleGroup.value = [];
    pageTitleGroup.value = [];
    if (currentGroup.value) {
        checkUserGrouploading.value = true;
        handleGetUserGroupPermission();
      

        userGroupPermissionApi.getUserGroupPermissionsList(currentGroup.value)
            .then((res) => {
                diffUserGroupPermission.value = res ? res : initUserGroupPermission;
                diffUserGroupPermission.value['menu'] = res?.menu_sid;
                diffUserGroupPermission.value['title'] = res?.title_sid;
                diffUserGroupPermission.value['layer'] = [];
                checkedTitleGroup.value = res?.title_group_sid || [];
                checkUserGrouploading.value = false;
                handleGetOneGroupUserData();
            })
            .catch(() => {
                checkUserGrouploading.value = false;
            });
    }

};
/** 不同的用户组切换的时候 --End**/

// 加载所有title分组数据
const loadAllTitleGroups = async () => {
    if (!pageTitleGroup.value.length) return;

    titleGroupLoading.value = true;
    try {
        const promises = pageTitleGroup.value.map(group =>
        {
            if(checkedTitleGroup.value.includes(group.value)) {
                return http.get(`/system/title-group/permissions/${group.value}`)
                    .then(res => ({ groupId: group.value, titleIds: res?.title_sid || [] }))
                    .catch(() => ({ groupId: group.value, titleIds: [] }));
            }
            return { groupId: group.value, titleIds: [] };
        }
            
        );

        const results = await Promise.all(promises);

        // 构建title到分组的映射
        results.forEach(({ groupId, titleIds }) => {
            if(checkedTitleGroup.value.includes(groupId)) { 
                titleGroupCache.value[groupId] = titleIds;
                titleIds.forEach(titleId => {
                    if (!titleGroupMapping.value[titleId]) {
                        titleGroupMapping.value[titleId] = [];
                    }
                    titleGroupMapping.value[titleId].push(groupId);
                });
            }
           
        });
    } catch (error) {
        console.error('加载title分组失败:', error);
    } finally {
        titleGroupLoading.value = false;
    }
};

// 获取title所属的分组标识
const getTitleGroupBadge = (titleId) => {
    const groupIds = titleGroupMapping.value[titleId] || [];
    if (groupIds.length === 0) return null;

    // 只显示当前选中的分组
    const selectedGroups = groupIds.filter(groupId =>
        checkedTitleGroup.value.includes(groupId)
    );

    return selectedGroups.map(groupId => {
        const group = pageTitleGroup.value.find(g => g.value === groupId);
        return group ? group.label : groupId;
    });
};



// 获取分组的主题色
const getGroupThemeColor = (groupId) => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];
    const index = pageTitleGroup.value.findIndex(g => g.value === groupId);
    return colors[index % colors.length];
};

// 获取title的背景色（基于选中的分组）
const getTitleBackgroundColor = (titleId) => {
    const groupIds = titleGroupMapping.value[titleId] || [];
    const selectedGroups = groupIds.filter(groupId =>
        checkedTitleGroup.value.includes(groupId)
    );

    if (selectedGroups.length === 0) return 'transparent';
    if (selectedGroups.length === 1) {
        return getGroupThemeColor(selectedGroups[0]) + '15'; // 15%透明度
    }
    return '#f0f0f0'; // 多个分组时使用灰色
};


/** 用户组用户的新增 --Start**/
const userData = reactive({
    data: [],
    current_val: null,
    fetching: false,
});
let lastFetchId = 0;


const handleGetUserData = (value) => {
    let searchParams = value && (isValidMobilePhone(value) || isValidEmail(value)) ? `?search=${value}` : '';
    lastFetchId += 1;
    const fetchId = lastFetchId;
    userData.data = null;
    userData.fetching = true;
    userGroupPermissionApi.getUserGroupUserList(searchParams, { noErrorTip: true })
        .then(res => {
            if (fetchId !== lastFetchId) {
                // for fetch callback order
                return;
            }
            const data = res.map(user => {
                let { email, username, mobile, id, business_id } = user || {};
                return {
                    label: `${username} - ${email} - (Phone: ${mobile}) ${business_data.value?.data?.[business_id]?.business}`,
                    value: id,
                    origin: user,
                };
            });
            userData.data = data;
            userData.fetching = false;
        });
};

/*** 获取一个用户组的所有用户 --Start**/
let oneGroupUserDataLoading = ref(false); // 获取某个用户组的loading
const handleGetOneGroupUserData = () => {
    if (currentGroup.value) {
        currentUserGroup.value = [];
        oneGroupUserDataLoading.value = true;
        userGroupPermissionApi.getUserGroupUserList(`/${currentGroup.value}`)
            .then(res => {
                currentUserGroup.value = res;
                oneGroupUserDataLoading.value = false;
            })
            .catch(() => {
                oneGroupUserDataLoading.value = false;

            });
    }

};
/*** 获取一个用户组的所有用户 --End**/



/** 某一个用户组提添加删除用户 --Start**/
const handleGroupAddAndDelUser = (sid, action) => {
    http.patch(`${urlPrefix}/user/edit/${currentGroup.value}`, {
        user_sid: sid,
        "action": action,
    })
        .then((res) => {
            if (action === 'add') {
                userData.current_val = null;
            }
            message.success(res.msg);
            handleGetOneGroupUserData();
        });

};

// 批量添加用户
const handleBatchAddUser = async () => {
    if (!selectedUserIds.value.length) {
        message.warning('请选择要添加的用户');
        return;
    }

    modalLoading.value = true;
    try {
        for (const userId of selectedUserIds.value) {
            await handleGroupAddAndDelUser(userId, 'add');
        }
        message.success('批量添加用户成功');
        showUserModal.value = false;
        selectedUserIds.value = [];
    } catch (error) {
        message.error('批量添加用户失败');
    } finally {
        modalLoading.value = false;
    }
};

// 打开用户选择弹窗
const openUserModal = () => {
    showUserModal.value = true;
    selectedUserIds.value = [];
    handleGetUserData(); // 重新获取用户列表
};

/** 某一个用户组提添加用户 --END**/

let pageButton = ref([]);

const btnPermissionCon = ref({});

onMounted(async () => {
    await handleGetUserGroupName();
    handleGetUserGroupPermission();
    await requestBusinessData();
    handleGetUserData();
    let {
        button,
    } = await tableRender.getTitle({ layer: 1 });
    pageButton.value = button;

    for (let btn of button.value) {
        btnPermissionCon.value[btn.field] = btn;
    }

});
// 处理搜索
const handleSearch = debounce(async (value) => {
    value = value.trim();
    if (!value) {
        handleGetUserData(); // 空值时获取全部列表
        return;
    }
    // 检查是否是完整的手机号或邮箱
    const isMobile = await XEUtils.isValidMobilePhone(value);
    const isEmail = await XEUtils.isValidEmail(value);

    if (isMobile || isEmail) {
        // 精确搜索走后台接口
        handleGetUserData(value);
    } else {
        // 非完整手机号或邮箱时，使用前端过滤
        userData.fetching = false;
    }
}, 300);
// 本地搜索过滤
const filterOptions = (input, option) => {
    console.log(input, option, 111111);
    if (!input) return true;
    return option.label.toLowerCase().includes(input.toLowerCase());
};

/* * 处理选中的Title分组
返回的数据结构：{
    "title_sid": [
        1299,
        1300,
        1301
    ]
}

* */
let diffTitleGroup = ref({}); // 用于不同的Title分组绑定的title
const handleCheckedTitleGroup = (value) => {
    if (!value.length) {
        diffTitleGroup.value = {};
        return;
    } else {
        for(let item in value) {
            let selectItem = value[item];
            if (titleGroupCache.value[selectItem]) {
                diffTitleGroup.value[selectItem] = titleGroupCache.value[selectItem];
            } else {
                // 如果缓存中没有，则请求并缓存
                http.get(`/system/title-group/permissions/${selectItem}`)
                    .then(res => {
                        const titleIds = res?.title_sid || [];
                        titleGroupCache.value[selectItem] = titleIds;
                        diffTitleGroup.value[selectItem] = titleIds;

                        // 更新映射关系
                        titleIds.forEach(titleId => {
                            if (!titleGroupMapping.value[titleId]) {
                                titleGroupMapping.value[titleId] = [];
                            }
                            if (!titleGroupMapping.value[titleId].includes(selectItem)) {
                                titleGroupMapping.value[titleId].push(selectItem);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('获取title分组失败:', error);
                    });
            }
        }
    }

   
};
</script>

<template>
    <a-card hoverable style="border-left:4px solid var(--primary-color); margin-top: 10px;">
       
        <template #title>
            <a-flex justify="space-between">
                <div class="card-title-with-badge">
                        <span>选择权限组</span>
                        <a-tag v-if="titleGroupLoading" color="processing" size="small">加载中...</a-tag>
                </div>
                <vxe-button v-if="currentGroup" :loading="checkUserGrouploading"   status="primary" size="small" content="刷新" @click="handleChangeUserGroup"></vxe-button> 
            </a-flex>
        </template>
        <a-spin :spinning="userGroupLists.loading">
            <template v-if="userGroupLists && userGroupLists?.list && userGroupLists?.list.length">
                <a-radio-group v-model:value="currentGroup" name="id" @change="handleChangeUserGroup">
                    <a-radio v-for="item in userGroupLists.list" :key="item.id" :value="item.id.toString()">{{ item.group_name }}</a-radio>
                </a-radio-group>
            </template>
            <a-empty v-else>
                <template v-if="userGroupLists?.error" #description></template>
            </a-empty>

        </a-spin>
    </a-card>

    <a-card
        :loading="oneGroupUserDataLoading"
        hoverable
        class="user-management-card"
    >
        <template #title>
            <div class="card-title-with-action">
                <span>用户管理</span>
                <a-button
                    v-if="btnPermissionCon?.permissions_user_edit?.page_display"
                    type="primary"
                    size="small"
                    class="add-user-btn"

                    @click="openUserModal"
                >
                    <template #icon>
                        <plus-outlined />
                    </template>
                    添加用户
                </a-button>
            </div>
        </template>

        <template v-if="currentUserGroup.length">
            <template v-for="(userGroup, business_id) in groupBy(currentUserGroup, 'business_id')" :key="business_id">
                <a-row type="flex" class="mb-2">
                    <a-col flex="10rem">
                        <b class="vxe-icon-company"></b>{{ business_data?.data?.[business_id]?.['business'] }}
                    </a-col>
                    <a-col flex="auto">
                        <template v-for="user in userGroup" :key="user.id">
                            <a-tooltip>
                                <template #title>
                                    <p><mail-outlined /> 邮箱：{{ user.email }}</p>
                                    <p><phone-outlined /> 手机号：{{ user.mobile }}</p>
                                </template>
                                <a-tag :color="business_data?.data?.[user.business_id]?.theme" closable @close="handleGroupAddAndDelUser(user.id, 'del')">
                                    <template #icon>
                                        <user-outlined />
                                    </template>
                                    {{ user.username }}
                                </a-tag>
                            </a-tooltip>
                        </template>
                    </a-col>
                </a-row>
            </template>
        </template>

        <a-empty v-else description="暂无用户">
            <template #image>
                <team-outlined style="font-size: 48px; color: #d9d9d9;" />
            </template>
        </a-empty>
    </a-card>

    <a-modal
        v-model:open="showUserModal"
        title="批量添加用户"
        width="80%"
        ok-text="确认添加"
        cancel-text="取消"
        :confirm-loading="modalLoading"
        @ok="handleBatchAddUser"
        @cancel="() => { showUserModal = false; selectedUserIds = []; }"

    >
        <div class="user-selection-container">
            <a-alert
                message="支持用户名模糊搜索，手机号、邮箱精确搜索"
                type="info"
                show-icon
                class="search-tip"
            />

            <a-select
                v-model:value="selectedUserIds"
                mode="multiple"
                show-search
                style="width: 100%"
                placeholder="请选择要添加的用户"
                :options="userData.data"
                :filter-option="filterOptions"
                :loading="userData.fetching"
                :not-found-content="userData.fetching ? undefined : null"
                class="user-select"
                @search="handleSearch"
            >
                <template #option="{ origin }">
                    <div class="user-option">
                        <div class="user-info">
                            <a-tag size="small" :color="business_data?.data?.[origin?.business_id]?.theme">
                                {{ business_data?.data?.[origin?.business_id]?.business || origin?.business_id }}
                            </a-tag>
                            <span class="username "><user-outlined /> {{ origin.username }}</span>
                            <span class="email ml-2"><mail-outlined /> {{ origin.email }}</span>
                            <span class="phone ml-2"><phone-outlined /> {{ origin.mobile }}</span>
                        </div>
                        <div class="business-info">

                        </div>
                    </div>
                </template>
                <template v-if="userData.fetching" #notFoundContent>
                    <a-spin size="small" />
                </template>
            </a-select>

            <div v-if="selectedUserIds.length" class="selected-count">
                已选择 {{ selectedUserIds.length }} 个用户
            </div>
        </div>
    </a-modal>

    <a-card :bordered="false" title="Title分组" style="border-left:4px solid var(--primary-color); margin-top: 10px; margin-bottom: 10px;">
        
        <template v-if="pageTitleGroup && pageTitleGroup.length">
            <div class="title-group-container">
                <a-checkbox-group v-model:value="checkedTitleGroup" :options="pageTitleGroup" @change="handleCheckedTitleGroup" />
                <div class="title-group-legend">
                    <span class="legend-title">分组标识说明：</span>
                    <template v-for="group in pageTitleGroup" :key="group.value">
                        <a-tag :color="getGroupThemeColor(group.value)" size="small" class="legend-tag">
                            {{ group.label }}
                        </a-tag>
                    </template>
                </div>
            </div>
        </template>
        <a-empty v-else>
            <template #description>暂无Title分组</template>
        </a-empty>
    </a-card>

    <a-card :bordered="false" title="菜单权限" style="border-left:4px solid var(--primary-color); margin-top: 10px; margin-bottom: 10px;">
        <a-spin :spinning="checkUserGrouploading">
            <template v-if="pageData">
               <a-space direction="vertical">
                <template v-for="(list, idx) in pageData" :key="list.sid">
                    <a-checkbox :checked="diffUserGroupPermission.menu.includes(list.sid)" @click="handleCheckPermission({ key: list.sid, type: 'menu', num: 1, idx, level1: list.sid, })">
                        <h3> {{ list?.menu_name }}</h3>
                    </a-checkbox>
                    <div class="m1-content-box">
                        <a-checkbox v-for="(list2, level2_id) in list.menus" :key="level2_id" :checked="diffUserGroupPermission.menu.includes(level2_id * 1)" @click="handleCheckPermission({ key: level2_id * 1, type: 'menu', level1: list.sid, level2: level2_id, num: 2, idx })">
                            <h4><vxe-tag class="theme--primary">{{ list2?.menu_name }}</vxe-tag></h4>
                        </a-checkbox>

                    </div>
                </template>
              


               </a-space>
            </template>
        </a-spin>
    </a-card>
    <a-card :bordered="false" :style="{ marginBottom: '10px', borderLeft: '4px solid var(--primary-color)' }" :loading="checkUserGrouploading">
        <template #title>
            <div class="d-flex align-items-center justify-content-between w-100">
                <span>精细权限</span>
                <a-button type="link" @click="showFineGrainedPermissions = !showFineGrainedPermissions">
                    {{ showFineGrainedPermissions ? '收起' : '展开' }}
                    <caret-up-outlined v-if="showFineGrainedPermissions" />
                    <caret-down-outlined v-else />
                </a-button>
            </div>
        </template>
        <div v-if="showFineGrainedPermissions" class="part-content-box">
            <a-checkbox
                :checked="checkboxAllState.checkAll"
                :indeterminate="checkboxAllState.indeterminate"
                @click="toggleCheckAll"
            >
                全选
            </a-checkbox>
            <a-spin :spinning="checkUserGrouploading">
                <template v-if="pageData">
                    <template v-for="(list, idx) in pageData" :key="list.sid">
                        <a-checkbox :checked="diffUserGroupPermission.menu.includes(list.sid)" @click="handleCheckPermission({ key: list.sid, type: 'menu', num: 1, idx, level1: list.sid, })">
                            <h3> {{ list?.menu_name }}</h3>
                        </a-checkbox>
                        <div class="m1-content-box">
                            <template v-for="(list2, level2_id) in list.menus" :key="level2_id">
                                <div>
                                    <i
                                        :class="[expandList[level2_id] ? 'vxe-icon-arrow-down' : 'vxe-icon-arrow-up', 'm2-expand-icon', 'text-info']"
                                        @click="expandList[level2_id] = !expandList[level2_id]"
                                    />
                                    <a-checkbox :checked="diffUserGroupPermission.menu.includes(level2_id * 1)" @click="handleCheckPermission({ key: level2_id * 1, type: 'menu', level1: list.sid, level2: level2_id, num: 2, idx })">
                                        <h4><vxe-tag class="theme--primary">{{ list2?.menu_name }}</vxe-tag></h4>
                                    </a-checkbox>
                                </div>
                                <div v-show="expandList[level2_id]" class="m2-content-box">
                                    <template v-if="list2?.title_button">
                                        <template v-for="({ title, button }, layer) in list2?.title_button" :key="`${list.sid}_${level2_id}_${layer}`">
                                            <a-checkbox :checked="diffUserGroupPermission.layer.includes(`${list.sid}_${level2_id}_${layer}`)" @click="handleCheckPermission({ key: `${list.sid}_${level2_id}_${layer}`, level1: list.sid, level2: level2_id * 1, layer, idx, title, button, type: 'layer' })">
                                                层号: {{ layer }}
                                            </a-checkbox>
                                            <div class="layer-box">
                                                <div class="layer-box-item">
                                                    <div v-for="t in title" :key="t?.sid" class="permission-item" :style="{ backgroundColor: getTitleBackgroundColor(t.sid) }">
                                                        <a-checkbox :checked="diffUserGroupPermission.title.includes(t.sid)" @click="handleCheckPermission({ key: t.sid, level1: list.sid, level2: level2_id * 1, layer, idx, type: 'title' })">
                                                            {{ t.field_name }}
                                                        </a-checkbox>
                                                        <div class="title-group-badges">
                                                            <a-tag
                                                                v-for="groupName in getTitleGroupBadge(t.sid)"
                                                                :key="groupName"
                                                                :color="getGroupThemeColor(pageTitleGroup.find(g => g.label === groupName)?.value)"
                                                                size="small"
                                                                class="group-badge"
                                                            >
                                                            </a-tag>
                                                        </div>
                                                    </div>
                                                    <div v-for="b in button" :key="b.sid" class="permission-item" :style="{ backgroundColor: getTitleBackgroundColor(b.sid) }">
                                                        <a-checkbox :checked="diffUserGroupPermission.title.includes(b.sid)" @click="handleCheckPermission({ key: b.sid, level1: list.sid, level2: level2_id * 1, layer, idx, type: 'title' })">  <b class="text-error bold-class-btn mr-2">B</b>{{ b.field_name }} </a-checkbox>
                                                        <div class="title-group-badges">
                                                            <a-tag
                                                                v-for="groupName in getTitleGroupBadge(b.sid)"
                                                                :key="groupName"
                                                                :color="getGroupThemeColor(pageTitleGroup.find(g => g.label === groupName)?.value)"
                                                                size="small"
                                                                class="group-badge"
                                                            >
                                                            </a-tag>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </template>
                </template>
            </a-spin>
        </div>
    </a-card>

    <vxe-button v-if="currentGroup && btnPermissionCon?.permissions_edit?.page_display" :loading="submitUserGrouploading"  status="primary" size="default" content="组权限更新" class="submit-btn" @click="handleSubmitUserGroup"></vxe-button>
</template>

<style scoped lang="less">
.card-title-with-badge {
    display: flex;
    align-items: center;
    gap: 8px;
}

.part-title {
    margin-right: 10px;
}
.part-content-box {
    padding: 1.5rem;
}
.m1-content-box, .m2-content-box, .layer-box {
    padding-left: calc(1rem + 8px);
    .m2-expand-icon {
        margin-right: 10px;
        cursor: pointer;
    }
    .layer-box-item {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      
    }
}
.ant-checkbox-wrapper {
    margin: 5px 0;
}
.ant-checkbox-group {
    width: 100%;
}

.title-group-container {
    .title-group-legend {
        margin-top: 12px;
        padding: 8px 12px;
        background: #fafafa;
        border-radius: 6px;
        border: 1px solid #f0f0f0;
        
        .legend-title {
            font-size: 12px;
            color: #666;
            margin-right: 8px;
        }
        
        .legend-tag {
            margin-right: 4px;
            margin-bottom: 4px;
        }
    }
}

.permission-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2px 0;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    margin-right: 5px;
    
    &:hover {
        background: #f5f5f5;
    }
    
    .title-group-badges {
        display: flex;
        gap: 2px;
        flex-wrap: wrap;
        
        .group-badge {
            font-size: 10px;
            padding: 0 2px;
            height: 10px;
            width: 10px;
            line-height: 14px;
            border-radius: 5px;
            margin-right: 2px;
        }
    }
}
.bold-class-btn {
    width: 20px;
    height: 20px;
    display: inline-block;
    text-align: center;
    font-size: 12px;
    border-radius: 50%;
    
    border: 1px solid red;
}
.submit-btn {
    position: fixed;
    bottom: 8%;
    right: 2%;
}

// 现代化用户管理样式
.user-management-card {
    margin-top: 16px;
    border-left:4px solid var(--primary-color);
    margin-bottom: 10px;
    min-height: 250px;
    
    .card-title-with-action {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .add-user-btn {
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            
            &:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
        }
    }
}

.user-groups-container {
    .business-user-group {
        margin-bottom: 24px;
        padding: 16px;
        background: #fafafa;
        border-radius: 8px;
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
        
        &:hover {
            background: #f5f5f5;
            border-color: #d9d9d9;
        }
        
        .business-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            
            .business-tag {
                font-weight: 500;
                border-radius: 6px;
            }
            
            .user-count {
                color: #666;
                font-size: 12px;
            }
        }
        
        .user-tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            
            .user-tag {
                border-radius: 6px;
                transition: all 0.2s ease;
                
                &:hover {
                    transform: scale(1.05);
                }
            }
        }
    }
}

// 用户选择弹窗样式
.user-selection-container {
    .search-tip {
        margin-bottom: 16px;
        border-radius: 6px;
    }
    
    .user-select {
        margin-bottom: 16px;
        
        :deep(.ant-select-selector) {
            border-radius: 6px;
        }
    }
    
    .user-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        
        .user-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            
            .username {
                font-weight: 500;
                color: #262626;
            }
            
            .email {
                font-size: 12px;
                color: #8c8c8c;
            }
        }
        
        .business-info {
            .ant-tag {
                border-radius: 4px;
            }
        }
    }
    
    .selected-count {
        text-align: center;
        color: #1890ff;
        font-size: 14px;
        font-weight: 500;
        padding: 8px;
        background: #e6f7ff;
        border-radius: 6px;
        border: 1px solid #91d5ff;
    }
}

// 用户工具提示样式
.user-tooltip {
    p {
        margin: 4px 0;
        display: flex;
        align-items: center;
        gap: 4px;
    }
}
:deep(h4) {
    margin-bottom: 0;
}
</style>