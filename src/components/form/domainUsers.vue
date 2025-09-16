<script setup>
import {onMounted, ref, toRefs, watch, inject} from "vue";
import http from '@/utils/axios';
import {LAYER_ZINDEX_MIDDLE} from '@/config/globalOption';
import {message} from "ant-design-vue";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '选择人员',
    },
    confirmLoading: { // 确定按钮loading
        type: Boolean,
        default: false,
    },
    ifMulti: { // 是否多选
        type: Boolean,
        default: false,
    }
});
const { visible, title, confirmLoading, ifMulti } = toRefs(props);
const emit = defineEmits(['update:visible', 'sureUser']);

let allUser = ref({}); // 所有用户
let showList = ref({}); // 展示的用户列表
let searchKey = ref(''); // 搜索关键字
let expandList = ref({}); // 部门是否展开
let checkUserId = ref([]); // 当前选中的人员id列表
let checkUser = ref([]); // 当前选中的人员列表
let title_data = inject('title_data', null);
onMounted(() => {
    // 初始获取所有用户列表
    http.get(`system/user/all_user`).then(res => {
        let all_user = {};
        for (let d in res.param) {
            expandList.value[d] = false; // 生成部门的展开列表
            // 加到title_data中
            if (title_data && !Object.prototype.hasOwnProperty.call(title_data.value, 'all_user')) {
                for (let j in res.param[d]) {
                    all_user[res.param[d][j].sAMAccountName] = res.param[d][j];
                }
            }
        }
        allUser.value = res.param;
        if (title_data && !Object.prototype.hasOwnProperty.call(title_data.value, 'all_user')) {
            title_data.value.all_user = all_user;
        }
    });
});
watch(
    () => allUser.value, // allUser改变时，showList也要改变
    () => {
        searchUser();
    },
);
// 监听-弹窗打开时，初始化数据
watch(
    () => visible.value,
    () => {
        if (visible.value) { // 打开弹窗时
            // 清空之前的展开、选中、搜索
            searchKey.value = '';
            searchUser();
            checkUserId.value = [];
            checkUser.value = [];
        }
    },
);
// 搜索用户
function searchUser() {
    if (searchKey.value) { // 有搜索的情况
        let result = {};
        for (let d in allUser.value) {
            let arr = [];
            for (let u in allUser.value[d]) {
                if (allUser.value[d][u].username.toLowerCase().indexOf(searchKey.value.toLowerCase()) !== -1) {
                    arr.push(allUser.value[d][u]);
                }
            }
            if (arr.length) {
                result[d] = arr;
                expandList.value[d] = true; // 展开有结果的部门
            }
        }
        showList.value = result;
    } else { // 没有搜索的情况
    // 收起所有部门
        for (let d in expandList.value) {
            expandList.value[d] = false;
        }
        // 显示所有数据
        showList.value = allUser.value;
    }
}
// 点击人员
// 因为非域用户和域账号的id会重复，所以加上department作为唯一标识
function clickUser(user, department) {
    if (ifMulti.value) { // 多选
        let index = checkUserId.value.indexOf(`${department}-${user.id}`);
        if (index !== -1) { // 之前已选中，现在取消
            checkUserId.value.splice(index, 1);
            checkUser.value.splice(index, 1);
        } else { // 现在选中
            checkUserId.value.push(`${department}-${user.id}`);
            checkUser.value.push(user);
        }
    } else { // 单选
        if (checkUserId.value.includes(`${department}-${user.id}`)) {
            checkUserId.value = [];
            checkUser.value = [];
        } else {
            checkUserId.value = [`${department}-${user.id}`];
            checkUser.value = [user];
        }
    }
}
// 关闭弹窗/取消
function handleCancel() {
    emit('update:visible', false);
}
// 确认
function handleOk() {
    if (checkUser.value.length) {
        emit('sureUser', ifMulti.value ? checkUser.value : checkUser.value[0]);
    } else {
        message.warning('未选择用户');
    }
}
</script>

<template>
    <a-modal
        :visible="visible"
        :title="title"
        :confirm-loading="confirmLoading"
        :centered="true"
        :width="800"
        :z-index="LAYER_ZINDEX_MIDDLE"
        @ok="handleOk"
        @cancel="handleCancel"
    >
        <div class="container">
            <a-input
                v-model:value="searchKey"
                placeholder="搜索"
                @change="searchUser"
            >
                <template #prefix>
                    <i class="bi bi-search" style="color: #adb5bd;"></i>
                </template>
            </a-input>
            <ul>
                <template v-for="(dList, d) in showList" :key="d">
                    <li :class="[expandList[d] ? 'bg-gradient-purple' : 'bg-gradient-primary', 'text-white', 'department-item']" @click="expandList[d] = !expandList[d]">{{ d || '其他' }}</li>
                    <ul v-show="expandList[d]">
                        <li
                            v-for="u in dList"
                            :key="u.id"
                            :class="[checkUserId.includes(`${d}-${u.id}`) ? 'bg-gradient-orange' : 'bg-gradient-info', 'text-white', 'user-item']"
                            @click="clickUser(u, d)"
                        >
                            {{ u.username }}&nbsp;&nbsp;{{ u.email }}&nbsp;&nbsp;{{ u.mobile }}&nbsp;&nbsp;{{ u.sAMAccountName }}
                            <span style="float: right;">{{ u.source }}</span>
                        </li>
                    </ul>
                </template>
            </ul>
        </div>
    </a-modal>
</template>

<style scoped lang="less">
.container {
    max-height: 500px;
    overflow-y: scroll;
    .department-item {
        padding: 0.5rem 1rem;
        border: 1px solid #e9ecef;
    }
    .user-item {
        padding: 5px;
        border: 1px solid #e9ecef;
    }
}
</style>
