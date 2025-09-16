export const dbRoutes = [
    {
        path: "/db",
        name: "db",
        meta: {
            title:'数据库',
        },
        redirect: '/db/rds/page',
        children: [
            { // RDS
                path: "rds/",
                name: "rds",
                meta: {
                    title:'RDS',
                    need_summary: true,
                },
                children: [
                    { // 总览
                        path: "page",
                        name: "rdsOverviewPage",
                        meta: {
                            title:'总览',
                            product_count: 'rds',
                        },
                        component: () => import("@/views/frontDesk/db/rds/overview/index.vue"),
                    },
                    { // RDS
                        path: "page",
                        name: "rdsPage",
                        meta: {
                            title:'RDS',
                        },
                        component: () => import("@/views/frontDesk/db/rds/table/index.vue"),
                    },
                ],
            },
            { // KVSTORE
                path: "kvstore/",
                name: "kvstore",
                meta: {
                    title:'KV存储',
                    need_summary: true,
                },
                children: [
                    { // 总览
                        path: "page",
                        name: "kvstoreOverviewPage",
                        meta: {
                            title:'总览',
                            product_count: 'kvstore',

                        },
                        component: () => import("@/views/frontDesk/db/kvstore/overview/index.vue"),
                    },
                    { // KVSTORE
                        path: "page",
                        name: "kvstorePage",
                        meta: {
                            title:'KV存储',
                        },
                        component: () => import("@/views/frontDesk/db/kvstore/table/index.vue"),
                    },
                ],
            },
            { // MongoDB
                path: "mongodb/",
                name: "mongodb",
                meta: {
                    title:'MongoDB',
                    need_summary: true,
                },
                children: [
                    { // 总览
                        path: "page",
                        name: "mongodbOverviewPage",
                        meta: {
                            title:'总览',
                            product_count: 'mongodb',

                        },
                        component: () => import("@/views/frontDesk/db/mongodb/overview/index.vue"),
                    },
                    { // MongoDB
                        path: "page",
                        name: "mongodbPage",
                        meta: {
                            title:'MongoDB',
                        },
                        component: () => import("@/views/frontDesk/db/mongodb/table/index.vue"),
                    },
                ],
            }
        ],
    }
];
