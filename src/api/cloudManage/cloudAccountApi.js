import http from '@/utils/axios';

const urlPrefix = `cloud-manage/cloud-account/`;
export default {
    // 获取云账号管理列表的数据
    async getAccountListApi() {
        return http.get(`${urlPrefix}list`);
    },
    // 读取一个云账号信息
    async getAccountOneListApi(cloud_account_sid) {
        return http.get(`${urlPrefix}list/${cloud_account_sid}`);
    },
    // 获取云账号可用区信息
    getAccountRegionsApi(cloud_account_sid) {
        return http.get(`${urlPrefix}regions/${cloud_account_sid}/list`);
    },
    // 获取云账号企业项目信息
    getAccountEnterpriseProjectApi(cloud_account_sid) {
        return http.get(`${urlPrefix}enterprise-project/${cloud_account_sid}/list`);
    },

    // 验证云账号信息
    postCheckAccount(data) {
        return http.post(`${urlPrefix}check-account`, data);
    },
    // 新增云账号信息
    postAddAccount(data) {
        return http.post(`${urlPrefix}add-account`, data);
    },

    // 编辑云账户信息
    putEditAccount(cloud_account_sid, data) {
        return http.put(`${urlPrefix}edit-account/${cloud_account_sid}`, data);
    },
    // 编辑云账户可用区信息
    putEditReginAccount(cloud_account_sid, cloud_regions_sid, data) {
        return http.put(`${urlPrefix}edit-regions/${cloud_account_sid}/${cloud_regions_sid}`, data);
    },

};

export const subAccountApi = {
    // 获取云账号管理列表的数据
    async getList(sid) {
        return http.get(`${urlPrefix}sub-account/${sid}/list`);
    },
    // 获取云账号管理列表的数据
    async getDetail({sid, id}) {
        return http.get(`${urlPrefix}sub-account/${sid}/list/${id}`);
    },
};

export const subAccountAkApi = {
    // 获取云账号管理列表的数据
    async getList(sid) {
        return http.get(`${urlPrefix}sub-account-ak/${sid}/list`);
    },
};
