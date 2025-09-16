import http from '@/utils/axios';
import systemConfig from '@/config/index';

let { HEADER_CONFIG  } = systemConfig;
const COMMON_BASE_URL = "/public/";
const publicRequest = (url) => http.get(COMMON_BASE_URL + url, HEADER_CONFIG);

const commonApi = {
    // 获取当前菜单的第几层title
    getCurrentMenuTitleApi({layer= 1, id}) {
        return publicRequest(`user/${id}/title/${layer}`);
    },

    /** 获取业态列表 **/
    getCommonBusinessList: () => { // 获取业态的列表
        let requestUrl = `business/list`;
        let requestHttp = publicRequest(requestUrl);
        let businessData = ref({});
        const requestBusinessData = () => { // 请求业态相关的处理
            let businessList = reactive({
                data: null,
                error_msg: null,
                error_status: null,
                loading: true,
            });
            requestHttp.then(res => {
                businessList.data = res;
                businessList.loading = false;
            })
                .catch((error) => {
                    let response = error?.response;
                    businessList.error_status = response?.status;
                    businessList.error_msg = response?.message || response?.data?.msg;
                    businessList.loading = false;
                });
            businessData.value = businessList;
            return businessList;
        };

        return {
            business_url: requestUrl,
            business_http: requestHttp,
            requestBusinessData,
            business_data: businessData,
        };
    },

    /** 获取虚拟用户组列表的数据 **/
    getVirtualTeamList: () => {
        return publicRequest(`virtual-team/list`);
    },

    /** 获取虚拟组的明细**/
    getCommonVirtualTeamOneData: (id) => {
        return publicRequest(`virtual-team/list/${id}`);
    },

    /** 获取随机的key**/
    getRandomKey: () => {
        return publicRequest(`random/key`);
    },
    /** 获取对应页面的环境**/
    getPageEnvironment: (app_name) => {
        return publicRequest(`environment/${app_name}`);
    },

    /*/v3/{business}/public/sync-data, 页面数据同步*/
    getSyncData: (uri) => {
        return  http.get(COMMON_BASE_URL + `sync-data?uri=${uri}`);
    },

    /* * 获取云区域列表* */
    getCloudRegionList: () => {
        return publicRequest(`cloud-regions/list`);
    },

    /* * 获取华为项目列表* */
    getHuaweiProjectList: () => {
        return publicRequest(`huawei_project_list`);
    },
    
    /* 获取产品对应的数量 */
    getProductCount: () => {
        return publicRequest(`product/count`);
    },

    /* * 获取所有的二级菜单的数据 * */
    /* getSubMenuList: () => {
        return publicRequest(`user/menus/2/list`);
    }, */
};

export default commonApi;
