import http from '@/utils/axios';

const urlPrefix = `monitor/log/log-monitoring/`;

export default {
    // 获取总览
    getOverview(data) {
        return http.get(`${urlPrefix}overview`, data);
    },
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
    deleteDel(sid) {
        return http.delete(`${urlPrefix}delete/${sid}`);
    },

    getDataSource() {
        return http.get(`${urlPrefix}data-source`);
    },
    getDataSourceIndex(data) {
        return http.post(`${urlPrefix}data-source/index`, data);
    }
};
