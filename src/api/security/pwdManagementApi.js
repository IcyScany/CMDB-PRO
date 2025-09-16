import http from '@/utils/axios';
import { encodePasswd } from "@/composables/encryptField";

const urlPrefix = `security/pwd_management/`;

export default {
    // 获取总览
    getOverview(data) {
        return http.post(`${urlPrefix}overview`, data);
    },
    // 获取列表
    getPwdManageList() {
        return http.get(`${urlPrefix}list`);
    },
    // detail
    getPwdManageDetail(sid) {
        return http.get(`${urlPrefix}list/${sid}`);
    },
    // 新增
    postPwdManageAdd(data) {
        return http.post(`${urlPrefix}add`, data);
    },
    // 编辑
    putPwdManageEdit(sid, data) {
        return http.put(`${urlPrefix}edit/${sid}`, data);
    },
    // 删除
    delPwdManage(sid, encryption_private_key) {
        return http.delete(`${urlPrefix}delete/${sid}`, {
            data: {
                encryption_private_key: encryption_private_key || ''
            }
        });
    },
    // 重置密码验证码发送
    sendCode(create_id) {
        return http.get(`${urlPrefix}send_code/${create_id}`);
    },
    // 复制凭据
    copyPwd(sid, encryption_private_key) {
        return http.get(`${urlPrefix}copy_pwd/${sid}?encryption_private_key=${encryption_private_key || ''}`);
    },
    // 编辑自定义密钥
    async changePwd(params) {
        return http.put(`${urlPrefix}edit_key/${params.id}`, {
            encryption_private_key: await encodePasswd(params.encryption_private_key),
            new_key: await encodePasswd(params.new_key),
            tips: params.tips
        });
    },
    // 重置私钥密码
    async resetPwd(params) {
        return http.put(`${urlPrefix}edit_key_other/${params.id}`, {
            auth_code: await encodePasswd(params.auth_code),
            new_key: await encodePasswd(params.new_key),
            tips: params.tips
        });
    },
    // 获取用户列表
    getUserList() {
        return http.get(`${urlPrefix}user_list`);
    },
};
