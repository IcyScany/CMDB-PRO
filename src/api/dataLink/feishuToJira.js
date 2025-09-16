import http from '@/utils/axios';

const urlPrefix = `data-linking/feishu-to-jira/`;

export default {
    // 飞书到Jira的数据列表
    postList(data) {
        return http.post(`${urlPrefix}list`, data);
    },
    // 飞书到Jira的数据总览
    getOverview() {
        return http.get(`${urlPrefix}overview`, {showLoading: true});
    },
    // 飞书到Jira的数据详情
    getDetail(id) {
        return http.get(`${urlPrefix}list/${id}`, {showLoading: true});
    },

   
};
