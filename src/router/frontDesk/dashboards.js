/* 仪表盘菜单 */
export const dashboardsRoutes = [
    {
        path: "/dashboards", // 父路由定义了名为role的动态参数
        name: "dashboards",
        meta: {
            title:'仪表盘',
        },
        props: true,
        // 有子路由的一定要重定向，第一个system/user/为上面的ptah，第二个为下面的children的某个path，不一定要是第一个。
        redirect: '/dashboards/resource-display/page',
        children: [
            {
                path: 'resource-display/page',
                name: 'resourceDisplay',
                meta: {
                    title:'资源面板',
                },
                component: () => import("@/views/frontDesk/dashboards/ResourceDisplay/ResourceTab.vue"),
            },
            {
                path: 'bill-report/page',
                name: 'billReport',
                meta: {
                    title:'账单报告',   
                },
                component: () => import("@/views/frontDesk/dashboards/BillReport/index.vue"),
            },
            {
                path: 'real-time-alerts/page',
                name: 'realTimeAlerts',
                meta: {
                    title:'实时告警',
                },
                component: () => import("@/views/frontDesk/dashboards/RealTimeAlerts/index.vue"),
            },
        ],
    }
];
