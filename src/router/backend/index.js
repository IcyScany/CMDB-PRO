export const backendRoutes = [
    {
        path: "/backend/manage",
        name: "manageHome",
        meta: {
            title:'后台管理首页',
            pageType: 'backend',
        },
        component: () => import("@/layout/MenuLayout.vue"),
        redirect: "/backend/manage/menu/page",
        children: [ // 后台管理系统的布局
            {
                path: 'menu/page',
                name: 'menuManage',
                meta: {
                    title:'菜单管理',
                    pageType: 'backend',
                },
                component: () => import("@/views/backend/group/menu.vue"),
            },
            {
                path: 'business/page',
                name: 'businessManage',
                meta: {
                    title:'业态管理配置',
                    pageType: 'backend',
                },
                component: () => import("@/views/backend/business/index.vue"),
            },
            {
                path: 'advanced/authorization/page',
                name: 'advancedManageAuth',
                meta: {
                    title:'高级授权管理',
                    pageType: 'backend',
                },
                component: () => import("@/views/backend/business/advancedAuth.vue"),
            },
        ]
    },
];
