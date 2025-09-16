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


export const kvstoreMetrics = {
    cpu_usage: {
        label: 'CPU利用率',
        unit: '%',
        tooltip: '该指标对于统计周期内的测量对象的CPU使用率进行多次采样，表示多次采样的最高值。'
    },
    cpu_avg_usage: {
        label: 'CPU平均使用率',
        unit: '%',
        tooltip: '该指标对于统计周期内的测量对象的CPU使用率进行多次采样，表示多次采样的平均值。'
    },
    memory_usage: {
        label: '内存利用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象的内存利用率。'
    },
    connected_clients: {
        label: '活跃的客户端数量',
        unit: '个',
        tooltip: '该指标用于统计已连接的客户端数量，包括系统监控、配置同步和业务相关的连接数，不包括来自从节点的连接。'
    },
    client_longest_out_list: {
        label: '客户端最长输出列表',
        unit: '个',
        tooltip: '该指标用于统计客户端所有现存连接的最长输出列表。'
    },
    client_biggest_in_buf: {
        label: '客户端最大输入缓冲',
        unit: 'byte',
        tooltip: '该指标用于统计客户端所有现存连接的最大输入数据长度。'
    },
    blocked_clients: {
        label: '阻塞的客户端数量',
        unit: '个',
        tooltip: '该指标用于被阻塞操作挂起的客户端的数量。阻塞操作如BLPOP，BRPOP，BRPOPLPUSH。'
    },
    used_memory: {
        label: '已用内存',
        unit: 'byte',
        tooltip: '该指标用于统计Redis已使用的内存字节数。'
    },
    used_memory_rss: {
        label: '已用内存RSS',
        unit: 'byte',
        tooltip: '该指标用于统计Redis已使用的RSS内存。即实际驻留"在内存中"的内存数，包含堆内存，但不包括换出的内存。'
    },
    used_memory_peak: {
        label: '已用内存峰值',
        unit: 'byte',
        tooltip: '该指标用于统计Redis服务器启动以来使用内存的峰值。'
    },
    used_memory_lua: {
        label: 'Lua已用内存',
        unit: 'byte',
        tooltip: '该指标用于统计Lua引擎已使用的内存字节。'
    },
    memory_frag_ratio: {
        label: '内存碎片率',
        unit: '',
        tooltip: '该指标用于统计当前的内存碎片率。其数值上等于used_memory_rss / used_memory。'
    },
    total_connections_received: {
        label: '新建连接数',
        unit: '个',
        tooltip: '该指标用于统计周期内新建的连接数，包括从节点，系统监控、配置同步和业务相关的连接数。'
    },
    total_commands_processed: {
        label: '处理的命令数',
        unit: '个',
        tooltip: '该指标用于统计周期内处理的命令数。'
    },
    instantaneous_ops: {
        label: '每秒并发操作数',
        unit: '次/秒',
        tooltip: '该指标用于统计每秒处理的命令数。'
    },
    total_net_input_bytes: {
        label: '网络收到字节数',
        unit: 'byte',
        tooltip: '该指标用于统计周期内收到的字节数。'
    },
    total_net_output_bytes: {
        label: '网络发送字节数',
        unit: 'byte',
        tooltip: '该指标用于统计周期内发送的字节数。'
    },
    instantaneous_input_kbps: {
        label: '网络瞬时输入流量',
        unit: 'KiB/s',
        tooltip: '该指标用于统计瞬时的输入流量。'
    },
    instantaneous_output_kbps: {
        label: '网络瞬时输出流量',
        unit: 'KiB/s',
        tooltip: '该指标用于统计瞬时的输出流量。'
    },
    rejected_connections: {
        label: '已拒绝的连接数',
        unit: '个',
        tooltip: '该指标用于统计周期内因为超过maxclients而拒绝的连接数量。'
    },
    expired_keys: {
        label: '已过期的键数量',
        unit: '个',
        tooltip: '该指标用于统计周期内因过期而被删除的键数量。'
    },
    evicted_keys: {
        label: '已逐出的键数量',
        unit: '个',
        tooltip: '该指标用于统计周期内因为内存不足被删除的键数量。'
    },
    pubsub_channels: {
        label: 'Pubsub通道个数',
        unit: '个',
        tooltip: '该指标用于统计Pub/Sub通道个数。'
    },
    pubsub_patterns: {
        label: 'Pubsub模式个数',
        unit: '个',
        tooltip: '该指标用于统计Pub/Sub模式个数。'
    },
    keyspace_hits_perc: {
        label: '缓存命中率',
        unit: '%',
        tooltip: '该指标用于统计Redis的缓存命中率，其命中率算法为：keyspace_hits/(keyspace_hits+keyspace_misses)'
    },
    command_max_delay: {
        label: '命令最大时延',
        unit: 'ms',
        tooltip: '统计节点的命令最大时延。'
    },
    is_slow_log_exist: {
        label: '是否存在慢日志',
        unit: '',
        tooltip: '统计节点是否存在慢日志。1：表示存在，0：表示不存在。该监控不统计由migrate、slaveof、config、bgsave、bgrewriteaof命令导致的慢查询。'
    },
    keys: {
        label: '缓存键总数',
        unit: '个',
        tooltip: '该指标用于统计Redis缓存中键总数。'
    },
    bandwidth_usage: {
        label: '带宽使用率',
        unit: '%',
        tooltip: '计算当前流量带宽与最大带宽限制的百分比。'
    },
    connections_usage: {
        label: '连接数使用率',
        unit: '%',
        tooltip: '该指标用于统计当前连接数与最大连接数限制的百分比。'
    },
    command_max_rt: {
        label: '最大时延',
        unit: 'μs',
        tooltip: '节点从接收命令到发出响应的时延最大值。'
    },
    command_avg_rt: {
        label: '平均时延',
        unit: 'μs',
        tooltip: '节点从接收命令到发出响应的时延平均值。'
    },
    sync_full: {
        label: '全量同步次数',
        unit: '次',
        tooltip: '该指标用于统计Redis服务器启动以来总共完成的全量同步次数。'
    },
    slow_log_counts: {
        label: '慢日志出现次数',
        unit: '次',
        tooltip: '该指标用于统计在一个统计周期内，慢日志出现的次数。'
    },
    used_storage: {
        label: '已使用的存储空间',
        unit: 'byte',
        tooltip: '已使用的存储空间。'
    },
    storage_usage: {
        label: '存储空间使用率',
        unit: '%',
        tooltip: '存储空间使用率。'
    },
    sadd: {
        label: 'SADD',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒sadd操作数。'
    },
    smembers: {
        label: 'SMEMBERS',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒smembers操作数。'
    },
    ms_repl_offset: {
        label: '主从数据同步差值',
        unit: 'Byte',
        tooltip: '该指标用于统计主从节点之间的数据同步差值。'
    },
    del: {
        label: 'DEL',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒del操作数。'
    },
    expire: {
        label: 'EXPIRE',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒expire操作数。'
    },
    get: {
        label: 'GET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒get操作数。'
    },
    hdel: {
        label: 'HDEL',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒hdel操作数。'
    },
    hget: {
        label: 'HGET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒hget操作数。'
    },
    hmget: {
        label: 'HMGET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒hmget操作数。'
    },
    hmset: {
        label: 'HMSET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒hmset操作数。'
    },
    hset: {
        label: 'HSET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒hset操作数。'
    },
    mget: {
        label: 'MGET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒mget操作数。'
    },
    mset: {
        label: 'MSET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒mset操作数。'
    },
    set: {
        label: 'SET',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒set操作数。'
    },
    rx_controlled: {
        label: '流控次数',
        unit: 'Count',
        tooltip: '该指标用于统计周期时间段内客户端请求被流控的次数。客户端发送请求时如果被流控，流控次数会加一。'
    },
    scan: {
        label: 'SCAN',
        unit: 'Count/s',
        tooltip: '每秒scan操作数。'
    },
    setex: {
        label: 'SETEX',
        unit: 'Count/s',
        tooltip: '每秒setex操作数。'
    },
    auth_errors: {
        label: '认证失败次数',
        unit: 'Count',
        tooltip: '统计实例的认证失败次数。'
    },
    expires: {
        label: '有过期时间的键总数',
        unit: '个',
        tooltip: '该指标用于统计Redis缓存中将会过期失效的键数目。'
    },
    used_memory_dataset: {
        label: '数据集使用内存',
        unit: 'byte',
        tooltip: '该指标用于统计Redis中数据集使用的内存。'
    },
    used_memory_dataset_perc: {
        label: '数据集使用内存百分比',
        unit: '%',
        tooltip: '该指标用于统计Redis中数据集使用的内存所占总内存百分比。'
    },
    net_in_throughput: {
        label: '网络输入吞吐量',
        unit: 'byte/s',
        tooltip: '该指标用于统计网口平均每秒的输入流量。'
    },
    net_out_throughput: {
        label: '网络输出吞吐量',
        unit: 'byte/s',
        tooltip: '该指标用于统计网口平均每秒的输出流量。'
    }
};
