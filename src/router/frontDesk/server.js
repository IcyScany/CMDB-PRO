export const serverRoutes = [
    {
        path: "/server",
        name: "server",
        meta: {
            title:'云计算',
        },
        redirect: '/server/cloud-server/page',
        children: [
            {
                path: "cloud-server/",
                name: "cloudServer",
                meta: {
                    title:'云服务器',
                    need_summary: true,
                },
                children: [
                    { // 总览
                        path: "page",
                        name: "cloudServerOverviewPage",
                        meta: {
                            title:'总览',
                            product_count: 'server', // 云服务器的产品计数字段名

                        },
                        component: () => import("@/views/frontDesk/server/cloudServer/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "cloudServerPage",
                        meta: {
                            title:'云服务器',
                        },
                        component: () => import("@/views/frontDesk/server/cloudServer/table/index.vue"),
                    },
                ],
            },
            {
                path: "cloud_obs/",
                name: "cloudObs",
                meta: {
                    title:'OBS',
                    need_summary: true,
                },
                redirect: '/server/cloud_obs/page',
                children: [ 
                    {
                        path: "page",
                        name: "cloudObsOverview",
                        meta: {
                            title:'总览',
                            product_count: 'obs', // OBS的产品计数字段名
                        },
                        component: () => import("@/views/frontDesk/server/cloudObs/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "cloudObsPage",
                        meta: {
                            title:'OBS',
                        },
                        component: () => import("@/views/frontDesk/server/cloudObs/index.vue"),
                    },
                ],
            },

            {
                path: "physical-server/",
                name: "physicalServer",
                meta: {
                    title:'physicalServer',
                    need_summary: true,
                },
                redirect: '/server/physical-server/page',
                children: [ 
                    {
                        path: "page",
                        name: "physicalServerOverview",
                        meta: {
                            title:'总览',
                            product_count: 'physical_server',
                        },
                        component: () => import("@/views/frontDesk/server/physicalServer/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "physicalServerPage",
                        meta: {
                            title:'物理服务器',
                        },
                        component: () => import("@/views/frontDesk/server/physicalServer/index.vue"),
                    },
                ],
            },
        ],
    }
];
