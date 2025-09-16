export const middlewareRoutes = [
    {
        path: "/middleware",
        name: "middleware",
        meta: {
            title:'中间件',
        },
        redirect: '/middleware/rabbitmq/page',
        children: [
            { // RabbitMQ
                path: "rabbitmq/",
                name: "rabbitmq",
                meta: {
                    title:'RabbitMQ',
                    product_count: 'rabbitmq',
                    need_summary: true,
                },
                redirect: '/middleware/rabbitmq/overview',
                children: [
                    {
                        path: "page",
                        name: "rabbitmqOverview",
                        meta: {
                            title:'总览',
                            product_count: 'rabbitmq',
                        },
                        component: () => import("@/views/frontDesk/middleware/rabbitmq/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "rabbitmqPage",
                        meta: {
                            title:'RabbitMQ',
                            product_count: 'rabbitmq',
                        },
                        component: () => import("@/views/frontDesk/middleware/rabbitmq/index.vue"),
                    },
                ],
            },
            // Kafka
            {
                path: "kafka/",
                name: "kafka",
                meta: {
                    title:'Kafka',
                    product_count: 'kafka',
                    need_summary: true,
                },
                redirect: '/middleware/kafka/overview',
                children: [
                    {
                        path: "page",
                        name: "kafkaOverview",
                        meta: {
                            title:'总览',
                            product_count: 'kafka',
                        },
                        component: () => import("@/views/frontDesk/middleware/kafka/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "kafkaPage",
                        meta: {
                            title:'Kafka',
                            product_count: 'kafka',
                        },
                        component: () => import("@/views/frontDesk/middleware/kafka/index.vue"),
                    },
                ]
            },
            // ElasticSearch
            {
                path: "elasticsearch/",
                name: "ElasticSearch",
                meta: {
                    title:'ElasticSearch',
                    product_count: 'elasticsearch',
                    need_summary: true,
                },
                redirect: '/middleware/elasticsearch/overview',
                children: [
                    {
                        path: "page",
                        name: "ElasticSearchOverview",
                        meta: {
                            title:'总览',
                            product_count: 'elasticsearch',
                        },
                        component: () => import("@/views/frontDesk/middleware/elasticSearch/overview/index.vue"),
                    },
                    {
                        path: "page",
                        name: "ElasticSearchPage",
                        meta: {
                            title:'日志',
                            product_count: 'elasticsearch',
                        },
                        component: () => import("@/views/frontDesk/middleware/elasticSearch/index.vue"),
                    },
                ]
            }
        ],
    }
];
