<script setup>
// 获取用户列表
import XEUtils, {debounce} from "xe-utils";
import virtualTeamApi from "@/api/system/virtualTeamApi";



const props = defineProps({
    disabledUserIds: {
        type: Array,
        default: () => []
    }
});

let userList = ref({
    loading: false,
    list: []
});

const state = reactive({
    data: [],
    leader_id: null,
    fetching: false,
});
let lastFetchId = 0; // 节流搜索

const business_data = inject('business_data');
const emits = defineEmits(['update:value', 'selectChange']);



// 本地搜索过滤
const filterOptions = (input, option) => {
    if (!input) return true;
    return option.label.toLowerCase().includes(input.toLowerCase());
};

// 处理搜索
const handleSearch = debounce(async (value) => {
    if (!value) {
        handleGetUserList(); // 空值时获取全部列表
        return;
    }
    // 检查是否是完整的手机号或邮箱
    const isMobile = await XEUtils.isValidMobilePhone(value);
    const isEmail = await XEUtils.isValidEmail(value);

    if (isMobile || isEmail) {
        // 精确搜索走后台接口
        handleGetUserList(value);
    } else {
        // 非完整手机号或邮箱时，使用前端过滤
        state.fetching = false;
        userList.value.loading = false;
    }
}, 300);

// 获取用户的列表数据
const handleGetUserList = async (params) => {
    let searchParams = params ? `?search=${params}`: '';
    userList.value.loading = true;
    state.fetching = true;
    const fetchId = lastFetchId;
    
    try {
        const res = await virtualTeamApi.getVirtualTeamUserList(searchParams);
        if (fetchId !== lastFetchId) return;
        
        userList.value.list = res;
        const data = res.map(user => {
            let { email, username, mobile, id, business_id } = user || {};
            return {
                label: `${username} - ${email} - (Phone: ${mobile}) ${business_data.value?.data?.[business_id]?.business}`,
                value: id,
                disabled: props.disabledUserIds.includes(id)
            };
        });
        
        state.data = data;
    } catch (error) {
        console.error(error);
    } finally {
        userList.value.loading = false;
        state.fetching = false;
    }
};

// 监听禁用列表变化
watch(() => props.disabledUserIds, () => {
    // 更新选项的禁用状态
    state.data = state.data.map(option => ({
        ...option,
        disabled: props.disabledUserIds.includes(option.value)
    }));
}, { deep: true });

onMounted(() => {
    handleGetUserList();
});

// 处理值变化
const handleChange = (value) => {
    emits('update:value', value);
    emits('selectChange',value);
};

</script>

<template>
    <a-select
        v-bind="$attrs"
        :options="state.data"
        :filter-option="filterOptions"
        allow-clear
        show-search
        placeholder="支持用户名模糊搜索，手机号、邮箱精确搜索"
        @search="handleSearch"
        @change="handleChange"
    >
        <template v-if="state.fetching || !state.data.length" #notFoundContent>
            <a-spin size="small" :spinning="state.fetching"/>
            <span v-show="!state.data.length">未搜索到用户</span>
        </template>
    </a-select>
</template>

<style scoped>
.ant-select-dropdown {
    max-height: 300px;
    overflow-y: auto;
}
</style>
