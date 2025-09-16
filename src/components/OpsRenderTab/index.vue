<script setup>

import {pluck} from 'xe-utils';

let props = defineProps({
    tabType: {
        type: Array,
        default: () => [{label: '总览', value: 'overview', is_change_bg: true}],
    },
});
let { tabType } = toRefs(props);

const state = reactive({
    viewType: tabType.value[0].value,
});

let emits = defineEmits(['update:type']);
// 获取当前选中的按钮位置
const viewBtnPostion = () => {
    let index = pluck(tabType.value, 'value').indexOf(state.viewType);
    const btn = document.querySelector(`.view-btn-${index}`);

    if (btn) {
        const viewSwitcher = document.querySelector('.view-switcher');
        const viewSwitcherRect = viewSwitcher.getBoundingClientRect();

        const rect = btn.getBoundingClientRect();
        return (rect.left + rect.right - 60) / 2 - viewSwitcherRect.left;
    }
};

const handleClick = (viewType) => {
    state.viewType = viewType.value;
    if(viewType?.is_change_bg) {
        viewType?.is_change_bg &&  updateMainContentBg('rgb(246 247 250)');
    } else {
        updateMainContentBg('white');
    }
    emits('update:type', state.viewType);
};

const updateMainContentBg = (bg) => {
    const mainContent = document.querySelector('.main-content');
    if(mainContent){
        mainContent.style.setProperty('background-color', bg);
    }
};

onMounted(() => {
    tabType.value?.[0].is_change_bg && updateMainContentBg('rgb(246 247 250)');
    emits('update:type', state.viewType);
});



onBeforeUnmount(() => {
    updateMainContentBg('white');
});


defineExpose({
    handleClick,
});


</script>

<template>
     <!-- 视图切换 -->
     <div class="view-switcher">
        <span
            v-for="(item, index) in tabType"
            :key="item.value"
            class="view-btn"
            :class="[state.viewType === item.value ? 'view-selected' : '', `view-btn-${index}`]"
            @click="handleClick(item)"
            @customChange="handleClick(item)"
        >
            {{ item.label }}
        </span>

        <svg 
            class="view-switcher-line text-primary" 
            width="60" 
            height="15" 
            viewBox="0 0 400 120"
            :style="{ left: viewBtnPostion() + 'px' }"
        >
            <path d="M0,120 Q200,50 400,120" stroke="currentColor" stroke-width="8" fill="currentColor"/>
        </svg>
    </div>

    <template v-for="item in tabType">
        <slot v-if="state.viewType === item.value" :name="item.value"   :title="item.label" >
            <component :is="item.value" />
        </slot>
    </template>

   

</template>


<style scoped lang="less">

.view-switcher {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 40px;
    background-color: #ffffff;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 20px;

    .view-btn {
        position: relative;
        font-size: 17px;
        color: #b0b0b0;
        cursor: pointer;
        transition: color 0.2s, font-weight 0.2s;
        line-height: 40px;
        min-width: 60px;
        text-align: center;
    }

    .view-selected {
        position: relative;
        color: #222;
        font-weight: 600;
    }
    
}

.view-switcher-line {
    position: absolute;
    bottom: 0px;
    transition: left 0.5s ease;
}
</style>

