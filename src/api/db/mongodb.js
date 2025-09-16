import http from '@/utils/axios';

const urlPrefix = `db/mongodb/`;
const urlPrefixList = {
    account: `${urlPrefix}account/`,
    database: `${urlPrefix}database/`,
    collection: `${urlPrefix}collection/`,
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
    collection: {
        // 获取列表
        getList(data) {
            return http.post(`${urlPrefixList.collection}list`, data);
        },
        // detail
        getDetail(sid) {
            return http.get(`${urlPrefixList.collection}list/${sid}`);
        },
    },
    monitor: {
        // 获取监控指标
        postMetric(sid, data) {
            if(data?.cloud_node_id) {
                return http.post(`${urlPrefixList.monitor}metric/${sid}?cloud_node_id=${data.cloud_node_id}`);
            }
            else {
                return http.post(`${urlPrefixList.monitor}metric/${sid}`);
            }
        },
        // 获取监控图表
        postChartData(data) {
            return http.post(`${urlPrefixList.monitor}metric_value`, data);
        },
    },
};
