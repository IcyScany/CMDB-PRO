import http from '@/utils/axios';

const urlPrefix = `network/vpc-route/`;

export default {
    // 获取列表
    getList() {
        return http.get(`${urlPrefix}list`);
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
    // 获取子网列表
    getSubnetsList(sid) {
        return http.get(`${urlPrefix}table/list/${sid}`);
    },
    // 获取VPC列表
    getVpcList() {
        return http.get(`${urlPrefix}vpc/list`);
    },
};
