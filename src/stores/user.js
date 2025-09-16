import {defineStore} from "pinia";
import userAPI from "@/api/auth/user";
import { primaryColor }  from '@/assets/less/variable.module.less';
import {VxeUI } from "vxe-pc-ui";
import {cookie, orderBy} from "xe-utils";

export const  userCommonMessageStore = defineStore('userCommonStore', {
    state: () => {
        return {
            isUseModalLogin: false, // 是否是使用弹窗的方式登录， @todo 暂时思路 弹窗方式登录的时候当前的用户名应给予锁定状态
            loginInput: {}, // 登录的时候输入的用户信息
            loginSucceess: {}, // 登录成功后返回的用户信息
            globalMenuList: {}, // 用于全局的菜单列表 存储于local
            menuList: {}, // 当前用户的菜单列表 存储于session
            loginUserInfo: {}, // 当前登录的用户信息
            globalShareCheckBus: null,
            loginCurrentBus: null, // 当前登录的租户
            loginCurrentBusTheme:  primaryColor, // 当前登录的租户的主题
            current_user_menu: {
                current_menu: {}, // 当前的二级菜单
                current_parent_menu: {},// 当前的二级菜单对应的一级菜单
            }, 
            categoryProductList: [], // 用于存储当前的分类的产品列表
            
             
            formatCategoryProductList: {}, // 用于存储当前的分类的产品列表(格式化后的)
            menuGroupList: [], // 菜单组列表
            globalCheckedMenuGroup: '', // 全局的菜单组：云管平台 存储于local
            checkedMenuGroup: '', // 当前选中的菜单组 存储于session
            
        };
    },

    getters: {},
    actions: {
    /**
         * 获取当前登录用户的菜单权限
         * */
        getUserMenusList(){
            this.formatCategoryProductList = {};
            this.categoryProductList =  [];
            return new Promise((resolve, reject) => {
                let getDataMenuList = userAPI.getUserAllMenusList();
                getDataMenuList.then(res => {
                    this.categoryProductList = Object.values(orderBy(Object.values(res), [['sorting', 'asc']]));
                    let result = Object.values(orderBy(Object.values(res), [['sorting', 'asc']]));
                    for(let item  of result) {
                        let { submenu: firstSubmenu,  sid,  page_display } = item;
                        if(page_display) {
                            for(let subItem of firstSubmenu) {
                                if(subItem?.page_display) {
                                    if(!this.formatCategoryProductList[subItem.menu_group]) {
                                        this.formatCategoryProductList[subItem.menu_group] = {
                                            [sid]: {
                                                ...item,
                                                submenu: [subItem]
                                            },
                                           
                                        };
                                    } else {
                                        if (!this.formatCategoryProductList[subItem.menu_group][sid]) {
                                            this.formatCategoryProductList[subItem.menu_group][sid] = {
                                                ...item,
                                                submenu: [subItem]
                                            };
                                        } else{
                                            this.formatCategoryProductList[subItem.menu_group][sid]['submenu'].push(subItem);
                                        }
                                       
                                    }

                                }
                                
                            }

                        }
                       
                    }
                    this.menuList = res || {};
                    this.globalMenuList = res || {}; 
                    resolve(res);
                })
                
                    .catch(error => {
                        reject(error);
                    });
                /* userAPI.getUserMenus()
                    .then(res => {
                        this.menuList = res || {};
                        this.globalMenuList = res || {};
                        resolve(res);
                    })
                    .catch(error => {
                        reject(error);
                    }); */

            });
        },
        /**
         * 获取当前登录用户的菜单组
         * **/
        getUserMenuGroup() {
            return new Promise((resolve, reject) => {
                userAPI.getUserMenuGroup()
                    .then(res => {
                        this.menuGroupList = res || [];
                        this.globalCheckedMenuGroup = this.menuGroupList[0]?.name;
                        resolve(res);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
        /**
         * 获取当前登录用户信息
         * @returns 登录用户名、头像信息，所属的业态id、所属的业态列表
         **/
        getUserInfo() {
            return new Promise((resolve, reject) => {
                userAPI.getUserInfoApi()
                    .then(res => {
                        this.loginUserInfo = res;
                        this.username = res?.username;
                        resolve(res);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        /**
         * 用于系统的登录
         * */
        handleUserLogin(data) {
            return new Promise((resolve, reject) => {
                userAPI.userLogin(data)
                    .then(res => {
                        this.loginInput = data;
                        this.username = data?.username;
                        this.setLoginSuccess(res);
                        resolve(res);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        /**
         * 用于系统的退出
          **/
        handleUserLogout() {
            return new Promise((resolve, reject) => {
                VxeUI.loading.open({
                    text: '系统正在退出登录...'
                });
                userAPI.userLogout()
                    .then(res => {
                        if (res.status_code) {
                            this.handleClearUserMessage();
                        }
                        VxeUI.loading.close();
                        resolve(res);
                    })
                    .catch(error => {
                        VxeUI.loading.close();
                        reject(error);
                    });
            });
        },
        /**
         * 清空用户的信息
         * */
        handleClearUserMessage() {
            this.isUseModalLogin = false;
            this.username = null;
            this.loginInput = {};
            this.menuList = {};
            this.globalMenuList = {};
            this.loginSucceess = {};
            this.loginUserInfo = {};
            this.globalShareCheckBus = null,
            this.loginCurrentBus = null;
            this.loginCurrentBusTheme = primaryColor;
            this.current_user_menu = {};
            this.menuGroupList = [];
            this.globalCheckedMenuGroup = '';
            this.checkedMenuGroup = '';
            cookie.remove('tk_cmdb');
            localStorage.clear();
            sessionStorage.clear();
        },
        /**
         * 用于租户的切换主题
         * */
        handleToggleBusTheme(val) {
            this.loginCurrentBusTheme = val;
            document.documentElement.style.setProperty('--vxe-ui-font-primary-color', val);
            document.documentElement.style.setProperty('--vxe-ui-font-primary-lighten-color', `${val}bf`);
            document.documentElement.style.setProperty('--vxe-ui-font-primary-disabled-color', `${val}40`);
        },
        /** 设置当前的租户的面包屑导航 **/
        handleSetCurrentMenu(val) {
            this.current_user_menu = val;
        },
        /** 用于设置当前的租户
         * ***/
        handleSetCurrentBus(val) {
            this.loginCurrentBus = val;
            this.globalShareCheckBus = val;
            this.getUserMenusList();

        },
        /** 处理用户的弹窗登录 **/
        handleUseModalLogin(val) {
            this.isUseModalLogin = val;
        },
        /**
         * 处理用户登录成功返回的信息
         * **/
        setLoginSuccess(res) {
            this.loginSucceess = res;
            let { business_list } = res || {};
            let  businessArr = Object.keys(business_list);

            if (businessArr.length === 1) {
                let currentTheme = business_list[businessArr[0]][1];
                this.loginCurrentBus = businessArr[0];
                this.globalShareCheckBus = businessArr[0];
                window.name = 'unique-tab-id_' + businessArr[0];
                this.handleToggleBusTheme(currentTheme);
            }
        },

        setCheckedMenuGroup(val) {
            this.checkedMenuGroup = val;
            this.globalCheckedMenuGroup = val;
        }
    },
    persist: {
        enabled: true,
        strategies:[
            { // 自定义存储的 key，默认是 store.$id
                key: "CMDB_SYSTEM_LOGIN_USER_MESSAGE",
                // state 中的字段名，按组打包储存
                paths: ["loginSucceess", "username", "globalShareCheckBus", "globalMenuList", "loginUserInfo", "globalCheckedMenuGroup", "categoryProductList", "formatCategoryProductList"],
                storage: localStorage,
            },
            { // 登录的是同一用户(使用的是本地存储)，在切换角色的时使用的是sessionstorage
                key: "CMDB_SYSTEM_LOGIN_SESSION_USER_MESSAGE",
                paths: ["loginCurrentBusTheme", "current_user_menu","menuList", "loginCurrentBus", 'loginInput', 'isUseModalLogin',  "menuGroupList", 'checkedMenuGroup'],
                storage: sessionStorage,
            }
        ]
    }
});
