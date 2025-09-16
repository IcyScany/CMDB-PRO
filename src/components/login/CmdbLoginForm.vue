<script  setup>
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons-vue';
import { encrypt } from '@/composables/encryptField';
import userAPI from '@/api/auth/user';
import { userCommonMessageStore } from '@/stores';
import XEUtils from 'xe-utils';
import { cookie } from 'xe-utils';

const props = defineProps({
    loginType: {
        type: String,
        default: ''
    },
});
const { loginType } = toRefs(props);

const userCommonStore = userCommonMessageStore();
const loginMode = ref('phone'); // 默认手机号登录
let verifyCodeDisable = ref(true); // 获取验证码的按钮是否禁用
const initLoginResponseData = { // 登录返回的信息
    message: null,
    color: null,
    verify_code_text: "获取验证码",
    status: '',
};
let responseContent = reactive(initLoginResponseData);

let emits = defineEmits(['loginSuccess']);

/** 密码/ 手机登录 --start**/
let initFormState = {
    username: loginType.value ? userCommonStore.loginInput.username : null,
    password: null,
    phone: null,
    verify_code: null,
};
let formStateUser = reactive(initFormState);
let loginLoading = ref(false);

const onFinish = () => {
    let data = JSON.parse(JSON.stringify(formStateUser));
    if (loginMode.value === 'password') {
        data.username = data.username.trim();
        userAPI.userLoginKey(data.username).then((res) => {
            let key = res.key;
            let s1 = encrypt(data.password, key);
            let postData = { username: data.username, password: s1 };
            loginSubmit(postData);
        });
    } else {
        data.phone = data.phone.trim();
        let postData = { username: data.phone, password: data.verify_code };
        loginSubmit(postData);
    }
};


/** 登录点击提交时的处理
 *  &登录成功的处理： 需判断当前登录的用户所属的业态的个数；
 *  业态个数 === 1，无需弹窗进行选择业态，默认就是那个业态；
 *  业态个数 > 1, 需弹窗进行选择业态，选择完确认后才能进行首页；
 * --Start**/
function loginSubmit(postData) {
    loginLoading.value = true;
    userCommonStore.handleUserLogin(postData)
        .then((res) => {
            let { business_list } = res || {};
            let  businessArr = Object.keys(business_list);
            if (businessArr.length === 1) {
                emits('loginSuccess');
            }
            if (businessArr.length > 1) { // 当前登录用户有多个角色时
                let currentBusiness = cookie('CMDB_CHECK_BUSINESS');
                if (!currentBusiness) {
                    window.location.href = '/check/business/page';
                } else {
                    userCommonStore.handleSetCurrentBus(currentBusiness);

                    let location = window.location;
                    if(location.pathname === '/login') {
                        location.href = location.search.replace('?next=', '');
                    } else {
                        location.reload();
                    }
                }
            }

            loginLoading.value = false;
            clearData();
            clearTimeout(timers.value);
        })
        .catch(error =>  {
            responseContent.message = error?.response?.data?.message || error?.response?.data?.msg;
            responseContent.color = 'error';
            loginLoading.value = false;
        });
}
/** 登录点击提交时的处理 --End**/

const onFinishFailed = () => {
};
const disabled = computed(() => {
    return loginMode.value === 'password' ? !(formStateUser.username && formStateUser.password) : !(formStateUser.phone && formStateUser.verify_code);
});
/** 密码登录 --End**/


// 手机号与用户名的验证
const validatePhone = (rule, val) => {
    if (!val) {
        verifyCodeDisable.value = true;
        return Promise.reject(`请输入11位手机号`);
    } else {
        if (loginMode.value === 'phone' && !XEUtils.isValidMobilePhone(val)) {
            verifyCodeDisable.value = true;
            return val.length === 11 ? Promise.reject(`请填写符合要求的11位手机号，需以13,14,15,16,17,18,19开头`) : Promise.reject(`请输入11位手机号`);
        } else {
            if (XEUtils.isValidMobilePhone(val)) {
                verifyCodeDisable.value = false;
            }
        }
    }
    return Promise.resolve();
};

/** 手机号登录 --Start**/
const loginRules = {
    username: [{ required: true, message: '用户名不能为空，请输入！！!' }],
    password: [{ required: true, message: '密码不能为空，请输入！！!' }],
    phone: [
        { validator: validatePhone },
    ],
    code: [
        { required: true, message: '请输入验证码' },
    ],
};

//验证码倒计时计数器
let  timers = ref(null);
const setTimer = () => {
    let time = 60;
    timers.value = setInterval(function () {
        time--;
        if (time >= 0) {
            verifyCodeDisable.value = true;
            responseContent.verify_code_text = `${time} 秒后重新获取`;
        } else {
            verifyCodeDisable.value = false;
            responseContent.verify_code_text = "获取验证码";
            clearInterval(timers);
        }
    }, 1000);
};


