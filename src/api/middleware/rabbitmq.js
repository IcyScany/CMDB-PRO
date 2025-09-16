import http from '@/utils/axios';

const urlPrefix = `middleware/rabbit-mq/`;

export default {
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
    copyPwd(clusterId) {
        return http.get(`${urlPrefix}cluster/copy_pwd/${clusterId}`, { noErrorTip: true });
    },
    // 获取队列列表
    getQueue(clusterId) {
        return http.get(`${urlPrefix}cluster/queues/${clusterId}`);
    },
    // 获取节点列表
    getNodes(clusterId) {
        return http.get(`${urlPrefix}cluster/nodes/${clusterId}`);
    },
};
