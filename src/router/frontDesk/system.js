/** 系统菜单的页面路由**/
export const  systemRoutes = [
    {
        path: "/system", // 父路由定义了名为role的动态参数
        name: "system-menu",
        meta: {
            title:'系统管理',
        },
        props: true,
        // 有子路由的一定要重定向，第一个system/user/为上面的ptah，第二个为下面的children的某个path，不一定要是第一个。
        redirect: '/system/user/page',
        children: [
            {
                path: 'user',
                name: 'systemUserPage',
                meta: {
                    title:'用户管理',
                    need_summary: true,
                },
                redirect: '/system/user/page',
                children: [
                    {
                        path: 'page',
                        name: 'systemUserPage',
                        meta: {
                            title:'用户组清单',
                        },
                        component: () => import("@/views/frontDesk/system/UserManage/index.vue"),
                    },
                    {
                        path: 'page',
                        name: 'systemUserListPage',
                        meta: {
                            title:'用户清单',
                        },
                        component: () => import("@/views/frontDesk/system/UserManage/UserList.vue"),
                    },
                    {
                        path: 'group/permission/page',
                        name: 'systemUserGroupPermissionPage',
                        meta: {
                            title:'权限配置',
                        },
                        props: route => ({ sid: route.query.sid }),
                        component: () => import("@/views/frontDesk/system/UserGroupPermissionList.vue"),
                    },
                ],
            },
           
            {
                path: 'virtual/team/page',
                name: 'systemVirtualTeam',
                meta: {
                    title:'虚拟用户组管理',
                },
                component: () => import("@/views/frontDesk/system/VirtualTeam/index.vue"),
            },

            {
                path: 'open-api',
                name: 'systemOpenApiPage',
                meta: {
                    title:'OpenAPI',
                    need_summary: true,
                },
                redirect: '/system/open-api/user/page',
                children: [
                    {
                        path: 'page',
                        name: 'systemOpenApiPage',
                        meta: {
                            title:'用户管理',
                        },
                        component: () => import("@/views/frontDesk/system/openApi/user/index.vue"),
                    },
                    {
                        path: 'page',
                        name: 'systemOpenApiRoutePage',
                        meta: {
                            title:'路由管理',
                        },
                        component: () => import("@/views/frontDesk/system/openApi/route/index.vue"),
                    },
                    {
                        path: 'page',
                        name: 'systemOpenApiPermissionPage',
                        meta: {
                            title:'权限管理',
                        },
                        component: () => import("@/views/frontDesk/system/openApi/permission/index.vue"),
                    },
                ],
            },
        ],
    }
];
