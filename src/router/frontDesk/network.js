

export const networkRoutes = [
    {
        path: "/network",
        name: "network",
        meta: {
            title:'云网络',
        },
        children: [
            { // VPC
                path: "vpc/",
                meta: {
                    title:'VPC',
                    need_summary: true,
                },
                redirect: '/network/vpc/overview',
                children: [
                    { // 总览
                        path: "page",
                        name: "vpcOverviewPage123123123",
                        meta: {
                            title:'总览',   
                            product_count: 'vpc',
                        },
                        component: () => import("@/views/frontDesk/network/vpc/overview/index.vue"),
                    },
                    { // VPC
                        path: "page",
                        name: "vpcPage",
                        meta: {
                            title:'VPC',
                            product_count: 'vpc',
                        },
                        component: () => import("@/views/frontDesk/network/vpc/vpc/index.vue"),
                    },
                    { // VPC子网
                        path: "subnet/page",
                        name: "vpcSubnet",
                        meta: {
                            title:'VPC子网',
                            product_count: 'vpc_subnet',
                        },
                        component: () => import("@/views/frontDesk/network/vpc/vpcSubnet/index.vue"),
                    },
                    { // VPC路由
                        path: "route/page",
                        name: "vpcRoute",
                        meta: {
                            title:'VPC路由',
                            product_count: 'vpc_route',
                        },
                        component: () => import("@/views/frontDesk/network/vpc/vpcRoute/index.vue"),
                    },
                    { // VPC对等连接
                        path: "peering/page",
                        name: "vpcPeering",
                        meta: {
                            title:'VPC对等连接',
                            product_count: 'vpc_peering',
                        },
                        component: () => import("@/views/frontDesk/network/vpc/vpcPeering/index.vue"),
                    },
                ]
            },
            { // 路由链路图
                path: "vpc/route-link/page",
                name: "vpcRouteLink",
                meta: {
                    title:'路由链路图',
                },
                component: () => import("@/views/frontDesk/network/vpc/routeLink/index.vue"),
            },
            { // 云CDN
                path: "cloud_cdn/",
                name: "cloudCdn",
                meta: {
                    title:'云CDN',
                    product_count: 'cdn',
                    need_summary: true,
                },
                redirect: '/network/cloud_cdn/page',
                children: [
                    { // 总览
                        path: "page",
                        name: "cloudCdnOverview",
                        meta: {
                            title:'总览',
                            product_count: 'cdn',
                        },
                        component: () => import("@/views/frontDesk/network/cloudCdn/overview/index.vue"),
                    },
                    { // 云CDN
                        path: "page",
                        name: "cloudCdnPage",
                        meta: {
                            title:'云CDN',
                            product_count: 'cdn',
                        },
                        component: () => import("@/views/frontDesk/network/cloudCdn/index.vue"),
                    }
                ]
            },
            { // 外网域名
                path: "extranet_domain/",
                name: "extranetDomain",
                meta: {
                    title:'DNS',
                    product_count: 'dns',
                    need_summary: true,
                },
                redirect: '/network/extranet_domain/page',
                children: [
                    {
                        path: "page",
                        name: "extranetDomainOverview",
                        meta: {
                            title:'总览',
                            product_count: 'dns',
                        },
                        component: () => import("@/views/frontDesk/network/extranetDomain/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "extranetDomainPage",
                        meta: {
                            title:'DNS',
                            product_count: 'dns',
                        },
                        component: () => import("@/views/frontDesk/network/extranetDomain/index.vue"),
                    }
                ]
            },
            { // 网络硬件
                path: "network-hardware/",
                name: "networkHardware",
                meta: {
                    title:'网络硬件',
                    need_summary: true,
                    product_count: 'network_hardware',
                },
                redirect: '/network/network-hardware/overview',
                children: [
                    {
                        path: "page",
                        name: "networkHardwareOverview",
                        meta: {
                            title:'总览',
                            product_count: 'network_hardware',
                        },
                        component: () => import("@/views/frontDesk/network/hardware/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "networkHardwarePage",
                        meta: {
                            title:'网络硬件',
                            product_count: 'network_hardware',
                        },
                        component: () => import("@/views/frontDesk/network/hardware/index.vue"),
                    }
                ]
            },
            { // 云网络连接
                path: "connects/",
                meta: {
                    title:'云网络连接',
                    need_summary: true,
                },
                children: [
                    { // 总览
                        path: "virtual-interfaces/page",
                        name: "connectsOverview",
                        meta: {
                            title:'总览',
                            product_count: 'virtual_interface',
                        },
                        component: () => import("@/views/frontDesk/network/connects/overview/index.vue"),
                    },
                    { // 云专线
                        path: "virtual-interfaces/page",
                        name: "virtualInterfaces",
                        meta: {
                            title:'云专线',
                            product_count: 'virtual_interface',
                        },
                        component: () => import("@/views/frontDesk/network/connects/virtualInterfaces/index.vue"),
                    },
                    { // 云物理专线
                        path: "direct-connects/page",
                        name: "directConnectsPage",
                        meta: {
                            title:'云物理接入',
                        },
                        component: () => import("@/views/frontDesk/network/connects/directConnects/index.vue"),
                    },
                    { // 云虚拟网关
                        path: "virtual-gateway/page",
                        name: "virtualGatewayPage",
                        meta: {
                            title:'云虚拟网关',
                        },
                        component: () => import("@/views/frontDesk/network/connects/virtualGateway/index.vue"),
                    },
                    { // 企业路由器
                        path: "enterprise-router/page",
                        name: "enterpriseRouter",
                        meta: {
                            title:'企业路由器',
                            product_count: 'enterprise_router',
                        },
                        component: () => import("@/views/frontDesk/network/connects/enterpriseRouter/index.vue"),
                    },
                    { // NAT网关列表
                        path: "nat/page",
                        name: "nat",
                        meta: {
                            title:'NAT',
                            product_count: 'nat',
                        },
                        component: () => import("@/views/frontDesk/network/connects/nat/index.vue"),
                    },
                ]
            },
            { // 负载均衡
                path: "load-balancer/",
                name: "loadBalancer",
                meta: {
                    title:'负载均衡',
                    product_count: 'load_balancer',
                    need_summary: true,
                },
                redirect: '/network/load-balancer/overview',
                children: [
                    {
                        path: "page",
                        name: "loadBalancerOverview",
                        meta: {
                            title:'总览',
                            product_count: 'load_balancer',
                        },
                        component: () => import("@/views/frontDesk/network/loadBalancer/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "loadBalancerPage",
                        meta: {
                            title:'负载均衡',
                            product_count: 'load_balancer',
                        },
                        component: () => import("@/views/frontDesk/network/loadBalancer/index.vue"),
                    }
                ]
            }
        ],
    }
];
