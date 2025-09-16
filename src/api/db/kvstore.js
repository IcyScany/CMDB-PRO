import http from '@/utils/axios';

const urlPrefix = `db/kvstore/`;
const urlPrefixList = {
    monitor: `${urlPrefix}monitor/`,
};

export default {
    // 获取列表
    getList(data) {
        return http.post(`${urlPrefix}list`, data);
    },
    // detail
    getDetail(sid) {
        return http.get(`${urlPrefix}list/${sid}`);
    },
    // 新增
    postAdd(data) {
        return http.post(`${urlPrefix}add`, data);
    },
    // 编辑
    putEdit(sid, data) {
        return http.put(`${urlPrefix}edit/${sid}`, data);
    },
    // 删除
    del(sid) {
        return http.delete(`${urlPrefix}delete/${sid}`);
    },
    // 获取总览
    getOverview(data) {
        return http.post(`${urlPrefix}summary`, data);
    },
};

export const apiList = {
    monitor: {
        // 获取监控指标
        postMetric(sid, data) {
            return http.post(`${urlPrefixList.monitor}metric/${sid}`, data);
        },
        // 获取监控图表
        postChartData(sid, data) {
            return http.post(`${urlPrefixList.monitor}metric/value/${sid}`, data);
        },
    },
};