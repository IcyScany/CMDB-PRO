<!-- 模块用于产品的分类 -->
<script setup>
import { userCommonMessageStore } from '@/stores/user';

defineProps({
    mode: { // 模式
        type: String,
        default: 'horizontal' // 水平模式（horizontal） | 垂直模式(vertical)| 内联模式(inline)
    }
});

let userCommonStore = userCommonMessageStore();
let menuGroupList = computed(() => userCommonStore.menuGroupList || []); // 菜单组
let currentMenuGroup = computed(() => userCommonStore.checkedMenuGroup || userCommonStore.globalCheckedMenuGroup); // 当前选中的菜单组
const menuMode =  ['horizontal', 'vertical'];


// 菜单组切换
/**
 * @description: 菜单组切换
 * @param {*} {key}
 * @return {*}  
 */
const handleMenuGroupChange = ({key}) => {
    userCommonStore.setCheckedMenuGroup(key); // 设置选中的菜单组
};
const handleSelectMenuGroupChange = () => {
    userCommonStore.setCheckedMenuGroup(selectMenuGroup.value); // 设置选中的菜单组
};
const selectedKeys = computed(() => [currentMenuGroup.value]);

let selectMenuGroup = ref(currentMenuGroup.value);

</script>

<template>
    <div v-if="menuMode.includes(mode)" >
        <h2 class="ml-4">产品类别</h2>
        <a-menu
            :mode="mode"
            :selected-keys="selectedKeys"
            @click="handleMenuGroupChange"
        >
            <a-menu-item v-for="{name, cn_name} in menuGroupList" :key="name"> 
                {{ cn_name }}
                <a-menu-divider />
            </a-menu-item>
        </a-menu>
    </div>
   
    <template v-else>

        <a-select
            v-model:value="selectMenuGroup"
            :show-search="true"
            option-filter-prop="label"
            style="width: 200px;margin-right: 10px;height: 35px;"
            :dropdown-style="{zIndex: 99999}"
            @change="handleSelectMenuGroupChange"
        >
            <template #placeholder>
                选择产品
            </template>
            <a-select-option v-for="{name, cn_name} in menuGroupList" :key="name" :label="cn_name" :value="name">
                 <span class="custom-item" style="color: var(--primary-color)">
                            <b class="vxe-icon-goods"></b>: {{ cn_name }}</span>
            </a-select-option>
        </a-select>
       
    </template>
    


</template>

<style scoped lang="scss">

</style>
