import http from '@/utils/axios';

const urlPrefix = `server/cloud_obs/`;

export default {
    // 总览
    getOverview(data) {
        return http.post(`${urlPrefix}overview`, data);
    },
    // 获取列表
    getList(data) {
        return http.post(`${urlPrefix}list`, data);
    },
    // detail
    getDetail(sid) {
        return http.get(`${urlPrefix}list/${sid}`);
    },
    // 编辑
    putEdit(sid, data) {
        return http.put(`${urlPrefix}edit/${sid}`, data);
    },
    // 获取应用详情
    getAppDetail(sid) {
        return http.get(`${urlPrefix}one_app/${sid}`);
    },
    // 编辑应用
    putAppEdit(sid, data) {
        return http.put(`${urlPrefix}edit_app/${sid}`, data);
    },
    getInfo: {
        app: (sid) => { 
            return http.get(`${urlPrefix}app_list/${sid}`); 
        },
        policy: (sid) => { 
            return http.get(`${urlPrefix}policy/${sid}`); 
        },
        cors: (sid) => { 
            return http.get(`${urlPrefix}cors/${sid}`); 
        },
        lifecycle: (sid) => { 
            return http.get(`${urlPrefix}lifecycle/${sid}`); 
        },
        userList: () => { 
            return http.get(`${urlPrefix}user_list`); 
        },
    },
};
