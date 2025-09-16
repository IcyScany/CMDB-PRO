<script setup>
import userAPI from '@/api/auth/user';
import { userCommonMessageStore } from '@/stores';

const props = defineProps({
    clientId: {
        type: String,
        required: true
    },
    redirectUri: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['login-success', 'login-error']);

const userCommonStore = userCommonMessageStore();

const state = reactive({
    loading: false,
    error: null,
    QRLoginObj: '',
    timeStamp: '',
    fs_url: ''
});

// 检查是否是飞书环境
const isFeishuApp = () => {
    return /Lark|Feishu/i.test(navigator.userAgent);
};

// 统一的飞书登录处理函数
const handleFeishuLogin = async (code, stateParam = null) => {
    try {
        state.loading = true;
        state.error = null;
        
        /*  console.log('Processing Feishu login with code:', code);
        // 在授权页面地址上拼接上参数 tmp_code，并跳转
        userAPI.userLoginKey(stateParam || state.timeStamp); */
        
        // 调用飞书登录API
        const loginResult = await userAPI.userFeiShuLogin(code, stateParam || state.timeStamp);
        
        // 处理登录成功
        userCommonStore.setLoginSuccess(loginResult);
        
        const { business_list, next_url } = loginResult || {};
        const businessArr = Object.keys(business_list);
        
        if (businessArr.length === 1) {
            // 单个业态，直接跳转
            const targetUrl = next_url || '/product';
            window.location.href = targetUrl;
        } else if (businessArr.length > 1) {
            // 多个业态，跳转到业态选择页面
            window.location.href = '/check/business/page';
        }
        
        emit('login-success', loginResult);
        
    } catch (error) {
        console.error('Feishu login failed:', error);
        state.error = error?.response?.data?.msg || '飞书登录失败，请重试';
        emit('login-error', error);
        
        // 如果是网络错误，尝试重新获取授权码
        if (error?.response?.status === 500 || error?.response?.status === 0) {
            console.log('Network error, retrying authentication...');
            setTimeout(() => {
                if (isFeishuApp()) {
                    initSDKAuth();
                } else {
                    // 重新生成二维码
                    generateQRCode();
                }
            }, 2000);
        }
    } finally {
        state.loading = false;
    }
};

// 处理二维码扫描消息
const handleMessage = (event) => {
    if (state.QRLoginObj && state.QRLoginObj.matchOrigin && state.QRLoginObj.matchData) {
        if (state.QRLoginObj.matchOrigin(event.origin) && state.QRLoginObj.matchData(event.data)) {
            const loginTmpCode = event.data.tmp_code;
            // 在授权页面地址上拼接上参数 tmp_code，并跳转
            userAPI.userLoginKey(state.timeStamp);
            handleFeishuLogin(loginTmpCode);
        }
    }
};

// 生成二维码
const generateQRCode = () => {
    // 清理之前的状态
    state.error = null;
    state.loading = false;
    
    // 清理之前的二维码对象
    if (state.QRLoginObj !== '') {
        try {
            // 移除之前的事件监听器
            if (typeof window.removeEventListener !== 'undefined') {
                window.removeEventListener('message', handleMessage, false);
            } else if (typeof window.detachEvent !== 'undefined') {
                window.detachEvent('onmessage', handleMessage);
            }
        } catch (e) {
            console.warn('Failed to remove event listener:', e);
        }
        state.QRLoginObj = '';
    }
    
    state.timeStamp = new Date().getTime();
    state.fs_url = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${props.clientId}&redirect_uri=${props.redirectUri}&response_type=code&state=${state.timeStamp}`;
    
    // 确保DOM元素存在
    nextTick(() => {
        if (window.QRLogin) {
            state.QRLoginObj = window.QRLogin({
                id: 'fslogin',
                goto: state.fs_url,
                width: '260',
                height: '260',
                style: 'width:260px;height:260px;border:none'
            });

            if (typeof window.addEventListener !== 'undefined') {
                window.addEventListener('message', handleMessage, false);
            } else if (typeof window.attachEvent !== 'undefined') {
                window.attachEvent('onmessage', handleMessage);
            }
        } else {
            state.error = '二维码生成失败，请刷新页面重试';
        }
    });
};

// SDK认证
const initSDKAuth = () => {
    if (!window.h5sdk) {
        console.warn("H5SDK not available");
        return;
    }

    // 错误处理
    window.h5sdk.error((err) => {
        console.error("H5SDK Error:", JSON.stringify(err));
        if (err.errorCode === 1014) {
            console.log("Network error detected, trying fallback...");
            setTimeout(() => {
                callRequestAuthCode();
            }, 1000);
        }
    });

    // 生成时间戳
    state.timeStamp = new Date().getTime();

    // SDK 配置
    window.h5sdk.config({
        appId: props.clientId,
        jsApiList: ['requestAuthCode', 'requestAccess', 'getUserInfo'],
        timeStamp: state.timeStamp,
        nonceStr: 'feishu_' + state.timeStamp,
        signature: '',
        onSuccess: () => {
            console.log("SDK config success");
            apiAuth();
        },
        onFail: (err) => {
            console.error("SDK config failed:", err);
            if (err.errorCode === 1014) {
                console.log("Config failed due to network error, trying fallback...");
                setTimeout(() => {
                    callRequestAuthCode();
                }, 1000);
            }
        },
    });
};

// 降级方案
const callRequestAuthCode = () => {
    if (!window.h5sdk || !window.tt) {
        console.error('H5SDK or TT not available for fallback');
        return;
    }
    
    window.tt.requestAccess({
        appID: props.clientId,
        redirectUri: props.redirectUri,
        scopeList: ['contact:user.employee_id:readonly'],
        success: ({ code }) => {
            console.log('Auth code:', code);
            handleFeishuLogin(code);
        },
        fail: (error) => {
            console.error('Request auth code failed:', error);
            state.error = '授权失败，请重试';
        },
    });
};

// API认证
const apiAuth = () => {
    const tt = window.tt || {};
  
    if (tt.requestAccess) {
        tt.requestAccess({
            appID: props.clientId,
            redirectUri: props.redirectUri,
            scopeList: ['contact:user.employee_id:readonly'],
            success: (res) => {
                const { code } = res;
                console.log('Access code:', code);
                handleFeishuLogin(code);
            },
            fail: (error) => {
                const { errno } = error;
                console.error('Access denied:', error);
                if (errno === 103) {
                    callRequestAuthCode();
                } else {
                    setTimeout(() => {
                        callRequestAuthCode();
                    }, 1000);
                }
            },
        });
    } else {
        console.log('requestAccess not available, using fallback...');
        callRequestAuthCode();
    }
};

// 检查URL参数
const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const stateParam = urlParams.get('state');
    
    if (code && stateParam) {
        console.log('Found authorization code in URL, processing login...');
        // 清除URL参数，避免重复处理
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // 处理登录
        handleFeishuLogin(code, stateParam);
        return true;
    }
    return false;
};

// 重新生成二维码
const regenerateQRCode = () => {
    state.error = null;
    generateQRCode();
};

// 暴露方法给父组件
defineExpose({
    generateQRCode,
    regenerateQRCode,
    handleFeishuLogin
});

onMounted(() => {
    // 首先检查URL参数
    if (checkUrlParams()) {
        return;
    }
    
    // 检查是否是飞书环境
    if (isFeishuApp()) {
        console.log('Feishu environment detected, initializing SDK...');
        setTimeout(() => {
            initSDKAuth();
        }, 1000);
    } else {
        console.log('Non-Feishu environment, generating QR code...');
        generateQRCode();
    }
});
</script>

<template>
    <div class="feishu-login-handler">
        <!-- 加载状态 -->
        <div v-if="state.loading" class="feishu-loading">
            <a-spin size="large" />
            <p>登录中，请稍候...</p>
        </div>
        
        <!-- 错误提示 -->
        <div v-else-if="state.error" class="feishu-error">
            <a-alert 
                :message="state.error" 
                type="error" 
                show-icon 
                closable
                @close="state.error = null"
            />
            <a-button 
                type="primary" 
                size="small" 
                style="margin-top: 12px;"
                @click="regenerateQRCode"
            >
                重新生成二维码
            </a-button>
        </div>
        
        <!-- 二维码区域 -->
        <div v-else id="fslogin" class="fs-login"></div>
    </div>
</template>

<style scoped lang="less">
.feishu-login-handler {
    width: 260px;
    margin: auto;
    text-align: center;
}

.fs-login {
    width: 260px;
    height: 260px;
    position: relative;
    margin: auto;
    text-align: center;
    border: 0 solid #DFE1E6;
    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTc4cHgiIGhlaWdodD0iMTc4cHgiIHZpZXdCb3g9IjAgMCAxNzggMTc4IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA2MC4xICg4ODEzMykgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+5LqM57u056CB6IOM5pmvPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9Iumhtemdoi0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0i5LqM57u056CB6IOM5pmvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjAwMDAwMCwgMS4wMDAwMDApIj4KICAgICAgICAgICAgPHJlY3QgaWQ9IuefqeW9oiIgc3Ryb2tlPSIjRTlFREZBIiBmaWxsPSIjRkZGRkZGIiB4PSIwLjUiIHk9IjAuNSIgd2lkdGg9IjE3NSIgaGVpZ2h0PSIxNzUiPjwvcmVjdD4KICAgICAgICAgICAgPHBvbHlsaW5lIGlkPSLnm7Tnur8iIHN0cm9rZT0iIzI1MkIzQSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgcG9pbnRzPSIxNzAgMCAxNzYgMCAxNzYgNiI+PC9wb2x5bGluZT4KICAgICAgICAgICAgPHBvbHlsaW5lIGlkPSLnm7Tnur/lpIfku70iIHN0cm9rZT0iIzI1MkIzQSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMy4wMDAwMDAsIDMuMDAwMDAwKSByb3RhdGUoLTkwLjAwMDAwMCkgdHJhbnNsYXRlKC0zLjAwMDAwMCwgLTMuMDAwMDAwKSAiIHBvaW50cz0iMCAwIDYgMCA2IDYiPjwvcG9seWxpbmU+CiAgICAgICAgICAgIDxwb2x5bGluZSBpZD0i55u057q/5aSH5Lu9LTIiIHN0cm9rZT0iIzI1MkIzQSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMy4wMDAwMDAsIDE3My4wMDAwMDApIHJvdGF0ZSgtMTgwLjAwMDAwMCkgdHJhbnNsYXRlKC0zLjAwMDAwMCwgLTE3My4wMDAwMDApICIgcG9pbnRzPSIwIDE3MCA2IDE3MCA2IDE3NiI+PC9wb2x5bGluZT4KICAgICAgICAgICAgPHBvbHlsaW5lIGlkPSLnm7Tnur/lpIfku70tMyIgc3Ryb2tlPSIjMjUyQjNBIiBzdHJva2UtbGluZWNhcD0ic3F1YXJlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNzMuMDAwMDAwLCAxNzMuMDAwMDAwKSByb3RhdGUoLTI3MC4wMDAwMDApIHRyYW5zbGF0ZSgtMTczLjAwMDAwMCwgLTE3My4wMDAwMDApICIgcG9pbnRzPSIxNzAgMTcwIDE3NiAxNzAgMTc2IDE3NiI+PC9wb2x5bGluZT4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    background-size: cover;
}

.feishu-loading {
    width: 260px;
    height: 260px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    
    p {
        margin-top: 16px;
        color: #666;
        font-size: 14px;
    }
}

.feishu-error {
    width: 260px;
    margin: auto;
    text-align: center;
}
</style>
