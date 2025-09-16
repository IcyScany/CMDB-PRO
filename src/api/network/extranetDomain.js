import http from '@/utils/axios';

const urlPrefix = `network/extranet_domain/`;

export default {
    // 总览
    getOverview() {
        return http.get(`${urlPrefix}overview`);
    },
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
        return http.put(`${urlPrefix}edit-dns/${sid}`, data);
    },
    // 删除
    del(sid) {
        return http.delete(`${urlPrefix}del/${sid}`);
    },
    // 获取zone列表
    getZoneList(sid) {
        return http.get(`${urlPrefix}zones_list/${sid}`);
    },
    // 获取云主账号列表
    getCloudAccountList() {
        return http.get(`${urlPrefix}cloud-account-list`);
    },
};
