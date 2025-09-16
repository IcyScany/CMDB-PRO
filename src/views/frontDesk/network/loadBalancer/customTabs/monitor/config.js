import dayjs from 'dayjs';

export const rangePresets = [
    {
        label: '近30分钟',
        value: [dayjs().add(-30, 'm'), dayjs()],
    },
    {
        label: '近1小时',
        value: [dayjs().add(-1, 'h'), dayjs()],
    },
    {
        label: '近2小时',
        value: [dayjs().add(-2, 'h'), dayjs()],
    },
    {
        label: '近3小时',
        value: [dayjs().add(-2, 'h'), dayjs()],
    },
    {
        label: '近12小时',
        value: [dayjs().add(-12, 'h'), dayjs()],
    },
    {
        label: '近24小时',
        value: [dayjs().add(-24, 'h'), dayjs()],
    },
    {
        label: '近7天',
        value: [dayjs().add(-7, 'd'), dayjs()],
    },
    {
        label: '近30天',
        value: [dayjs().add(-30, 'd'), dayjs()],
    },
];

export const timeRangeOptions = [
    {
        value: '300',
        label: '5分钟',
    },
    {
        value: '1200',
        label: '20分钟',
    },
    {
        value: '3600',
        label: '1小时',
    },
    {
        value: '14400',
        label: '4小时',
    },
    {
        value: '86400',
        label: '24小时',
    },  
];

export const periodOptions = [
    {
        value: ['average','1'],
        label: '原始值',
    },
    {
        value: 'average',
        label: '平均值',
    },
    {
        value: 'sum',
        label: '求和',
    },
    {
        value: 'max',
        label: '最大值',
    },
    {
        value: 'min',
        label: '最小值',
    },
];

export const dimensionsOptions = [
    {
        value: 'lbaas_instance_id',
        label: '负载均衡器',
    },
    {
        value: 'lbaas_listener_id',
        label: '监听器',
    },
    {
        value: 'lbaas_pool_id',
        label: '后端服务器',
    },
];

