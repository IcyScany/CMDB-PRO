import http from '@/utils/axios';
import systemConfig from '@/config/index';
import { userCommonMessageStore } from '@/stores';


let { NO_NEED_V3_CONFIG, HEADER_CONFIG  } = systemConfig;
const USER_BASE_URL = "/public/";
const loginHeaderConfig = {...NO_NEED_V3_CONFIG, ...HEADER_CONFIG};
const userAPI = {
    /**
   * 获取当前登录用户信息
   * @returns 登录用户名、头像信息，所属的业态id、所属的业态列表
   **/
    async getUserInfoApi() {
        return  http.get(`${USER_BASE_URL}user/info`, HEADER_CONFIG);
    },
    // 获取当前登录用户的所有菜单权限：主要用在首页的渲染中
    getUserAllMenusList() {
        return  http.get(`${USER_BASE_URL}user/menus/list`, {...HEADER_CONFIG, showLoading: true});
    },
    /**
     * 获取当前登录用户的菜单权限
     * @todo 暂未使用该api
     * **/
    async getUserMenus() {
        let userCommonStore = userCommonMessageStore();
        let currentCheckedMenuGroup = userCommonStore?.checkedMenuGroup || userCommonStore?.globalCheckedMenuGroup;
        return http.get(`${USER_BASE_URL}user/${currentCheckedMenuGroup}/menus`, HEADER_CONFIG);
    },
    /**
     * 获取当前登录用户的菜单组
     * **/
    getUserMenuGroup() {
        return  http.get(`${USER_BASE_URL}user/menu_group`, {...HEADER_CONFIG});
    },

    /**
   * 系统的登出
   */
    userLogout() {
        return http.get(`/login/logout`, loginHeaderConfig);
    },
    /**
   * 系统的登录
   */
    userLogin(data) {
        return http.post(`/login/`, data, loginHeaderConfig);
    },
    /**
   * 系统的登录前需获取其key，以及对其密码加密
   * @returns 用于put、patch、post请求的验证token，用户密码加密的偏移量
   */
    userLoginKey(username) {
        return http.get(`/login/key/${username}`, loginHeaderConfig);
    },
    // 获取短信验证码
    getLoginPhoneCode(mobile) {
        return http.get(`/login/sms-login/${mobile}`, loginHeaderConfig);
    },
    userFeiShuLogin(code, state) {
        return http.get(`/login/feishu-login/${import.meta.env.VITE_FEI_SHU_LOGIN_ID}/${code}/${state}`, loginHeaderConfig);
    },

};

export default userAPI;
