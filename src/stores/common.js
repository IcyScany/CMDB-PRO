import { defineStore } from 'pinia';

export const useCommonStore = defineStore('common',{
    state: () => ({ // state 是 store 的数据 (data)
        menus: [], // 侧边菜单栏
        currMenusId: [], // 当前选中菜单id
        currOpenMenu: 0, // 当前选中菜单的父菜单
        notifyNum: 0, // 头部消息提醒数量
        pathMenus: [], // 当前路径的菜单导航
        currMenus: '', // 当前路径的菜单名
        username: '', // 用户名
        userGroup: [], // 用户所在用户组
        avatar: '', // 头像图片路径
        sn: '', // 域账号
        condition: [], // 条件搜索的查询条件
        loginModalOpen: false, // 弹窗方式的登录
    }),
    getters: {}, // getters 是 store 的计算属性 (computed)
    actions: { // actions 则是方法 (methods)
    // mutation 现在可以成为 action 了，不再用 `state` 作为第一个参数，而是用 `this`
    // 设置当前页菜单导航
        setPath(val) {
            this.pathMenus = val;
            this.currMenus = val;
        },
        // 设置侧边菜单栏
        setMenus(val) {
            this.menus = val;
        },
        // 设置当前选中菜单
        setCurrMenus(val) {
            this.currMenusId = [val];
        },
        // 设置当前选中菜单的父菜单
        setCurrOpenMenu(val) {
            this.currOpenMenu = val;
        },
        // 设置头部消息提醒数量
        setNotify(val) {
            this.notifyNum = val;
        },
        // 设置头部用户名
        setUsername(val) {
            this.username = val;
        },
        // 设置用户组
        setUserGroup(val) {
            this.userGroup = val;
        },
        // 设置头部头像
        setAvatar(val) {
            this.avatar = val;
        },
        // 设置域账号
        setSn(val) {
            this.sn = val;
        },
        // 设置条件搜索的查询条件
        setCondition(val) {
            this.condition = val;
        },
        // 设置登录弹窗是否显示
        setLoginOpen(payload) {
            this.loginModalOpen = payload;
        },
    }
});
