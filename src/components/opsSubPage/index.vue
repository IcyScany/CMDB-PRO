<script setup>
import { useSlots } from 'vue';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    basicConfig: {
        type: Object,
        default: () => ({
            show: true,
            columns: [],
            api: () => {},
            sid: 0,
            customParams: null
        }),
    },
    customTabs: {
        type: Array,
        default: () => [],
    },
    showEdit: {
        type: Boolean,
        default: true,
    },
    commonObjType: {
        type: String,
        default: '',
    }
});

const { open } = toRefs(props);
const emit = defineEmits(['update:open', 'update:activeTab', 'clickEdit', 'getSubPageData']);

const slots = useSlots();
const renderSlots = Object.keys(slots);

const BASIC_KEY = 'basic';
const state = reactive({
    basicData: {},
    activeKey: BASIC_KEY,
    loading: false
});

// 基础信息tab配置
const basicConfig = computed(() => {
    return Object.assign({ key: BASIC_KEY, title: '基础信息', show: true }, props.basicConfig);
});

// tab展示配置
const tabs = computed(() => {
    if (!basicConfig.value.show) {
        return props.customTabs;
    }

    return [
        basicConfig.value,
        ...props.customTabs,
    ];
});

const handleAfterOpenChange = async () => {
    state.activeKey = tabs.value[0].key;
    emit('update:activeTab', state.activeKey);
    
    // 请求基础信息数据
    const { api, sid, customParams } = basicConfig.value;
    if (!open.value || !api) return;

    state.loading = true;
    try {
        if (customParams) {
            state.basicData = await api(customParams);
        } else {
            state.basicData = await api(sid);
        }
    } catch (error) {
        console.error(error);
    }

    emit('getSubPageData', state.basicData);
    state.loading = false;
};

const handleClose = () => {
    emit('update:open', false);
    state.basicData = {};
};

// tab切换
const handleTabChange = (key) => {
    state.activeKey = key;
    emit('update:activeTab', key);
};



defineExpose({
    handleTabChange
});
</script>

<template>
    <ops-form-container
        v-bind="$attrs"
        :open="open"
        :title="title"
        @close="handleClose"
        @after-open-change="handleAfterOpenChange"
    >
        <a-spin :spinning="state.loading">
            <a-tabs v-model:activeKey="state.activeKey" @change="handleTabChange">
                <a-tab-pane v-for="item in tabs" :key="item.key" :tab="item.title">
                    <template v-if="item.key === state.activeKey">
                        <!-- 如果设置isCustomTab为true，则自定义展示 -->
                        <slot v-if="item.isCustomTab" :name="item.key" :data="item.data || state.basicData" />
        
                        <!-- 默认为描述展示 -->
                        <a-card v-else>
                            <ops-descriptions 
                                :data="item.data || state.basicData"
                                :columns="item.columns"
                                :column="item.column || 1"
                                :common-obj-type="commonObjType"
                            >
                                <template v-for="slot in renderSlots" #[slot]="slotProps">
                                    <slot v-if="item.key === BASIC_KEY" :name="slot" v-bind="slotProps" />
                                    <slot v-else :name="`${item.key}-${slot}`" v-bind="slotProps" />
                                </template>
                            </ops-descriptions>
                        </a-card>
        
                        <!-- 除描述列表外的自定义内容 -->
                        <slot v-if="item.key === BASIC_KEY" name="basic-extra" :row="state.basicData" />
                        <slot v-else :name="`${item.key}-extra`" :row="state.basicData" />
                    </template>
                </a-tab-pane>
            </a-tabs>
    
            <template v-if="showEdit" #footer>
                <vxe-button status="primary" content="编辑" @click="emit('clickEdit')"/>
            </template>
        </a-spin>
        <template v-for="item in renderSlots" #[item]="scope" >
                    <slot
                        :name="item"
                        :scope="scope"
                        v-bind="scope || {}"
                    />
                </template>
    </ops-form-container>
</template>

<style scoped>
:deep(.ant-card) {
    border-color: #cccccc;
}
</style>