export const loadBalancerMetrics =  {
    "dropped_connections": {
        "label": "丢弃连接数",
        "unit": "Count/s",
        "tooltip": "测量对象每秒丢弃连接的个数。"
    },
    "dropped_packets": {
        "label": "丢弃数据包",
        "unit": "Count/s",
        "tooltip": "测量对象每秒丢弃数据报文的个数。"
    },
    "dropped_traffic": {
        "label": "丢弃网络带宽",
        "unit": "bit/s",
        "tooltip": "测量对象丢弃网络带宽。"
    },
    "elb_http_2xx": {
        "label": "负载均衡响应状态码(2XX)",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回2XX响应状态码的个数。 负载均衡每秒返回2XX响应状态码的个数。"
    },
    "elb_http_3xx": {
        "label": "负载均衡响应状态码(3XX)",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回3XX响应状态码的个数。 负载均衡每秒返回3XX响应状态码的个数。"
    },
    "elb_http_400": {
        "label": "负载均衡响应状态码400",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回400响应状态码的个数。 负载均衡每秒返回400响应状态码的个数。"
    },
    "elb_http_404": {
        "label": "负载均衡响应状态码404",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回404响应状态码的个数。 负载均衡每秒返回404响应状态码的个数。"
    },
    "elb_http_408": {
        "label": "负载均衡响应状态码408",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回408响应状态码的个数。 负载均衡每秒返回408响应状态码的个数。"
    },
    "elb_http_499": {
        "label": "负载均衡响应状态码499",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回499响应状态码的个数。 负载均衡每秒返回499响应状态码的个数。"
    },
    "elb_http_4xx": {
        "label": "负载均衡响应状态码(4XX)",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回4XX响应状态码的个数。 负载均衡每秒返回4XX响应状态码的个数。"
    },
    "elb_http_502": {
        "label": "负载均衡响应状态码502",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回502响应状态码的个数。 负载均衡每秒返回502响应状态码的个数。"
    },
    "elb_http_503": {
        "label": "负载均衡响应状态码503",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回503响应状态码的个数。 负载均衡每秒返回503响应状态码的个数。"
    },
    "elb_http_504": {
        "label": "负载均衡响应状态码504",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回504响应状态码的个数。 负载均衡每秒返回504响应状态码的个数。"
    },
    "elb_http_5xx": {
        "label": "负载均衡响应状态码(5XX)",
        "unit": "Count/s",
        "tooltip": "负载均衡每秒返回5XX响应状态码的个数。 负载均衡每秒返回5XX响应状态码的个数。"
    },
    "ipgroup_blocked_packets": {
        "label": "黑白名单每秒阻断数据报文的个数",
        "unit": "Count/s",
        "tooltip": "每秒黑白名单阻断流入测量对象数据报文的个数。 每秒黑白名单阻断流入测量对象数据报文的个数。"
    },
    "ipgroup_blocked_traffic": {
        "label": "黑白名单阻断的网络带宽",
        "unit": "bit/s",
        "tooltip": "黑白名单阻断流入测量对象的网络带宽。 黑白名单阻断流入测量对象的网络带宽。"
    },
    "l4_con_usage": {
        "label": "4层并发连接使用率",
        "unit": "%",
        "tooltip": "4层的ELB实例并发连接数使用率。 4层的ELB实例并发连接数使用率。"
    },
    "l4_in_bps_usage": {
        "label": "4层入带宽使用率",
        "unit": "%",
        "tooltip": "4层的ELB实例入带宽使用率。 注意： 若入带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。 4层的ELB实例入带宽使用率。 注意： 若入带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。"
    },
    "l4_ncps_usage": {
        "label": "4层新建连接数使用率",
        "unit": "%",
        "tooltip": "4层的ELB实例新建连接数使用率。 4层的ELB实例新建连接数使用率。"
    },
    "l4_out_bps_usage": {
        "label": "4层出带宽使用率",
        "unit": "%",
        "tooltip": "4层的ELB实例出带宽使用率。 注意： 若出带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。 4层的ELB实例出带宽使用率。 注意： 若出带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。"
    },
    "l7_2xx_ratio": {
        "label": "七层2XX请求占比",
        "unit": "%",
        "tooltip": "七层2XX响应状态码的个数占比。 七层2XX响应状态码的个数占比。"
    },
    "l7_4xx_ratio": {
        "label": "七层4XX请求占比",
        "unit": "%",
        "tooltip": "七层4XX响应状态码的个数占比。 七层4XX响应状态码的个数占比。"
    },
    "l7_5xx_ratio": {
        "label": "七层5XX请求占比",
        "unit": "%",
        "tooltip": "七层5XX响应状态码的个数占比。 七层5XX响应状态码的个数占比。"
    },
    "l7_con_usage": {
        "label": "7层并发连接使用率",
        "unit": "%",
        "tooltip": "7层的ELB实例并发连接数使用率。 7层的ELB实例并发连接数使用率。"
    },
    "l7_in_bps_usage": {
        "label": "7层入带宽使用率",
        "unit": "%",
        "tooltip": "7层的ELB实例入带宽使用率。 注意： 若入带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。 7层的ELB实例入带宽使用率。 注意： 若入带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。"
    },
    "l7_ncps_usage": {
        "label": "7层新建连接数使用率",
        "unit": "%",
        "tooltip": "7层的ELB实例新建连接数使用率。 7层的ELB实例新建连接数使用率。"
    },
    "l7_out_bps_usage": {
        "label": "7层出带宽使用率",
        "unit": "%",
        "tooltip": "7层的ELB实例出带宽使用率。 注意： 若出带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。 7层的ELB实例出带宽使用率。 注意： 若出带宽使用率达到100%，说明已经超出ELB规格所提供的性能保障，您的业务可以继续使用更高带宽，但对于带宽超出的部分，ELB无法承诺服务可用性指标。"
    },
    "l7_qps_usage": {
        "label": "7层查询速率使用率",
        "unit": "%",
        "tooltip": "7层的ELB实例查询速率使用率。"
    },
    "l7_upstream_101": {
        "label": "7层后端响应状态码101",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层101响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回101响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回101响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_400": {
        "label": "7层后端响应状态码400",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层400响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回400响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回400响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_403": {
        "label": "7层后端响应状态码403",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层403响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回403响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回403响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_404": {
        "label": "7层后端响应状态码404",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层404响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回404响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回404响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_500": {
        "label": "7层后端响应状态码500",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层500响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回500响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回500响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_501": {
        "label": "7层后端响应状态码501",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层501响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回501响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回501状态响应码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_502": {
        "label": "7层后端响应状态码502",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层502响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回502响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回502状态响应码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_503": {
        "label": "7层后端响应状态码503",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层503响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回503响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回503响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_504": {
        "label": "7层后端响应状态码504",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层504响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回504响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回504状态响应码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "l7_upstream_other_status": {
        "label": "7层后端响应状态码（Others）",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层后端其他响应状态码的个数。 不包含：101、2XX、3XX、400、403、404、500、501、502、503、504。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回7层后端其他响应状态码的个数。 不包含：101、2XX、3XX、400、403、404、500、501、502、503、504。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回7层后端其他响应状态码的个数。 不包含：101、2XX、3XX、400、403、404、500、501、502、503、504。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m10_l7_http_other_status": {
        "label": "7层协议响应状态码(Others)",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层其他响应状态码的个数。 不包含：2XX、3XX、404、499、502。 支持协议：HTTP/HTTPS/QUIC 测量对象每秒返回7层其他响应状态码的个数。 不包含：2XX、3XX、404、499、502。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m11_l7_http_404": {
        "label": "7层协议响应状态码404",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层404响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m12_l7_http_499": {
        "label": "7层协议响应状态码499",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层499响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m13_l7_http_502": {
        "label": "7层协议响应状态码502",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层502响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m14_l7_rt": {
        "label": "7层协议RT平均值",
        "unit": "ms",
        "tooltip": "测量对象7层平均响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象收到客户端请求开始，到测量对象将所有响应返回给客户端为止。  说明： websocket场景下RT平均值可能会非常大，此时该指标无法作为时延指标参考。 测量对象7层平均响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象收到客户端请求开始，到测量对象将所有响应返回给客户端为止。  说明： websocket场景下RT平均值可能会非常大，此时该指标无法作为时延指标参考。"
    },
    "m15_l7_upstream_4xx": {
        "label": "7层后端响应状态码(4XX)",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层4XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回7层4XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回7层4XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m16_l7_upstream_5xx": {
        "label": "7层后端响应状态码(5XX)",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层5XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回7层5XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回7层5XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m17_l7_upstream_rt": {
        "label": "7层后端的RT平均值",
        "unit": "ms",
        "tooltip": "测量对象7层后端平均响应时间。 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。 支持协议：HTTP/HTTPS/QUIC  说明： websocket场景下RT平均值可能会非常大，此时该指标无法作为时延指标参考。 测量对象7层后端平均响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。  说明： websocket场景下RT平均值可能会非常大，此时该指标无法作为时延指标参考。 测量对象7层后端平均响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。  说明： websocket场景下RT平均值可能会非常大，此时该指标无法作为时延指标参考。"
    },
    "m18_l7_upstream_2xx": {
        "label": "7层后端响应状态码(2XX)",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层2XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回2XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回2XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m19_l7_upstream_3xx": {
        "label": "7层后端响应状态码(3XX)",
        "unit": "Count/s",
        "tooltip": "测量对象的后端服务器每秒返回7层3XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回3XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC 测量对象的后端服务器每秒返回3XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "m1_cps": {
        "label": "并发连接数",
        "unit": "Count",
        "tooltip": "在四层负载均衡器中，指从测量对象到后端服务器建立的所有TCP和UDP连接的个数。 在七层负载均衡器中，指从客户端到ELB建立的所有TCP连接的个数。 在四层负载均衡器中，指从测量对象到后端服务器建立的所有TCP和UDP连接的个数。 在七层负载均衡器中，指从客户端到ELB建立的所有TCP连接的个数。 在四层负载均衡器中，指从测量对象到后端服务器建立的所有TCP和UDP连接的数量。 在七层负载均衡器中，指从客户端到ELB建立的所有TCP连接的数量。"
    },
    "m1a_l7_upstream_rt_max": {
        "label": "7层后端的RT最大值",
        "unit": "ms",
        "tooltip": "测量对象7层后端最大响应时间。 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。 支持协议：HTTP/HTTPS/QUIC 测量对象7层后端最大响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。 测量对象7层后端最大响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。"
    },
    "m1b_l7_upstream_rt_min": {
        "label": "7层后端的RT最小值",
        "unit": "ms",
        "tooltip": "测量对象7层后端最小响应时间。 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。 支持协议：HTTP/HTTPS/QUIC 测量对象7层后端最小响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。 测量对象7层后端最小响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象将请求转发给后端服务器开始，到测量对象收到后端服务器返回响应为止。"
    },
    "m1c_l7_rt_max": {
        "label": "7层协议的RT最大值",
        "unit": "ms",
        "tooltip": "测量对象7层最大响应时间。 从测量对象收到客户端请求开始，到测量对象将所有响应返回给客户端为止。 支持协议：HTTP/HTTPS/QUIC 测量对象7层最大响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象收到客户端请求开始，到测量对象将所有响应返回给客户端为止。"
    },
    "m1d_l7_rt_min": {
        "label": "7层协议的RT最小值",
        "unit": "ms",
        "tooltip": "测量对象7层最小响应时间。 从测量对象收到客户端请求开始，到测量对象将所有响应返回给客户端为止。 支持协议：HTTP/HTTPS/QUIC 测量对象7层最小响应时间。 支持协议：HTTP/HTTPS/QUIC 从测量对象收到客户端请求开始，到测量对象将所有响应返回给客户端为止。"
    },
    "m1e_server_rps": {
        "label": "后端服务器每秒重置报文个数",
        "unit": "Count/s",
        "tooltip": "测量后端服务器每秒发送至客户端的重置（RST）报文个数。重置报文由后端服务器生成，然后由负载均衡器转发。 支持协议：TCP 测量后端服务器每秒发送至客户端的重置（RST）报文个数。重置报文由后端服务器生成，然后由负载均衡器转发。 支持的协议：TCP 测量后端服务器每秒发送至客户端的重置（RST）报文个数。重置报文由后端服务器生成，然后由负载均衡器转发。 支持协议：TCP"
    },
    "m1f_lvs_rps": {
        "label": "负载均衡器每秒重置报文个数",
        "unit": "Count/s",
        "tooltip": "测量负载均衡器每秒生成的重置（RST）报文个数。 支持协议：TCP 测量负载均衡器每秒生成的重置（RST）报文个数。 支持的协议：TCP 测量负载均衡器每秒生成的重置（RST）报文的个数。 支持协议：TCP"
    },
    "m21_client_rps": {
        "label": "客户端每秒重置报文个数",
        "unit": "Count/s",
        "tooltip": "测量客户端每秒发送至后端服务器的重置（RST）报文个数。重置报文由客户端生成，然后由负载均衡器转发。 支持协议：TCP 测量客户端每秒发送至后端服务器的重置（RST）报文个数。重置数据包由客户端生成，然后由负载均衡器转发。 支持的协议：TCP 测量客户端每秒发送至后端服务器的重置（RST）报文个数。重置报文由客户端生成，然后由负载均衡器转发。 支持协议：TCP"
    },
    "m22_in_bandwidth": {
        "label": "入网带宽",
        "unit": "bit/s",
        "tooltip": "测量对象入网带宽。 测量对象入网带宽。"
    },
    "m23_out_bandwidth": {
        "label": "出网带宽",
        "unit": "bit/s",
        "tooltip": "测量对象出网带宽。 测量对象出网带宽。"
    },
    "m24_l7_req_Bps": {
        "label": "7层请求带宽",
        "unit": "bit/s",
        "tooltip": "测量对象后端服务器的七层请求接收带宽。  说明： 当监听器开启HTTP/2时，该指标无法作为参考。"
    },
    "m25_l7_resp_Bps": {
        "label": "7层响应带宽",
        "unit": "bit/s",
        "tooltip": "测量对象后端服务器的七层响应发送带宽。  说明： 当监听器开启HTTP/2时，该指标无法作为参考。"
    },
    "m26_in_bandwidth_ipv6": {
        "label": "IPv6入网带宽",
        "unit": "bit/s",
        "tooltip": "流入测量对象的IPv6网络带宽。 流入测量对象的IPv6网络带宽。"
    },
    "m27_out_bandwidth_ipv6": {
        "label": "IPv6出网带宽",
        "unit": "bit/s",
        "tooltip": "流出测量对象的IPv6网络带宽。 流出测量对象的IPv6网络带宽。"
    },
    "m2_act_conn": {
        "label": "活跃连接数",
        "unit": "Count",
        "tooltip": "从测量对象到后端服务器建立的活跃TCP和UDP连接的个数。 Windows和Linux服务器都可以使用如下命令查看。 netstat -an 从测量对象到后端服务器建立的活跃TCP和UDP连接的数量。 Windows和Linux服务器都可以使用如下命令查看。 netstat -an 从测量对象到后端服务器建立的活跃TCP和UDP连接的个数。 Windows和Linux服务器都可以使用如下命令查看。 netstat -an"
    },
    "m3_inact_conn": {
        "label": "非活跃连接数",
        "unit": "Count",
        "tooltip": "从测量对象到后端服务器建立的非活跃TCP和UDP连接的个数。 Windows和Linux服务器都可以使用如下命令查看。 netstat -an 从测量对象到后端服务器建立的所有非活跃TCP和UDP连接的数量。 Windows和Linux服务器都可以使用如下命令查看。 netstat -an 从测量对象到后端服务器建立的非活跃TCP和UDP连接的个数。 Windows和Linux服务器都可以使用如下命令查看。 netstat -an"
    },
    "m4_ncps": {
        "label": "新建连接数",
        "unit": "Count/s",
        "tooltip": "从客户端到测量对象每秒新建立的连接数。 从客户端到测量对象每秒新建立的连接数。 从客户端到测量对象每秒新建立的连接数。"
    },
    "m5_in_pps": {
        "label": "流入数据包数",
        "unit": "Count/s",
        "tooltip": "测量对象每秒接收到数据包的个数。 测量对象每秒接收到数据包的个数。 测量对象每秒接收到数据包的个数。"
    },
    "m6_out_pps": {
        "label": "流出数据包数",
        "unit": "Count/s",
        "tooltip": "测量对象每秒发出数据包的个数。 测量对象每秒发出数据包的个数。 测量对象每秒发出数据包的个数。"
    },
    "m7_in_Bps": {
        "label": "网络流入速率",
        "unit": "Byte/s",
        "tooltip": "从外部访问测量对象的网络速率。 从外部访问测量对象的网络速率。 从外部访问测量对象的网络速率。"
    },
    "m8_out_Bps": {
        "label": "网络流出速率",
        "unit": "Byte/s",
        "tooltip": "测量对象访问外部的网络速率。 测量对象访问外部的网络速率。 测量对象访问外部的网络速率。"
    },
    "m9_abnormal_servers": {
        "label": "异常主机数",
        "unit": "Count",
        "tooltip": "测量对象中健康检查异常的后端服务器个数。 测量对象中健康检查异常的后端服务器个数。 测量对象中健康检查异常的后端服务器个数。"
    },
    "ma_normal_servers": {
        "label": "正常主机数",
        "unit": "Count",
        "tooltip": "测量对象中健康检查正常的后端服务器个数。 测量对象中健康检查正常的后端服务器个数。 测量对象中健康检查正常的后端服务器个数。"
    },
    "mb_l7_qps": {
        "label": "7层查询速率",
        "unit": "Count/s",
        "tooltip": "测量对象7层查询速率。 支持协议：HTTP/HTTPS/QUIC 测量对象7层查询速率。 支持协议：HTTP/HTTPS/QUIC 测量对象7层查询速率。 支持协议：HTTP/HTTPS/QUIC"
    },
    "mc_l7_http_2xx": {
        "label": "7层协议响应状态码（2XX）",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层2XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "md_l7_http_3xx": {
        "label": "7层协议响应状态码（3XX）",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层3XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "me_l7_http_4xx": {
        "label": "7层协议响应状态码（4XX）",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层4XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "mf_l7_http_5xx": {
        "label": "7层协议响应状态码（5XX）",
        "unit": "Count/s",
        "tooltip": "测量对象每秒返回7层5XX系列响应状态码的个数。 支持协议：HTTP/HTTPS/QUIC"
    },
    "mirror_in_packets": {
        "label": "入方向流量镜像的报文速率",
        "unit": "Count/s",
        "tooltip": "测量对象入方向流量镜像的报文速率。 测量对象入方向流量镜像的报文速率。"
    },
    "mirror_in_traffic": {
        "label": "入方向流量镜像的带宽",
        "unit": "bit/s",
        "tooltip": "测量对象入方向流量镜像的带宽。 测量对象入方向流量镜像的带宽。"
    },
    "mirror_out_packets": {
        "label": "出方向流量镜像的报文速率",
        "unit": "Count/s",
        "tooltip": "测量对象出方向流量镜像的报文速率。 测量对象出方向流量镜像的报文速率。"
    },
    "mirror_out_traffic": {
        "label": "出方向流量镜像的带宽",
        "unit": "bit/s",
        "tooltip": "测量对象出方向流量镜像的带宽。 测量对象出方向流量镜像的带宽。"
    },
};
