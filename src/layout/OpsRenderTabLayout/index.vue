<script setup>

import {useRoute} from 'vue-router';

let route = useRoute();


let props = defineProps({
    tabType: {
        type: Array,
        default: () => [],
    },
   
});
let { tabType } = toRefs(props);


const linePosition = ref({
    left: null,
    width: 50,
});

const computedLinePosition = (route) => {
    const index = props.tabType.findIndex((item) => item.name === route.name);
    const btn = document.querySelector(`.view-btn-${index}`);

    if (btn) {
        const viewSwitcher = document.querySelector('.view-switcher');
        const viewSwitcherRect = viewSwitcher.getBoundingClientRect();
        
        const rect = btn.getBoundingClientRect();
        linePosition.value.left = rect.left - viewSwitcherRect.left;
        linePosition.value.width = rect.width;
    }
};

onMounted(() => {
    computedLinePosition(route);
});

watch(route, (newVal) => {
    computedLinePosition(newVal);
}, {immediate: true, deep: true});



</script>

<template>
     <!-- 视图切换 -->
     <div class="view-switcher">
       

        <template
            v-for="(item, index) in tabType"
            :key="item.name"
        >
            <router-link
                :to="{name: item.name}"
                class="view-btn"
                :class="[$route.name === item.name ? 'view-selected' : '', `view-btn-${index}`]"
              
            >
                {{ item.meta?.title }}
            </router-link>
        </template>

        <svg 
            class="view-switcher-line text-primary-4" 
            width="50" 
            height="15" 
            viewBox="0 0 50 15"
            :style="{ left: linePosition.left + 'px'}"
        >
            <path :d="`M0,15 Q${linePosition.width / 2},5.5 ${linePosition.width},15`" fill="currentColor"/>
        </svg>
    </div>

  <!--   <template v-for="item in tabType">
        <slot v-if="state.viewType === item.name" :name="item.name"   :title="item.meta?.title" >
            <component :is="item.name" />
        </slot>
    </template> -->

   

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
        min-width: 50px;
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
    transition: left 0.1s ease;
    overflow: visible;
}
</style>

