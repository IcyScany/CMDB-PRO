/*
 axios实例，最常用这个
 设置config.noErrorTip：返回错误时没有弹窗提示
 设置config.toLoginPage：返回430时是否前往登录页：否的话默认打开登录弹窗；是的话可传入login页的url可带next参数，只传true就默认去login页没有next参数
 */
import { createVNode, render } from "vue";
import router from '@/router';
import axios from 'axios';
import { userCommonMessageStore } from "@/stores";
import { LAYER_ZINDEX_TOP } from '@/config/globalOption';
import { Modal, notification, Spin } from "ant-design-vue";
import { cookie } from "xe-utils";

// 创建 axios 实例
const http = axios.create({
    baseURL: import.meta.env.VITE_BASE_API,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
});

// 处理登录的跳转
const handleLoginJump = (config) => {
    const userCommonStore = userCommonMessageStore();
    const checkBusData = userCommonStore?.loginCurrentBus || userCommonStore?.globalShareCheckBus;
    const isUseModalLogin = userCommonStore?.isUseModalLogin; // 获取当前的登录方式是弹窗登录还有页面登录

    if(checkBusData) { // 有业态的选择的时候
        if(!cookie.has('tk_cmdb')) {// 没有获取到tk_cmdb
            if(isUseModalLogin){ // 弹窗登录
                Modal.destroyAll();
                userCommonStore.handleUseModalLogin(true);
            } else{
                Modal.destroyAll();
                userCommonStore.handleUseModalLogin(false);
                router.push({ name: 'Login' });
            }
            return config;
        }
    } else {
        userCommonStore.handleClearUserMessage();
        Modal.destroyAll();
        userCommonStore.handleUseModalLogin(false);
        router.push({ name: 'Login' });
        return config;
    }

    return  {
        userCommonStore,
        checkBusData,
        isUseModalLogin
    };
};

// 请求计数器
let requestCount = 0;

// 显示全局 loading
const showLoading = () => {
    if (requestCount === 0 || 
      !document.getElementById('loading-container')
    ) {
        const dom = document.createElement('div');
        dom.setAttribute('id', 'loading-container');
        dom.style.cssText = `
             position: fixed;
             top: 0;
             left: 0;
             right: 0;
             bottom: 0; 
             display: flex;
             align-items: center;
             justify-content: center;
             z-index: ${LAYER_ZINDEX_TOP};
         `;
        document.body.appendChild(dom);

        const spin = createVNode(Spin, {
            size: 'large',
            tip: '加载中...'
        });
        render(spin, dom);
    }
    requestCount++;
};

// 隐藏全局 loading
const hideLoading = () => {
    requestCount--;
    const dom = document.getElementById('loading-container');
    if (requestCount === 0 || dom) {
        if (dom) {
            document.body.removeChild(dom);
        }
    }
};

// 错误处理函数
const handleError = (error, config) => {
    const { status, data } = error.response || {};
    const errorMsg = data?.msg || data?.message;

    if (!config.noErrorTip) {
        const errorHandlers = {
            422: () => {
                const details = data?.detail;
                if (Array.isArray(details)) {
                    const errorItems = details.slice(0, 3).map(item =>
                        createVNode('li', {}, [
                            createVNode('div', {}, `类型: ${item.type} 返回信息：${item.msg}`),
                            createVNode('pre', { style: { background: '#000', color: '#fff' } }, item.loc)
                        ])
                    );

                    Modal.error({
                        title: `${errorMsg}【${status}】`,
                        width: '50%',
                        content: () => createVNode('ul', { style: 'white-space: pre-line' }, errorItems),
                        zIndex: LAYER_ZINDEX_TOP
                    });
                } else {
                    notification.error({
                        message: `${errorMsg}【${status}】`,
                        description: String(details),
                        zIndex: LAYER_ZINDEX_TOP
                    });
                }
            },

            430: async (error) => {
                localStorage.clear();
                sessionStorage.clear();
                await  handleLoginJump(config);
                return Promise.reject('showing-login', config, error);
            },

            default: () => {
                const msg = status > 499 ? '后台服务器异常' : errorMsg;
                notification.error({
                    message: '错误提示',
                    description: () => createVNode('pre', { style: 'white-space: pre-line' }, msg),
                    zIndex: LAYER_ZINDEX_TOP
                });
            }
        };

        (errorHandlers[status] || errorHandlers.default)();
    }

    return Promise.reject(error);
};

// 请求拦截器
http.interceptors.request.use(
    (config) => {
        if (config?.showLoading) {
            showLoading();
        } else {
            hideLoading();
        }
        let { checkBusData} = handleLoginJump(config);

        
        config.headers.Authorization = cookie.get('tk_cmdb');
        config.headers['X-User-Role'] = checkBusData;

        const isSpecialRoute = config.url.startsWith('manage/') || config.url.startsWith('/login/') || config.url.startsWith('bcm-public/');
        const isLoginApi = config.baseURL === import.meta.env.VITE_BASE_LOGIN_API;

        if (!isSpecialRoute && !isLoginApi) {
            config.baseURL = `${import.meta.env.VITE_BASE_API}/${checkBusData}`;
        }

        return config;
    },
    (error) => {
        hideLoading();
        return Promise.reject(error);
    }
);

// 响应拦截器
http.interceptors.response.use(
    (response) => {
        hideLoading();
        const isSuccess = response.data.status <= 299 || response.status;
        if (isSuccess) {
            return response.data;
        }

        if (!response.config.noErrorTip) {
            Modal.error({
                title: '错误提示',
                content: () => createVNode('pre', {}, response.data.msg),
                zIndex: LAYER_ZINDEX_TOP,
            });
        }
        return Promise.reject(response.data);
    },
    (error) => {
        hideLoading();
        return handleError(error, error.config);
    }
);

export default http;
