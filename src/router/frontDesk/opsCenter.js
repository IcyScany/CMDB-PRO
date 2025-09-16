export const opsCenterRoutes = [
    {
        path: "/ops-center",
        name: "opsCenter",
        meta: {
            title:'运维中心',
        },
        redirect: '/ops-center/scheduled-tasks/page',
        children: [
            { // 定时任务
                path: "scheduled-tasks/",
                name: "scheduledTasksMain",
                meta: {
                    title:'定时任务',
                    need_summary: true,
                },

                children: [
                    { // 总览
                        path: "page",
                        name: "scheduledTasksOverview",
                        meta: {
                            title:'总览',
                            product_count: 'scheduled_tasks',
                        },
                        component: () => import("@/views/frontDesk/opsCenter/scheduledTasks/overview.vue"),
                    },
                    { // 定时任务列表
                        path: "page",
                        name: "scheduledTasksListPage",
                        meta: {
                            title:'定时任务',
                        },
                        component: () => import("@/views/frontDesk/opsCenter/scheduledTasks/index.vue"),
                    },
                ],
               
            },


        ],

    }
];
