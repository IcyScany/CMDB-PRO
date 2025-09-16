export const securityRoutes = [
    {
        path: "/security",
        name: "security",
        meta: {
            title:'安全',
        },
        redirect: '/security/pwd-management/page',
        children: [
            { // 凭据管理
                path: "pwd-management/",
                name: "pwdManagement",
                meta: {
                    title:'凭据管理',
                    product_count: 'pwd_management',
                    need_summary: true,
                },
                redirect: '/security/pwd-management/overview',
                children: [
                    {
                        path: "page",
                        name: "pwdManagementOverview",
                        meta: {
                            title:'总览',
                            product_count: 'pwd_management',
                        },
                        component: () => import("@/views/frontDesk/security/pwdManagement/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "pwdManagementPage",
                        meta: {
                            title:'凭据管理',
                            product_count: 'pwd_management',
                        },
                        component: () => import("@/views/frontDesk/security/pwdManagement/index.vue"),
                    },
                ],
            },
            { // 云WAF
                path: "cloud_waf/",
                name: "cloudWaf",
                meta: {
                    title:'云WAF',
                    product_count: 'waf',
                    need_summary: true,
                },
                redirect: '/security/cloud_waf/overview',
                children: [
                    {
                        path: "page",
                        name: "cloudWafOverview",
                        meta: {
                            title:'总览',
                            product_count: 'waf',
                        },
                        component: () => import("@/views/frontDesk/security/cloudWaf/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "cloudWafPage",
                        meta: {
                            title:'云WAF',
                        },
                        component: () => import("@/views/frontDesk/security/cloudWaf/index.vue"),
                    },
                ],
            },
            { // 安全组
                path: "security-group/",
                name: "securityGroup",
                meta: {
                    title:'安全组',
                    need_summary: true,
                },
                children: [
                    {
                        path: "page",
                        name: "securityGroupOverview",
                        meta: {
                            title:'总览',
                            product_count: 'security_group',

                        },
                        component: () => import("@/views/frontDesk/security/securityGroup/overview.vue"),
                    },
                    {
                        path: "page",
                        name: "securityGroupList",
                        meta: {
                            title:'安全组',
                        },
                        component: () => import("@/views/frontDesk/security/securityGroup/index.vue"),


                    }
                ]
            },
            { // 云防火墙
                path: "cloud_cfw/",
                name: "cloudCfw",
                meta: {
                    title:'云CFW',
                    product_count: 'cfw',
                    need_summary: true,
                },
                children: [
                    { // 总览
                        path: "page",
                        name: "cloudCfwOverviewPage",
                        meta: {
                            title:'总览',   
                            product_count: 'cfw',
                        },
                        component: () => import("@/views/frontDesk/security/cloudCfw/overview/index.vue"),
                    },
                    { // 云CFW  
                        path: "page",
                        name: "cloudCfwRulePage",
                        meta: {
                            title:'云CFW',
                        },
                        component: () => import("@/views/frontDesk/security/cloudCfw/index.vue"),
                    },
                ],
            },
        ],
    }
];
