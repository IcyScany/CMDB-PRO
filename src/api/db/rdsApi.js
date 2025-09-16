import http from '@/utils/axios';

const urlPrefix = `db/rds/`;
const urlPrefixList = {
    account: `${urlPrefix}account/`,
    database: `${urlPrefix}database/`,
    table: `${urlPrefix}table/`,
    log: `${urlPrefix}slow_log/`,
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
    }
};

export const apiList = {
    account: {
        // 获取列表
        getList(data) {
            return http.post(`${urlPrefixList.account}list`, data);
        },
        // detail
        getDetail(sid) {
            return http.get(`${urlPrefixList.account}list/${sid}`);
        },
        // 新增
        postAdd(data) {
            return http.post(`${urlPrefixList.account}add`, data);
        },
        // 编辑
        putEdit(sid, data) {
            return http.put(`${urlPrefixList.account}edit/${sid}`, data);
        },
        // 删除
        del(sid) {
            return http.delete(`${urlPrefixList.account}delete/${sid}`);
        },
    },
    database: {
        // 获取列表
        getList(data) {
            return http.post(`${urlPrefixList.database}list`, data);
        },
        // detail
        getDetail(sid) {
            return http.get(`${urlPrefixList.database}list/${sid}`);
        },
        // 编辑
        putEdit(sid, data) {
            return http.put(`${urlPrefixList.database}edit/${sid}`, data);
        },
    },
    table: {
        // 获取列表
        getList(data) {
            return http.post(`${urlPrefixList.table}list`, data);
        },
        // detail
        getDetail(sid) {
            return http.get(`${urlPrefixList.table}list/${sid}`);
        },
    },
    log: {
        // 获取日志详情列表
        postLogDetailList(sid, param) {
            return http.post(`${urlPrefixList.log}${sid}`, { param: param });
        },
        postLogStatisticsList(sid, param) {
            return http.post(`${urlPrefixList.log}statistics/${sid}`, { param: param });
        },
    },
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
