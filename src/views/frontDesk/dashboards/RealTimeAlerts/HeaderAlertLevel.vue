<script setup>
/* 用于监控告警页面头部告警数量的显示 */

import systemConfig from '@/config';

let props = defineProps({
    data: { // 监控告警的数据
        type: Array,
        default: () => []
    },
    alertCheck: { // 用于检测监控告警系统是否异常
        type: Object,
        default: () => {
            return {};
        },
    },
    type: {
        type: String,
        default: '',
    },
    selectedLevels: {
        type: Array,
        default: () => ['P0', 'P1', 'P2']
    }
});

let { data, alertCheck } = toRefs(props);
let alertLevelCount = ref({}); // 用于统计告警的数量
let checkAlertCount = ref(0);
let emits = defineEmits(['levelFilter']);
let {ALERT_LEVEL, ALERT_LEVEL_COLOR} = systemConfig;

watch(() => data.value, (newVal) => {
    alertLevelCount.value = JSON.parse(JSON.stringify(ALERT_LEVEL_COLOR));
    checkAlertCount.value = 0;
    for(let level in alertLevelCount.value) {
        alertLevelCount.value[level]['count'] = 0;
    }
    for(let item in newVal) {
        let row = newVal[item];
        if(row?.source !== "cmdb_alert_check") { // 检测cmdb监控是否异常不统计在告警级别中
            alertLevelCount.value[row.alert_level || row.level]['count'] ++;
        } else {
            checkAlertCount.value ++;
        }
    }

}, {deep: true});


let levelFilter = ref([...props.selectedLevels]);

watch(() => props.selectedLevels, (val) => {
    levelFilter.value = [...val];
});

// 点击告警级别
function handleLevelClick(level) {
    const idx = levelFilter.value.indexOf(level);
    if (idx > -1) {
        if (levelFilter.value.length > 1) {
            levelFilter.value.splice(idx, 1);
        }
    } else {
        levelFilter.value.push(level); // 添加告警级别: 选中的不显示
    }
    emits('levelFilter', [...levelFilter.value]);
}


</script>

<template>
    
     <a-progress
         v-for="item in ALERT_LEVEL" :key="item" type="circle"
         :percent="(alertLevelCount?.[item]?.['count'] >= 10 ? 10 : alertLevelCount?.[item]?.['count'])/10 * 100"
         :trail-color="!levelFilter.includes(item) ? 'rgba(0, 0, 0, 0.04)' :'rgb(204 204 204 / 71%)'" :stroke-color="!levelFilter.includes(item) ? 'rgb(0, 0, 0, 0.04)' : ALERT_LEVEL_COLOR[item]?.color"
         :stroke-width="!levelFilter.includes(item) ? 100 : 6" :size="100"
         :style="{marginRight: '3%', borderRadius: '50%'}"
         class="cursor-pointer"
         @click="handleLevelClick(item)"
        >
        <template #format>
            <b class="text-white" :style="{color: ALERT_LEVEL_COLOR[item]?.color , fontSize: '30px', textShadow: `${ ALERT_LEVEL_COLOR[item]?.color } 1px 0 1px`}">{{item}}</b><br>
            <span class="count-num text-black">{{ !levelFilter.includes(item) ? '不显示': alertLevelCount?.[item]?.['count'] }}</span>
        </template>
    </a-progress>
    
    <a-progress
        v-if="Object.keys(alertCheck).length >= 0"
        type="circle"
        :percent="100"
        :stroke-width="100"
        :stroke-color="!alertCheck || Object.keys(alertCheck).length === 0 || alertCheck.last_time >= 360 ?  ALERT_LEVEL_COLOR['P0'].color : 'rgb(135, 208, 104)'"
        :size="100"
       
        :style="{marginLeft: '3%', borderRadius: '50%', color: 'white', zIndex: 666}"
    >
        <template #format>
            <div class="text-black">
                <b style="font-size: 10px; display: inline-block;" >状态</b>
                <div class="check-system-heart">
                    <b>{{!alertCheck || Object.keys(alertCheck).length === 0 || alertCheck.last_time >= 360 ? '异常' : '正常'}}</b>
                </div>
                <div  style="height: 12px">
                    <span v-for="checkItem in checkAlertCount"  :key="checkItem">.</span>
                </div>
                <b style="font-size: 12px; display: inline-block" >{{alertCheck?.last_time}}</b>
            </div>
        </template>
    </a-progress>
</template>
<style scoped>
.count-num {
    font-size: 16px;
}
.check-system-heart {
    font-size: 25px;
    height: 12px;
    margin: 6% 0 4% 0;
 
}


</style>
