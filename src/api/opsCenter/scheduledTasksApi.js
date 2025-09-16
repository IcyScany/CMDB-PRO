import http from '@/utils/axios';

const urlPrefix = `ops-center/scheduled-tasks/`;



export default {
    // 总览
    getScheduledTasksOverview() {
        return http.get(`${urlPrefix}overview`, {showLoading: true});
    },

    // 读取一个定时任务的明细
    getScheduledTasksList(task_sid) {
        return http.get(`${urlPrefix}list/${task_sid}`);
    },

    // 读取定时任务列表
    postScheduledTasksList(data) {
        return http.post(`${urlPrefix}list`, data);
    },

    // 新增定时任务
    postScheduledTasksAdd( data) {
        return http.post(`${urlPrefix}add`, data);
    },

    // 编辑定时任务
    putScheduledTasksEdit(task_sid, data) {
        return http.put(`${urlPrefix}edit/${task_sid}`, data);
    },

    // 删除定时任务
    delScheduledTasks(task_sid) {
        return http.delete(`${urlPrefix}delete/${task_sid}`);
    },

    getLogList(task_sid, timestamp) {
        return http.get(`${urlPrefix}log/${task_sid}?timestamp=${timestamp}`);
    },


};
