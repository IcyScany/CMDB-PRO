import http from '@/utils/axios';

const urlPrefix = `network/load-balancer/`;

export default {
    // 获取概览
    getOverview() {
        return http.get(`${urlPrefix}overview`);
    },
    // 获取列表
    postList(data) {
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
    // 获取监听器列表
    getListeners(sid) {
        return http.post(`${urlPrefix}listener/list?load_balancer_id=${sid}`);
    },
    // 获取监控指标
    getMetric(sid, data) {
        return http.post(`${urlPrefix}monitor/metric?load_balancer_id=${sid}`, { dimensions: data });
    },
    // 获取监控指标值
    getMetricValue(data) {
        return http.post(`${urlPrefix}monitor/metric_value`, data);
    },
    // 获取IP组列表
    getIpgroup(sid, ipGroupIds) {
        return http.post(`${urlPrefix}ip-group/list?load_balancer_id=${sid}`, { ip_group_ids: ipGroupIds });
    },
    // 获取服务器组列表
    getServerGroup(sid, loadBalancerIds) {
        return http.post(`${urlPrefix}server-group/list?load_balancer_id=${sid}`, { load_balancer_ids: [loadBalancerIds] });
    },
};
