<script setup>
import { ADD_TYPE, EDIT_TYPE } from "@/config/globalOption";
import { editMap } from "./config";
import HwTemplate from "./policy/components/hwTemplate.vue";

const props = defineProps({
    open: { 
        type: Boolean, 
        default: false, 
    },
    formType: { 
        type: Number,
        default: ADD_TYPE
    },
    policyRows: {
        type: Array,
        default: () => ([]),
    },
    editData: {
        type: Object,
        default: () => ({}),
    },
    editCloud: {
        type: String,
        default: '',
    },
    activeTab: {
        type: String,
        default: '',
    },
    activeTabTitle: {
        type: String,
        default: '',
    },
});

const emits = defineEmits(['update:open', 'editSuccess']);

const editRef = ref({});

const state = reactive({
    checked: {
        '华为云': false,
        '阿里云': false,
    },
    success: {
        '华为云': false,
        '阿里云': false,
    },
    errorMsg: '',
    confirmOpen: false,
});

// 打开模态框
const handleDrawerOpen = async (val) => {
    if(!val) {
        state.errorMsg = '';
        state.success['华为云'] = false;
        state.success['阿里云'] = false;
        state.checked['华为云'] = false;
        state.checked['阿里云'] = false;
    }
};

// 关闭模态框
const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleSubmit = async (isConfirm) => {
    if(!isConfirm && state.checked['华为云']) {
        state.confirmOpen = true;
    }
    else {
        state.confirmOpen = false;
        await Promise.all(Object.keys(editRef.value)
            .filter(cloud => state.checked[cloud])
            .map(async cloud => await editRef.value[cloud].editSubmit()));
    }
};

const handleEditError = (error) => {
    state.errorMsg = error;
};

const handleEditSuccess = (cloud) => {
    state.success[cloud] = true;

    if(['华为云', '阿里云'].every(val => state.success[val] === state.checked[val])) {
        emits('editSuccess');
    }
};

const isShowEdit = (cloud) => {
    if(props.formType === EDIT_TYPE) {
        let editCloud = props.editCloud;
        state.checked[cloud] = editCloud === cloud;
        return props.open && editCloud === cloud;
    }

    state.checked['华为云'] = false;
    state.checked['阿里云'] = false;
    return props.open;
};

</script>

<template>
    <ops-form-container
        :title="`${activeTabTitle}${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}`"
        :open="open"
        width="70%"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
        <template
            v-for="(cloud, index) in policyRows.map(item => item.cloud_source)" 
            :key="index" 
        >
            <a-card v-if="isShowEdit(cloud)">
                <template #title>
                    <a-checkbox 
                        v-if="formType === $CONFIG.FORM_TYPE.ADD_TYPE" 
                        v-model:checked="state.checked[cloud]" 
                    />
                    <CloudTypeIcon
                        style="width: none; margin: 0 5px;"
                        :type="cloud"
                    />
                    <span>{{ cloud }}</span>
                </template>

                <component
                    :is="editMap?.[activeTab]?.[cloud]"
                    v-show="state.checked[cloud]"
                    :ref="el => { if(el) editRef[cloud] = el }"
                    :row-data="policyRows.find(item => item.cloud_source === cloud) || policyRows[0]"
                    :sid="editData?.id"
                    :edit-data="editData"
                    :form-type="formType"
                    :active-tab="activeTab"
                    @edit-error="handleEditError"
                    @edit-success="handleEditSuccess(cloud)"
                />
            </a-card>
        </template>

        <template #footer>
            <div class="flex justify-between items-center">
                <div class="text-error">
                    {{ state.errorMsg }}
                </div>
                <div class="w-[200px]">
                    <vxe-button content="取消" @click="handleDrawerClose"/>
                    <vxe-button 
                        type="submit" 
                        :loading="editRef[0]?.loading || editRef[1]?.loading"  
                        status="primary" 
                        content="提交"  
                        @click="handleSubmit(false)"
                    />
                </div>
            </div>
        </template>
    </ops-form-container>

    <a-modal
        v-model:open="state.confirmOpen"
        title="华为云提示"
        width="70%"
        @ok="handleSubmit(true)"
    >
        <hw-template :row-data="policyRows.find(item => item.cloud_source === '华为云') || policyRows[0]" />
    </a-modal>
</template>

<style lang="scss" scoped>
.ant-card {
    margin-bottom: 10px;
    border: 1px solid #939393;
}
</style>
