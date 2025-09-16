<script setup>
import { policyApi } from '@/api/security/cloudWafApi';

const props = defineProps({
    rowData: {
        type: Object,
        default: () => ({}),
    }
});

const state = reactive({
    templateList: [],
    collapse: true,
});

onMounted(async () => {
    const res = await policyApi.hwTemplate.getList(props.rowData.id);
    state.templateList = res?.data || [];
});

</script>

<template>
    <div class="template-info">
        <div class="mb-2 font-[500]">添加规则同样适用于以下所有域名：</div>
        <div class="flex items-center flex-wrap">
            <div v-for="item in (state.collapse ? state.templateList.slice(0, 4) : state.templateList)" :key="item.id" class="w-[25%]">
                {{ item }}
            </div>
        </div>
        <div class="text-primary cursor-pointer absolute right-5 bottom-2" @click="state.collapse = !state.collapse">
            {{ state.collapse ? '展开' : '收起' }}
        </div>
    </div>
</template>

<style scoped>
.template-info {
    position: relative;
    padding: 10px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    padding-bottom: 20px;
    margin-bottom: 10px;
}
</style>