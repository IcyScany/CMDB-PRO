<script setup>
import API from '@/api/opsCenter/scheduledTasksApi';
import moment from 'moment';

const props = defineProps({
    logData: {
        type: Object,
        default: () => ({}),
    },
    open: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:open']);

const listContentRef = ref(null);
const state = reactive({
    loading: false,
    data: [],
    log_timestamp: Math.floor(Date.now() / 1000),
});

const getLog = async () => {
    if (state.log_timestamp === -1 || state.loading) {
        return;
    }
    state.loading = true;
    API.getLogList(props.logData.id, state.log_timestamp).then(res => {
        state.loading = false;
        if (res.param.length) {
            state.log_timestamp = res.param[0]['_source']['timestamp'];
            state.data.push(...res.param);
            if (listContentRef.value.scrollHeight <= listContentRef.value.parentNode.clientHeight) {
                getLog();
            }
        } else {
            state.log_timestamp = -1;
        }
    }).catch(() => {
        state.loading = false;
        state.log_timestamp = -1;
    });
};

// 滚动事件
const handleScroll = (e) => {
    // 滚动条滚动到底部发请求
    let isBottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight;
    if(Math.floor(isBottom) <= 0 && state.log_timestamp !== -1) {
        getLog();
    }
};

const calculateTimePeriod = (val, is_ms = true) => {
    let time_arr = ['年', '月', '周', '天', '小时', '分', '秒'];
    let time_item = [
        60 * 60 * 24 * 1000 * 30 * 12,
        60 * 60 * 24 * 1000 * 30,
        60 * 60 * 24 * 7 * 1000,
        60 * 60 * 24 * 1000,
        60 * 60 * 1000,
        60 * 1000,
        1000
    ];
    let result = val + ' 毫秒';
    let sum = val;
    for (let i in time_item) {
        if (val >= time_item[i]) {
            let num = parseInt(val / time_item[i]);
            sum = num * time_item[i];
            result = `${num} ${time_arr[i]}`;
            break;
        }
    }
    let more = val - sum ? calculateTimePeriod(val - sum) : '';
    return `${result}${is_ms ? more : ''}`;
};

const handleDrawerOpen = (open) => {
    if (open) {
        getLog();
    } else {
        state.data = [];
        state.log_timestamp = Math.floor(Date.now() / 1000);
    }
};

</script>

<template>
    <ops-form-container
        :open="open"
        title="定时任务日志"
        @update:open="emit('update:open', $event)"
        @after-open-change="handleDrawerOpen"
    >
        <div>
            <div>定时任务日志查看 IP: {{ logData.run_address }}</div>
            <div class="my-2">命令: {{ logData.run_command }}</div>
        </div>
        <a-spin :spinning="state.loading" size="large">
            <div ref="listContentRef" class="list-box" @scroll="handleScroll">
                <div v-for="item in state.data" :key="item._id">
                    <div :class="[item._source.status ? `bg-gradient-success`: `bg-gradient-danger`, 'py-1']">
                        <b>开始时间：</b>{{moment(item._source.timestamp * 1000).format("YYYY-MM-DD HH:mm:ss")}}
                        <b>结束时间：</b>{{moment(item._source.stop_time * 1000).format("YYYY-MM-DD HH:mm:ss")}}
                        <b>执行时间：</b>{{calculateTimePeriod((item._source.stop_time - item._source.timestamp)*1000)}}
                        <span style="margin-left: 30px;">状态码：({{ item._source.status }})</span>
                    </div>
                    <pre class="cmd-style">{{item._source.task_log}}</pre>
                </div>
            </div>
        </a-spin>
        <div v-if="state.log_timestamp === -1" class="end-box"> END </div>
    </ops-form-container>
</template>

<style scoped lang="less">
.list-box {
    height: 600px;
    overflow-y: auto;
    .cmd-style {
        white-space: pre-wrap;
        word-wrap: break-word;
        background-color: #000;
        color: #fff;
        font-size: 13px;
        padding: 9.5px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
}
.end-box {
    text-align: center;
    color: var(--green-3);
    font-size: 1rem;
}

.bg-gradient-success {
    background: var(--primary-5);
    color: white;
}

.bg-gradient-danger {
    background: var(--red-3);
}
</style>
