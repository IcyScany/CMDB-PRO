/* 证书管理 */
import http from '@/utils/axios';
import systemConfig from '@/config/index';


let { HEADER_CONFIG  } = systemConfig;
const cloudUrlPrefix = `monitor/`; // 云证书
const urlPrefix = `${cloudUrlPrefix}certificate_management/`;
const publicUrlPrefix = `public/`; // 公共接口

const huaweiUrlPrefix = `${cloudUrlPrefix}huawei_cert_update/`; // 华为证书



export default {// 证书管理
    // 获取总览
    getOverview(data) {
        return http.post(`${urlPrefix}overview`, data, {showLoading:true} );
    },
    // 获取证书的更新时间限制配置
    getCertTimeLimit() {
        return http.get(`${publicUrlPrefix}name-info/business_config/cert_monitor`);
    },
    // 获取某一条证书明细
    getCertOneList(cert_sid) {
        return http.get(`${urlPrefix}list/${cert_sid}`);
    },
  
    // 获取证书的列表
    getCertAllDataList() {
        return http.get(`${urlPrefix}list`);
    },
    // 获取证书的用户列表
    getCertUserList() {
        return http.get(`${urlPrefix}username_list`);
    },
    // 获取证书更新时的某一条更新日志 /monitor/certificate_management/one_update_cert_domain_log/
    getCertUpdateLogOne({task_id, domain_id}) {
        return http.get(`${urlPrefix}one_update_cert_domain_log/${task_id}/${domain_id}`,{noErrortip: true, showLoading:true});
    },

    // 证书新增
    async postCertAddDataApi(data) {
        return http.post(`${urlPrefix}add`,data);
    },
    // 证书验证
    postCertVerifyApi(data) {
        return http.post(`${urlPrefix}check_cert`,data);
    },

    // 证书编辑
    putCertEdit(cert_sid, data) {
        return http.put(`${urlPrefix}edit/${cert_sid}`, data);
    },
    // 证书删除
    deleteCert(cert_sid) {
        return http.delete(`${urlPrefix}delete/${cert_sid}`);
    },

    // 证书的上传日志
    getCertImportLog({service}) { // service: 华为云 、阿里云
        return http.get(`${urlPrefix}import_cert_log/${service}`);
    },
    // 证书的更新日志
    postCertUpdateLog(data) {
        return http.post(`${urlPrefix}update_cert_log`,data);
    },
    // 获取单条证书的更新日志·
    getCertOneUpdateLog({task_id}) {
        return http.get(`${urlPrefix}one_update_cert_log/${task_id}`);
    },

    /**  
     * 华为云证书相关  --Start 
     * 
     * **/
    getHuaweiCertList({action, domain, service}) { // 获取华为证书的列表 action cdn_domain_list 或 waf_domain_list 或 elb_listener_list
        return http.get(`${cloudUrlPrefix}${service}/${action}/${domain}`);
    },

    // 获取SCM证书列表
    getScmCertList(cert_sid) {
        return http.get(`${huaweiUrlPrefix}scm_list/${cert_sid}`);
    },
    // 导入SCM证书
    postScmCertUpload({action,service,data}) {
        return http.post(`${cloudUrlPrefix}${service}/${action}`,data);
    },
    // 使用scm证书推送到WAF或ELB
    postScmCertPush({cert_sid,data}) {
        return http.post(`${huaweiUrlPrefix}waf_or_elb_import_cert/${cert_sid}`,data);
    },
    // 更新CDN证书
    postCdnCertUpdate({cert_sid,data}) {
        return http.post(`${huaweiUrlPrefix}update_cdn_cert/${cert_sid}`,data);
    },
    // 更新WAF证书
    postWafCertUpdate({cert_sid,data}) {
        return http.post(`${huaweiUrlPrefix}update_waf_cert/${cert_sid}`,data);
    },
    // 更新ELB证书
    postElbCertUpdate({cert_sid,data}) {
        return http.post(`${huaweiUrlPrefix}update_elb_cert/${cert_sid}`,data);
    },
    /**
     *  华为云证书相关  --End 
     * 
     * **/

    /**
     * 点击开始更新相关的操作
     * 
     * * */
    // 证书管理获取获取task_id, 用于后续的进度查询、一批次的任务标识
    getCertUpdateTaskId() {
        return http.get(`${publicUrlPrefix}get_task_id`, HEADER_CONFIG);
    },
    // 将要更新的域名存如数据库
    postCertUpdateDomainSaveToDb(data) {
        return http.post(`${urlPrefix}add_domain_to_db`,data,HEADER_CONFIG);
    },

    // 选择需要测试域名进行证书的验证
    postCertCheckDomain({data, type_domain}) {
        return http.post(`${urlPrefix}check-host/${type_domain}`, data, HEADER_CONFIG);
    },
    // 选择是后获取当前域名是否有存入的测试
    getCertCheckDomain({type_domain}) {
        return http.get(`${urlPrefix}verify-domain-name/${type_domain}`, HEADER_CONFIG);
    },


    // 证书更新
    async putCertUpdate({action, service, data}) { // action: update_cdn_cert 、update_waf_cert、update_elb_cert service: huawei_cert_update 、aliyun_cert_update
        return http.put(`${cloudUrlPrefix}${service}/${action}`,data, HEADER_CONFIG);
    },

   
};