// 手机号验证码的获取
const handleGetVerifyCode = () => {
    formStateUser.phone = formStateUser.phone.trim();
    if (formStateUser.phone) {
        userAPI.getLoginPhoneCode(formStateUser.phone)
            .then((res) => {
                if (res.status_code === 200) {
                    setTimer();
                    responseContent.message = '验证码已发送到你的手机';
                    responseContent.color = 'success';
                } else {
                    responseContent.message = '验证码无法到达您的手机';
                    responseContent.color = 'warning';
                }
            })
            .catch((error) => {
                responseContent.message = error?.response?.data?.msg || '验证码获取失败';
                responseContent.color = 'error';
            });
    }
};
/** 手机号登录 --End**/

// 清空相关的数据
const clearData = () => {
    responseContent = initLoginResponseData;
    formStateUser = initFormState;
};

// 切换登录方式
const toggleLoginMode = () => {
    loginMode.value = loginMode.value === 'phone' ? 'password' : 'phone';
    handleLoginType();
};

let formStateRef = ref(null);
// 切换不同的tab清空登录信息
function handleLoginType() {
    formStateRef.value.clearValidate();
    responseContent.message = null;
    responseContent.color = null;
}
const feishu = reactive({
    dialogVisible: false,
    QRLoginObj: '', // 是否生成了二维码
    client_id: import.meta.env.VITE_FEI_SHU_CLIENT_ID, // 应用的AppID
    redirect_uri: import.meta.env.VITE_FEI_SHU_REDIRECT_URL, // 应用配置重定向的地址
    fs_url: '',
    timeStamp: '',
});
let handleMessage = function (event) {
    // 使用 matchOrigin 和 matchData 方法来判断 message 和来自的页面 url 是否合法
    if(feishu.QRLoginObj.matchOrigin(event.origin) && feishu.QRLoginObj.matchData(event.data)) {
        let loginTmpCode = event.data.tmp_code;
        // 在授权页面地址上拼接上参数 tmp_code，并跳转
        userAPI.userLoginKey(feishu.timeStamp);
        window.location.href = `${feishu.fs_url}&tmp_code=${loginTmpCode}`;
    }
};

