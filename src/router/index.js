import { createWebHistory, createRouter } from 'vue-router';
import { start, close } from '@/utils/nprogress';
import {cookie} from 'xe-utils';
import { systemRoutes, cloudManageRoutes, serverRoutes, networkRoutes, opsCenterRoutes, securityRoutes, dbRoutes, monitorRoutes, dashboardsRoutes, alertRoutes, dataLinkRoutes, middlewareRoutes, ciCdRoutes } from './frontDesk';
import { backendRoutes } from './backend';
import { staticRoutes }  from './staticRoutes';
import { useUserTabViewStore, userCommonMessageStore } from '@/stores';


 


/**
 * @meta
 * noPermission: 页面是否需权限进行登录  true表示页面无需登录也可访问，eg: 登录页、404页
 * 弹窗登录的条件：页面处在需权限且页面检测未登录，那么就是弹窗登录
 *
 * **/

let routes = [
    {
        path: "/", // 父路由定义了名为role的动态参数
        name: "role-base",
        meta: {
            title:'首页',
        },
        props: true,
        component: () => import("../layout/index.vue"),
        redirect: '/home',
        children: [ // 前台管理系统的布局
            {
                path: "/product", // 产品分类
                name: "productPage",
                meta: {
                    title:'产品分类',
                    layout: 'homeLayout'
                },
                component: () => import("../views/frontDesk/public/MenuGroupCheck.vue"),
            },
            {
                path: "/home", // 当访问 '/' 时，将显示 Home
                name: "homePage",
                meta: {
                    title:'首页',
                    layout: 'homeLayout'
                },
                component: () => import("../views/frontDesk/public/Home.vue"),
            },
          
            ...systemRoutes,
            ...cloudManageRoutes,
            ...serverRoutes,
            ...networkRoutes,
            ...opsCenterRoutes,
            ...securityRoutes,
            ...dbRoutes,
            ...monitorRoutes,
            ...dashboardsRoutes,
            ...alertRoutes,
            ...dataLinkRoutes,
            ...middlewareRoutes,
            ...ciCdRoutes,
        ]
    },
    ...backendRoutes,
    ...staticRoutes,

    {
        path: "/test/search",
        component: () => import("@/views/Test.vue"),
        meta: {
            noPermission: true,
        },
    },

    {
        path: "/auth/feishu/",
        component: () => import("@/components/login/FeiShuAuth.vue"),
        meta: {
            noPermission: true,
        },
    },

];


const router = createRouter({
    history: createWebHistory(`${import.meta.env.VITE_BASE_URL}`),
    routes: [...routes],
});




router.beforeEach(async (to, from, next) => {
    start();
    let userCommonStore = userCommonMessageStore();
    userCommonStore.handleUseModalLogin(false);
    let currentToken = cookie.get('tk_cmdb'); // 当前系统的token

    // 处理无需权限的页面
    if (to?.meta?.noPermission) {
        if (currentToken && (userCommonStore?.loginCurrentBus || userCommonStore?.globalShareCheckBus)) {
            if (to.name === 'Login') {
                return next({ path: from.fullPath });
            }
        }
        return next();
    }

    // 处理需要权限的页面
    try {
        if (currentToken) {
            if (!userCommonStore?.username) {
                await userCommonStore.getUserInfo();
            }

            if (userCommonStore?.loginCurrentBus || userCommonStore?.globalShareCheckBus) {
                let isBackEnd = to?.meta?.pageType === 'backend';
                let currentMenus = {
                    current_parent_menu: {},
                    current_menu: {},
                };
                
                if (!isBackEnd) {
                    if (!userCommonStore?.checkedMenuGroup || !userCommonStore?.globalCheckedMenuGroup) {
                        await userCommonStore.getUserMenuGroup();
                    }
                    
                    let apiMenu = userCommonStore?.menuList || userCommonStore?.globalMenuList || {};
                    if (!Object.keys(apiMenu).length && (userCommonStore?.checkedMenuGroup || userCommonStore?.globalCheckedMenuGroup)) {
                        await userCommonStore.getUserMenusList();
                       
                    }
                    let breadCrumbRouter = [{name:'homePage'}];
                    if (userCommonStore.menuList) { // 进行路由的拦截，获取进入的页面的二级菜单对应的信息以及其对应的二级菜单信息
                        for (let menu_sid in userCommonStore.menuList) {
                            let menuItem = userCommonStore.menuList[menu_sid];

                            if (menuItem?.submenu) {
                                for (let item of menuItem.submenu) {
                                    let { vue_url, page_data_source } = item;
                                    if(!to?.meta?.page_data_source) {
                                        to.meta.page_data_source = page_data_source;
                                    } 
                                    if ( to.fullPath.indexOf(vue_url) > -1) {
                                        breadCrumbRouter.push(from);
                                        breadCrumbRouter.push(to);
                                        currentMenus.current_parent_menu = menuItem;
                                        currentMenus.current_menu = item;
                                        break;
                                    }
                                }
                            }
                        }
                        /*  if (!Object.keys(currentMenus.current_menu).length) {
                            await commonApi.getSubMenuList().then(async res => {
                                let row = res.find(item => item.vue_url === to.fullPath);
                                if (row) {
                                    breadCrumbRouter.push(from);
                                    breadCrumbRouter.push(to);
                                    currentMenus.current_menu = {...row, sid: row?.id};
                                    currentMenus.current_all_second_menu = row;
                                    userCommonStore.handleSetCurrentMenu(currentMenus);
                                    return ;
                                }
                            });
                        } */
                        
                        userCommonStore.handleSetCurrentMenu(currentMenus);
                    }

                } else {
                    userCommonStore.handleSetCurrentMenu(currentMenus);
                }
                return next();
            }
        }

        // 处理未登录或无权限情况
        if (!currentToken && userCommonStore?.loginCurrentBus) {
            userCommonStore.handleUseModalLogin(true);
            return next();
        } else {
            return next({ name: 'Login', query: { next: to.fullPath } });
        }
    } catch (error) {
        if (error?.response?.status === 430) {
            userCommonStore.handleClearUserMessage();
            return next({ name: 'Login', query: { next: to.fullPath } });
        }
        next();
    }
});

router.beforeResolve((to) => {
    let userCommonStore = userCommonMessageStore();
    if (typeof document !== 'undefined') {
        let isBackEnd = to?.meta && to.meta?.pageType === 'backend'; // 后台管理
        let title = isBackEnd ? import.meta.env.VITE_BACKEND_DEFAULT_TITLE: import.meta.env.VITE_DEFAULT_TITLE;
        document.title = ` ${userCommonStore?.current_user_menu?.current_menu?.menu_name? userCommonStore?.current_user_menu?.current_menu?.menu_name : to.meta.title} -- ${title}  ` || import.meta.env.VITE_DEFAULT_TITLE;
    }
    return true;
});

router.afterEach((to) => {
    const tabViewStore = useUserTabViewStore();
    tabViewStore.updateUserTabs({
        path: to.fullPath,
        routeName: to.name,
        name: to.name,
        query: to.query,
        params: to.params,
        title: to.meta.title
    });


    close();
});
// 捕获路由导航错误
router.onError((error) => {
    console.error('Route navigation error:', error);
    // 可以在这里进行重定向或显示错误提示
    if (error.response?.status === 430) {
        router.push({ name: 'Login' });
    }
});



export default router;
