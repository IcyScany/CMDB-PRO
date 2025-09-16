<script setup>
import { policyMap } from '../../config';
import { policyApi } from '@/api/security/cloudWafApi';

const props = defineProps({
    templateId: {
        type: String,
        default: '',
    },
    rowData: {
        type: Object,
        default: () => ({}),
    },
    activeTab: {
        type: String,
        default: '',
    },
});

const emits = defineEmits(['update:templateId']);

const state = reactive({
    templateInfo: null,
    templateLoading: false,
});

// 阿里云模板选项
const templateOptions = computed(() => {
    let templateIds = JSON.parse((props.rowData.cc_policy_id || '{}').replace(/'/g, '"'));
    let key = policyMap[props.activeTab]?.['阿里云']?.key;

    return templateIds?.[`${key}_id`]?.map(item => ({
        label: `${item == props.templateId ? `${state.templateInfo?.resources}(${item})` : item}`,
        value: `${item}`,
    }));
});

// 获取阿里云模板列表
const getAliTemplateList = async (templateId) => {
    state.templateLoading = true;
    const res = await policyApi.aliTemplate.getList(props.rowData.cloud_master_account_id, templateId);
    state.templateInfo = res?.data?.[templateId] || {};
    state.templateLoading = false;
};

// 监听模板id
const handleTemplateChange = async (event) => {
    let templateId = event;
    if(!templateId) return;

    emits('update:templateId', templateId);
};

watch(
    () => props.templateId,
    (newVal) => {
        if (newVal) {
            getAliTemplateList(newVal);
        }
    },
    { immediate: true } // 如果初始就有值会立即执行
);

</script>

<template>
    <div class="flex items-center">
        <a-select
            :value="templateId"
            :options="templateOptions"
            @change="handleTemplateChange"
        />
        <vxe-button 
            :icon="`vxe-icon-repeat ${state.templateLoading ? 'roll': ''}`" 
            circle
            class="ml-2"
            size="small"
            @click="getAliTemplateList(templateId)"
        />
    </div>

    <div class="mb-2 text-sm" style="color: #999">
        模板选择：用于将规则添加至某一模板内。若当前域名无对应模板，需要到
        <a href="https://signin.aliyun.com/login.htm#/main" target="_blank">阿里云</a>
        新增模板。
    </div>

    <div class="template-info" :loading="state.templateLoading">
        <div>已生效的域名：{{ state.templateInfo?.resources }}</div>
    </div>
</template>

<style scoped>
.template-info {
    padding: 10px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
}
</style>