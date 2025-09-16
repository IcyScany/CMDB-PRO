export const alertRoutes = [
    {
        path: "/alert",
        name: "alert",
        meta: {
            title:'告警',
        },
        redirect: '/alert/group/page',
        children: [
            {
                path: "group/page",
                name: "group",
                meta: {
                    title:'告警管理',
                },
                component: () => import("@/views/frontDesk/alert/group/index.vue"),
            },
           
        ],
    }
];