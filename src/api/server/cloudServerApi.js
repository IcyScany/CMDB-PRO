import http from '@/utils/axios';

const urlPrefix = `server/cloud-server/`;


export default {
    // 获取云服务器明细
    getCloudServerOneList(server_sid) {
        return http.get(`${urlPrefix}list/${server_sid}`);
    },
    // 云服务器编辑
    putCloudServerEdit(server_sid, data) {
        if(data.cloud_source === '自建') {
            delete data.cloud_source;
            return http.put(`${urlPrefix}self-edit/${server_sid}`, data);
        } else {
            delete data.cloud_source;
            return http.put(`${urlPrefix}cloud-edit/${server_sid}`, data);
        }
    },
    // 获取云服务器信息
    getServerInfo(data) {
        return http.post(`${urlPrefix}server-info`, data);
    },
    // 获取云服务器信息
    getServerPwd(sid) {
        return http.get(`${urlPrefix}copy-pwd/${sid}`, { noErrorTip: true });
    },

    /*获取云服务器列表的数据
    * body:
    *  {
    *   page_number: 1, // 页码
        curr_page: 1,
        page_limit: 20, // 每页的数量
        sort_field: 'id',
        sort_order: 'ASC',
        query_condition: [],
    * }
    * */
    // 列表的渲染
    async postAccountListApi(data) {
        return http.post(`${urlPrefix}list`,data);
    },
    // 自建服务器新增
    async postAccountAddDataApi(data) {
        return http.post(`${urlPrefix}self-add`,data);
    },
    // 自建服务器删除
    async deleteAccountApi(sid) {
        return http.delete(`${urlPrefix}self-delete/${sid}`);
    },
    // 云服务器总览
    async getOverview() {
        return http.get(`${urlPrefix}overview`);
    },
    monitorTabApi: {
        // 获取服务器常用实时监控指标列表
        async getMonitorTabList(server_id) { // server_id 服务器id
            return http.get(`${urlPrefix}monitoring/${server_id}`, {noErrorTip: true});
        },
        // 获取服务器常用实时监控指标的值
        async postMonitorTabDetail({server_id, data}) { // server_id 服务器id,
            return http.post(`${urlPrefix}monitoring/value/${server_id}`,data);
        },
    }

};
