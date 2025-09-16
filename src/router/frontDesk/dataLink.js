export const dataLinkRoutes = [
    {
        path: "/data-linking",
        name: "dataLinking",
        meta: {
            title:'数据联动',
        },
        redirect: '/data-linking/feishu-to-jira/page',
        children: [
            { // 飞书到Jira
                path: "feishu-to-jira/",
                name: "feishuToJira",
                meta: {
                    title:'飞书到Jira',
                    need_summary: true,
                },
                children: [
                    { // 总览
                        path: "page",
                        name: "feishuToJiraOverviewPage",
                        meta: {
                            title:'总览',
                            product_count: 'feishuToJira',
                        },
                        component: () => import("@/views/frontDesk/dataLink/feishuToJira/overview/index.vue"),
                    },
                    { // 飞书到Jira
                        path: "page",
                        name: "feishuToJiraPage",
                        meta: {
                            title:'飞书到Jira',
                        },
                        component: () => import("@/views/frontDesk/dataLink/feishuToJira/index.vue"),
                    },
                ],
            },
            
            
        ],
    }
];
