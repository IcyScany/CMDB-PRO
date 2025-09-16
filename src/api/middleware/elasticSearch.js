import http from '@/utils/axios';

const urlPrefix = `middleware/elasticsearch/`;

export default {
    // 1. 集群相关
    // 总览
    getOverview() {
        return http.get(`${urlPrefix}overview`);
    },
    // 获取列表
    getList() {
        return http.get(`${urlPrefix}cluster/list`);
    },
    // detail
    getDetail(sid) {
        return http.get(`${urlPrefix}cluster/${sid}`);
    },
    // 新增
    postAdd(data) {
        return http.post(`${urlPrefix}cluster/add`, data);
    },
    // 编辑
    putEdit(sid, data) {
        if(data.cloud_source === '自建'){
            delete data.cloud_source;
            return http.put(`${urlPrefix}cluster/edit/${sid}`, data);
        } else {
            delete data.cloud_source;
            return http.put(`${urlPrefix}cluster/cloud-edit/${sid}`, data);
        }
    },
    // 删除
    del(sid) {
        return http.delete(`${urlPrefix}cluster/delete/${sid}`);
    },
    // 验证地址
    verifyAddr(data) {
        return http.post(`${urlPrefix}cluster/verify-addr`, data);
    },
    // 复制密码
    copyPwd(data) {
        return http.get(`${urlPrefix}cluster/copy-pwd/${data.id}${data.addr ? `?address_pwd_manage_addr=${data.addr}` : ''}`, { noErrorTip: true });
    },
    getInfo(clusteType, data) {
        return http.post(`${urlPrefix}cluster/get-info/${clusteType}`, data);
    },

    // 2. 队列相关
    // 获取队列列表
    getNodes(clusterId) {
        return http.get(`${urlPrefix}nodes/${clusterId}`);
    },

    // 3. 子用户相关
    // 获取子用户列表
    getSubUser(clusterId) {
        return http.get(`${urlPrefix}sub-user/list/${clusterId}`);
    },
    // 获取子用户详情
    getSubUserDetail(id) {
        return http.get(`${urlPrefix}sub-user/${id}`);
    },
    // 编辑子用户
    putSubUserEdit(id) {
        return http.put(`${urlPrefix}sub-user/edit/${id}`);
    },
    // 新增子用户
    postSubUserAdd(id) {
        return (data) => http.post(`${urlPrefix}sub-user/add/${id}`, data);
    },
    // 删除子用户
    delSubUser(id) {
        return http.delete(`${urlPrefix}sub-user/delete/${id}`);
    },
    // 复制密码
    copySubUserPwd(clusterId) {
        return http.get(`${urlPrefix}sub-user/copy-pwd/${clusterId}`, { noErrorTip: true });
    },
    verifySubUser(clusterId, data) {
        return http.post(`${urlPrefix}sub-user/verify/${clusterId}`, data);
    }
};
