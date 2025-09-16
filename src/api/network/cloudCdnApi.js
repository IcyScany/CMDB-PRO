import http from '@/utils/axios';

const urlPrefix = `network/cloud_cdn/`;

export default {
    // 总览
    getOverview(data) {
        return http.post(`${urlPrefix}overview`, data);
    },
    // 获取列表
    postList(data) {
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
    // 获取下一跳
    getNextHop(sid) {
        return http.get(`${urlPrefix}next_hop/${sid}`);
    },
};