//点击按钮，生成二维码
const handleFeishu = ()=>{
    if (feishu.QRLoginObj !== '') return false; // 避免重复点击
    feishu.timeStamp = new Date().getTime();
    feishu.fs_url = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${feishu.client_id}&redirect_uri=${feishu.redirect_uri}&response_type=code&state=${feishu.timeStamp}`;
    feishu.QRLoginObj = window.QRLogin({
        id: 'fslogin', //二维码展示区域的元素id
        goto: feishu.fs_url, //授权页面地址
        width: '260', //二维码展示区域的宽（二维码的尺寸固定为250px*250px)
        height: '260', //二维码展示区域的高
        style: 'width:260px;height:260px;border:none' //可选的，二维码html标签的style属性
    });

    if (typeof window.addEventListener != 'undefined') {
        window.addEventListener('message', handleMessage, false);
    } else if (typeof window.attachEvent != 'undefined') {
        window.attachEvent('onmessage', handleMessage);
    }
};

// 检查是否是飞书环境
const isFeishuApp = () => {
    return /Lark|Feishu/i.test(navigator.userAgent);
};

// 降级方案
const callRequestAuthCode = () => {
    if (!window.h5sdk || !window.tt) {
        console.error('H5SDK or TT not available for fallback');
        return;
    }
    window.tt.requestAuthCode({
        appID: feishu.client_id,
        success: ({ code }) => {
            if(window?.h5sdk?.biz?.navigation?.close) {
                window.h5sdk.biz.navigation.close({
                    onSuccess: function() {
                        userAPI.userLoginKey(feishu.timeStamp);
                        window.open(`${feishu.fs_url}&code=${code}`, '_blank');
                    }
                });
            } else {
                userAPI.userLoginKey(feishu.timeStamp);
                window.open(`${feishu.fs_url}&code=${code}`, '_blank');
                window.location.href = `about:blank`;
                window.close();
            }
        },
        fail: (error) => {
            console.error('Request auth code failed:', error);
           
        },
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
    feishu.timeStamp = new Date().getTime();
    feishu.fs_url = `${feishu.redirect_uri}?state=${feishu.timeStamp}`;
   
    apiAuth();
    
};

// API认证
const apiAuth = () => {
    const tt = window.tt || {};
    if (tt.requestAccess) {
        tt.requestAccess({
            appID: feishu.client_id,
            state: feishu.timeStamp,
            scopeList: [],
            success: (res) => {
                const { code } = res;
                  
                if(window?.h5sdk?.biz?.navigation?.close) {
                    window.h5sdk.biz.navigation.close({
                        onSuccess: function() {
                            userAPI.userLoginKey(feishu.timeStamp);
                            window.open(`${feishu.fs_url}&code=${code}`, '_blank');
                        }
                    });
                } else {
                    userAPI.userLoginKey(feishu.timeStamp);
                    window.open(`${feishu.fs_url}&code=${code}`, '_blank');
                    window.location.href = `about:blank`;
                    window.close();
                }
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






// 初始化时加载飞书登录
onMounted(() => {
    if (isFeishuApp()) {
        initSDKAuth();
    } else {
        handleFeishu();
    }
});

</script>


<template>
    <a-row type="flex" justify="center">
        <div class="login-form-box">
            <a-card
                hoverable
                style="width: 850px; padding: 0"
                class="login-form-box-item"
            >
                <template #title>
                    <h3 class="text-center">欢迎登录多云管理平台</h3>
                    
                </template>

                <div class="login-content">
                    <!-- 左侧飞书登录 -->
                    <div class="feishu-section">
                        <div class="feishu-title">
                            <SvgIcon iconname="icon-feishu" />
                            <span>飞书扫码登录</span>
                        </div>
                        <div id="fslogin" class="fs-login"></div>
                        <div class="feishu-tip">请使用 <span class="text-warning">飞书APP</span> 扫描二维码登录</div>
                    </div>
                

                    <!-- 右侧表单登录 -->
                    <div class="form-section">
                        <div class="login-mode-header">
                            <span class="login-mode-title">
                                {{ loginMode === 'phone' ? '手机号登录' : '密码登录' }}
                            </span>
                            <a-tooltip :title="loginMode === 'phone' ? '切换至密码登录' : '切换至手机号登录'">
                                <span class="login-mode-switch" @click="toggleLoginMode">
                                    <template v-if="loginMode === 'phone'">
                                        <LockOutlined />
                                    </template>
                                    <template v-else>
                                        <PhoneOutlined />
                                    </template>
                                </span>
                            </a-tooltip>
                        </div>

                        <a-form
                            ref="formStateRef"
                            :model="formStateUser"
                            :rules="loginRules"
                            layout="vertical"
                            @finish="onFinish"
                            @finish-failed="onFinishFailed"
                        >
                            <template v-if="loginMode === 'password'">
                                <!-- 密码登录表单 -->
                                <a-form-item
                                    name="username"
                                >
                                    <a-input v-model:value="formStateUser.username"  name="username" autocomplete>
                                        <template #prefix>
                                            <UserOutlined  />
                                        </template>
                                    </a-input>
                                </a-form-item>

                                <a-form-item
                                    name="password"
                                >
                                    <a-input-password v-model:value="formStateUser.password"  name="password" autocomplete="current-password">
                                        <template #prefix>
                                            <LockOutlined  />
                                        </template>
                                    </a-input-password>
                                </a-form-item>
                            </template>
                            <template v-else>
                                <!-- 手机号登录表单 -->
                                <a-form-item
                                    name="phone"
                                >
                                    <a-input v-model:value="formStateUser.phone" autocomplete>
                                        <template #prefix>
                                            <phone-outlined  />
                                        </template>
                                    </a-input>
                                </a-form-item>

                                <a-form-item
                                    name="verify_code"
                                >
                                    <a-input-group compact>
                                        <a-input v-model:value="formStateUser.verify_code" style="width: calc(100% - 200px)"/>
                                        <a-button type="primary" :disabled="!formStateUser.phone || verifyCodeDisable" style="width: calc(200px)" @click="handleGetVerifyCode">{{ responseContent.verify_code_text }}</a-button>
                                    </a-input-group>
                                </a-form-item>
                            </template>

                            <a-form-item>
                                <a-tag v-if="responseContent.message" :color="responseContent.color">
                                    {{responseContent.message}}
                                </a-tag>
                                <a-button 
                                    :disabled="disabled" 
                                    type="primary" 
                                    html-type="submit" 
                                    class="login-form-button"
                                    style="float: right;"
                                >
                                    登录
                                </a-button>
                            </a-form-item>
                        </a-form>
                    </div>
                </div>
            </a-card>
        </div>
    </a-row>

</template>



<style scoped lang="less">
.login-content {
    display: flex;
    align-items: stretch;
    min-height: 360px;
    
    &::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 80px;
        bottom: 40px;
        width: 1px;
        background-color: #f0f0f0;
    }
}

.feishu-section {
    width: 50%;
    padding: 32px;
    text-align: center;
    
    .feishu-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .feishu-tip {
        margin-top: 16px;
        color: #666;
    }
}

.form-section {
    width: 50%;
    padding: 32px;
    
    :deep(.ant-form-item:last-child) {
        margin-bottom: 0;
        margin-top: 24px;
    }
    
    .login-mode-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        
        .login-mode-title {
            font-size: 16px;
            font-weight: 500;
            color: #000;
        }
        
        .login-mode-switch {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: all 0.3s;
            color: #666;
            
            &:hover {
                background: #f5f5f5;
                color: var(--primary-color);
            }
        }
    }
}

.login-form-box-item {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    
    :deep(.ant-card-body) {
        padding: 0;
    }
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

</style>
