import http from '@/utils/axios';

const urlPrefix = `security/security-group/`;

export default {
    // 总览
    getOverview() {
        return http.get(`${urlPrefix}overview`, {showLoading: true});
    },
    // 获取列表
    getList(data) {
        return http.post(`${urlPrefix}list`, data);
    },
    // detail
    getDetail(sid) {
        return http.get(`${urlPrefix}list/${sid}`);
    },
    // 获取安全组规则
    getSecurityGroupRule(sid) {
        return http.get(`${urlPrefix}rule/list?security_group_id=${sid}`);
    },
};
