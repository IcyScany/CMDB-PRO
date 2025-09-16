import http from '@/utils/axios';

const urlPrefix = `security/cloud_waf/`;

export default {
    // 总览
    getOverview(data) {
        return http.post(`${urlPrefix}overview`, data);
    },
    // 获取列表
    getList(data) {
        return new Promise((resolve, reject) => {
            http.post(`${urlPrefix}list`, data).then((response) => {
                resolve(
                    {
                        ...response,
                        data: response.data.flat(),
                    }
                );
            }).catch(err => {
                reject(err);
            });
        });
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
        return http.put(`${urlPrefix}edit/${data.ids}`, data.data);
    },
    // 删除
    del(sid) {
        return http.delete(`${urlPrefix}delete/${sid}`);
    },
    // 获取源站列表
    getNextHop(sid) {
        return http.get(`${urlPrefix}next_hop/${sid}`);
    },
    // 获取防护规则近30天触发次数
    getRule(row, type) {
        if (type === '华为云') {
            return http.get(`${urlPrefix}rule/hw/${row.id}`);
        } else {
            return http.get(`${urlPrefix}rule/ali/${row.ruleid}`);
        }
    },
};

// 防护规则相关
export const policyApi = {
    aliTemplate: {
        getList(cloud_master_account_id, template_id) {
            return http.get(`${urlPrefix}ali-template-info/${cloud_master_account_id}?template_id=${template_id}`);
        },
    },

    // 获取华为云防护规则信息
    hwTemplate: {
        getList(sid) {
            return http.get(`${urlPrefix}huawei-policy-info/${sid}`);
        },
    },

    cc: {
        add(data) {
            return http.post(`${urlPrefix}add-cc`, data);
        },
        edit(sid, data) {
            return http.put(`${urlPrefix}edit-cc`, data);
        },
        del(sid, data) {
            return http.delete(`${urlPrefix}del-cc`, {
                data
            });
        },
    },

    ignore: {
        add(data) {
            return http.post(`${urlPrefix}add-ignore`, data);
        },
        edit(sid, data) {
            return http.put(`${urlPrefix}edit-ignore`, data);
        },
        del(sid, data) {
            return http.delete(`${urlPrefix}del-ignore`, {
                data
            });
        },
    },

    whiteBlackIp: {
        add(data) {
            return http.post(`${urlPrefix}add-whiteblackip`, data);
        },
        edit(sid, data) {
            return http.put(`${urlPrefix}edit-whiteblackip`, data);
        },
        del(sid, data) {
            return http.delete(`${urlPrefix}del-whiteblackip`, {
                data
            });
        },
        getAddrList(cloud_master_account_id, sid) {
            return http.get(`${urlPrefix}huawei-address-list/${cloud_master_account_id}/${sid}`);
        },
    },
};
