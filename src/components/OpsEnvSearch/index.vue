<script setup>
import commonApi from '@/api/common';


let props = defineProps({
    pageAppName: { // 页面的应用名
        type: String,
    },

});

let currentPageEnvs = ref([]);// 当前页面拥有的环境
let activeEnv = ref([]); // 当前选中的有那一些环境

let emits = defineEmits(['envSearch']);

onMounted(() => {
    currentPageEnvs.value = [];
    if (props.pageAppName) {
        // 获取当前页面的拥有的环境
        commonApi.getPageEnvironment(props.pageAppName)
            .then(res => {
                currentPageEnvs.value = res.filter(item => item);
            });
    }

});

// 环境切换搜索的时候
const handleChangeEnv = (env) => {
    let dataIndex = activeEnv.value.indexOf(env);
    if(dataIndex === -1) {
        activeEnv.value.push(env);
    } else{
        activeEnv.value.splice(dataIndex, 1);
    }
    emits('envSearch', activeEnv.value);
};

</script>

<template>
    <div v-if="currentPageEnvs.length" class="pt-5 pb-5 mr-5">
        <b>环境<i class="vxe-icon-funnel"></i></b>
        <a-button 
            v-for="(env,idx) in currentPageEnvs"  
            :key="env"  
            type="primary" 
            :ghost="activeEnv.indexOf(env) === -1" 
            :class="{'ml-2': idx !== 0}" 
            size="small" 
            @click="handleChangeEnv(env)"
        >
            {{ env }}
        </a-button>
    </div>
</template>
