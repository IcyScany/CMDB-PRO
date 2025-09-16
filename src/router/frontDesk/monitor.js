export const monitorRoutes = [
    {
        path: "/monitor",
        name: "monitor",
        meta: {
            title:'监控',
        },
        redirect: '/monitor/expire_remind/page',
        children: [
            { // 账号到期提醒
                path: "expire_remind/",
                name: "expire_remind",
                meta: {
                    title:'账号到期提醒',
                    need_summary: true,
                },
                redirect: '/monitor/expire_remind/overview',
                children: [
                    {
                        path: "page",
                        name: "expireRemindOverview",
                        meta: {
                            title:'总览',
                            product_count: 'expire_remind',
                        },
                        component: () => import("@/views/frontDesk/monitor/expireRemind/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "expireRemindPage",
                        meta: {
                            title:'账号到期提醒',
                        },
                        component: () => import("@/views/frontDesk/monitor/expireRemind/index.vue"),
                    },
                ],
            },
            { // 证书管理
                path: "certificate_management/",
                meta: {
                    title:'证书管理',
                    need_summary: true,
                },
                redirect: '/monitor/certificate_management/page', // 重定向到总览页面
                children: [
                    {
                        path: "page",
                        name: "certificateManagementOverview",
                        meta: {
                            title:'总览',
                            product_count: 'certificate_monitor',
                        },
                        component: () => import("@/views/frontDesk/monitor/certManage/overview/index.vue"),
                        beforeEnter: (to, from, next) => {
                            if (to?.query?.domain) {
                                next({ name: 'certificateManagementPage', query: { domain: to.query.domain } });
                            } else {
                                next();
                            }
                        }
                    },
                    {
                        path: "page",
                        name: "certificateManagementPage",
                        meta: {
                            title:'证书管理',
                        },
                        props: route => ({ domain: route.query.domain }),
                        component: () => import("@/views/frontDesk/monitor/certManage/index.vue"),
                    },
                ],
            },
            { // 日志监控
                path: "log_monitor/",
                name: "logMonitor",
                meta: {
                    title:'日志监控',
                    need_summary: true,
                },
                redirect: '/monitor/log_monitor/overview',
                children: [
                    // {
                    //     path: "page",
                    //     name: "logMonitorOverview",
                    //     meta: {
                    //         title:'总览',
                    //     },
                    //     component: () => import("@/views/frontDesk/monitor/logMonitor/overview/index.vue"),
                    // },
                    {
                        path: "page",
                        name: "logMonitorPage",
                        meta: {
                            title:'日志监控',
                            product_count: 'log_monitoring',
                        },
                        component: () => import("@/views/frontDesk/monitor/logMonitor/index.vue"),
                    },
                ],
            },
        ],
    }
];
