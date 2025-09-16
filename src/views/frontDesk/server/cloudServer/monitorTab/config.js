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
        value: [dayjs().add(-3, 'h'), dayjs()],
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
        value: '60',
        label: '1分钟',
    },
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

export const periodOptions = [ // 指标监控数据的聚合粒度
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
    {
        value: 'variance',
        label: '方差',
    },
];

// 华为云ECS基础监控指标配置
export const ecsMetrics = {
    // CPU相关监控指标
    cpu_usage: {
        label: 'CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前CPU使用率。'
    },
    cpu_usage_idle: {
        label: 'CPU空闲时间占比',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前CPU空闲时间占比。'
    },
    cpu_usage_user: {
        label: '用户空间CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前用户空间占用CPU使用率。'
    },
    cpu_usage_system: {
        label: '内核空间CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前内核空间占用CPU使用率。'
    },
    cpu_usage_other: {
        label: '其他CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象其他占用CPU使用率。'
    },
    cpu_usage_nice: {
        label: 'Nice进程CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前Nice进程CPU使用率。'
    },
    cpu_usage_iowait: {
        label: 'iowait状态占比',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前iowait状态占用CPU的比率。'
    },
    cpu_usage_irq: {
        label: 'CPU中断时间占比',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前CPU处理中断用时占用CPU时间的比率。'
    },
    cpu_usage_softirq: {
        label: 'CPU软中断时间占比',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前CPU处理软中断时间占用CPU时间的比率。'
    },
  
    // CPU负载相关监控指标
    load_average1: {
        label: '1分钟平均负载',
        unit: '',
        tooltip: '该指标用于统计测量对象过去1分钟的CPU平均负载。'
    },
    load_average5: {
        label: '5分钟平均负载',
        unit: '',
        tooltip: '该指标用于统计测量对象过去5分钟的CPU平均负载。'
    },
    load_average15: {
        label: '15分钟平均负载',
        unit: '',
        tooltip: '该指标用于统计测量对象过去15分钟的CPU平均负载。'
    },
  
    // 内存相关监控指标
    mem_available: {
        label: '可用内存',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象的可用内存。'
    },
    mem_usedPercent: {
        label: '内存使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象的内存使用率。'
    },
    mem_free: {
        label: '空闲内存量',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象的空闲内存量。'
    },
    mem_buffers: {
        label: 'Buffers占用量',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象的Buffers内存量。'
    },
    mem_cached: {
        label: 'Cache占用量',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象Cache内存量。'
    },
    total_open_files: {
        label: '文件句柄总数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象的所有进程使用的句柄总和。'
    },
  
    // 磁盘相关监控指标
    disk_free: {
        label: '磁盘剩余存储量',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象磁盘的剩余存储空间。'
    },
    disk_total: {
        label: '磁盘存储总量',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象磁盘存储总量。'
    },
    disk_used: {
        label: '磁盘已用存量',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象磁盘的已用存储空间。'
    },
    disk_usedPercent: {
        label: '磁盘使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象磁盘使用率，以百分比为单位。'
    },
  
    // 磁盘I/O相关监控指标
    disk_agt_read_bytes_rate: {
        label: '磁盘读速率',
        unit: 'byte/s',
        tooltip: '该指标用于统计每秒从测量对象读出数据量。'
    },
    disk_agt_read_requests_rate: {
        label: '磁盘读操作速率',
        unit: 'Request/s',
        tooltip: '该指标用于统计每秒从测量对象读取数据的请求次数。'
    },
    disk_agt_write_bytes_rate: {
        label: '磁盘写速率',
        unit: 'byte/s',
        tooltip: '该指标用于统计每秒写到测量对象的数据量。'
    },
    disk_agt_write_requests_rate: {
        label: '磁盘写操作速率',
        unit: 'Request/s',
        tooltip: '该指标用于统计每秒向测量对象写数据的请求次数。'
    },
    disk_readTime: {
        label: '读操作平均耗时',
        unit: 'ms/Count',
        tooltip: '该指标用于统计测量对象磁盘读操作平均耗时。'
    },
    disk_writeTime: {
        label: '写操作平均耗时',
        unit: 'ms/Count',
        tooltip: '该指标用于统计测量对象磁盘写操作平均耗时。'
    },
    disk_ioUtils: {
        label: '磁盘I/O使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象磁盘I/O使用率。'
    },
    disk_queue_length: {
        label: '平均队列长度',
        unit: 'count',
        tooltip: '该指标反映指定时间段内磁盘的繁忙程度，可用于评估磁盘I/O性能。'
    },
    disk_write_bytes_per_operation: {
        label: '平均写操作大小',
        unit: 'Byte/op',
        tooltip: '该指标用于统计指定时间段内，平均每个写I/O操作传输的字节数。'
    },
    disk_read_bytes_per_operation: {
        label: '平均读操作大小',
        unit: 'Byte/op',
        tooltip: '该指标用于统计指定时间段内，平均每个读I/O操作传输的字节数。'
    },
    disk_io_svctm: {
        label: '平均I/O服务时长',
        unit: 'ms/op',
        tooltip: '该指标用于统计指定时间段内，平均每个读或写I/O的操作时长。'
    },
    disk_device_used_percent: {
        label: '块设备使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象物理磁盘使用率，以百分比为单位。'
    },
  
    // 文件系统相关监控指标
    disk_fs_rwstate: {
        label: '文件系统读写状态',
        unit: '',
        tooltip: '该指标用于统计测量对象挂载文件系统的读写状态。'
    },
    disk_inodesTotal: {
        label: 'inode空间大小',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象当前磁盘的inode空间量。'
    },
    disk_inodesUsed: {
        label: 'inode已使用空间',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象当前磁盘已使用的inode空间量。'
    },
    disk_inodesUsedPercent: {
        label: 'inode已使用占比',
        unit: '%',
        tooltip: '该指标用于统计测量对象当前磁盘已使用的inode占比。'
    },
  
    // 网卡相关监控指标
    net_bitRecv: {
        label: '出网带宽',
        unit: 'bit/s',
        tooltip: '该指标用于统计测量对象网卡每秒发送的比特数。'
    },
    net_bitSent: {
        label: '入网带宽',
        unit: 'bit/s',
        tooltip: '该指标用于统计测量对象网卡每秒接收的比特数。'
    },
    net_packetRecv: {
        label: '网卡包接收速率',
        unit: 'Counts/s',
        tooltip: '该指标用于统计测量对象网卡每秒接收的数据包数。'
    },
    net_packetSent: {
        label: '网卡包发送速率',
        unit: 'Counts/s',
        tooltip: '该指标用于统计测量对象网卡每秒发送的数据包数。'
    },
    net_errin: {
        label: '接收误包率',
        unit: '%',
        tooltip: '该指标用于统计测量对象网卡每秒接收的错误数据包数量占所接收的数据包的比率。'
    },
    net_errout: {
        label: '发送误包率',
        unit: '%',
        tooltip: '该指标用于统计测量对象网卡每秒发送的错误数据包数量占所发送的数据包的比率。'
    },

    net_dropin: {
        label: '接收丢包率',
        unit: '%',
        tooltip: '该指标用于统计测量对象网卡每秒接收并已丢弃的数据包数量占所接收的数据包的比率。'
    },
    net_dropout: {
        label: '发送丢包率',
        unit: '%',
        tooltip: '该指标用于统计测量对象网卡每秒发送并已丢弃的数据包数量占所发送的数据包的比率。'
    },
    // NTP相关监控指标
    ntp_offset: {
        label: 'NTP偏移量',
        unit: 'ms',
        tooltip: '该指标用于统计测量对象当前NTP偏移量。'
    },
    // TCP相关监控指标
    net_tcp_total: {
        label: 'TCP TOTAL',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象所有状态的TCP连接数总和。'
    },
    net_tcp_established: {
        label: 'TCP ESTABLISHED',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于ESTABLISHED状态的TCP连接数量。'
    },
    net_tcp_sys_sent: {
        label: 'TCP SYS_SENT',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于请求连接状态的TCP连接数量。'
    },
    net_tcp_sys_recv: {
        label: 'TCP SYS_RECV',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象服务器端收到的请求连接的TCP数量。'
    },
    net_tcp_fin_wait1: {
        label: 'TCP FIN_WAIT1',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象客户端主动关闭且没有收到服务端ACK的TCP连接数量。'
    },
    net_tcp_fin_wait2: {
        label: 'TCP FIN_WAIT2',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于FIN_WAIT2状态的TCP连接数量。'
    },
    net_tcp_time_wait: {
        label: 'TCP TIME_WAIT',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于TIME_WAIT状态的TCP连接数量。'
    },
    net_tcp_close: {
        label: 'TCP CLOSE',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象关闭的或未打开的TCP连接数量。'
    },
    net_tcp_close_wait: {
        label: 'TCP CLOSE_WAIT',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于CLOSE_WAIT状态的TCP连接数量。'
    },
    net_tcp_last_ack: {
        label: 'TCP LAST_ACK',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象被动关闭等待ACK报文的TCP连接数量。'
    },
    net_tcp_listen: {
        label: 'TCP LISTEN',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于LISTEN状态的TCP连接数量。'
    },
    net_tcp_closing: {
        label: 'TCP CLOSING',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于服务端和客户端同时主动关闭状态的TCP连接数量。'
    },
    net_tcp_retrans: {
        label: 'TCP重传率',
        unit: '%',
        tooltip: '该指标用于统计测量对象重新发送的报文数与总发送的报文数之间的比值。'
    },
    // GPU相关监控指标
    gpu_status: {
        label: 'GPU健康状态',
        unit: '',
        tooltip: '该指标用于统计虚拟机上GPU健康状态，是一个综合指标。'
    },
    gpu_usage_encoder: {
        label: '编码使用率',
        unit: '%',
        tooltip: '该指标用于统计该GPU的编码能力使用率。'
    },
    gpu_usage_decoder: {
        label: '解码使用率',
        unit: '%',
        tooltip: '该指标用于统计该GPU的解码能力使用率。'
    },
    gpu_volatile_correctable: {
        label: '可纠正ECC错误数量',
        unit: 'count',
        tooltip: '该指标用于统计该GPU重置以来可纠正的ECC错误数量，每次重置后归0。'
    },
    gpu_volatile_uncorrectable: {
        label: '不可纠正ECC错误数量',
        unit: 'count',
        tooltip: '该指标用于统计该GPU重置以来不可纠正的ECC错误数量，每次重置后归0。'
    },
    gpu_aggregate_correctable: {
        label: '累计可纠正ECC错误数量',
        unit: 'count',
        tooltip: '该指标用于统计该GPU累计的可纠正ECC错误数量。'
    },
    gpu_aggregate_uncorrectable: {
        label: '累计不可纠正ECC错误数量',
        unit: 'count',
        tooltip: '该指标用于统计该GPU累计的不可纠正ECC错误数量。'
    },
    gpu_retired_page_single_bit: {
        label: 'retired page single bit错误数量',
        unit: 'count',
        tooltip: '该指标用于统计该GPU当前卡隔离的单比特页的数量。'
    },
    gpu_retired_page_double_bit: {
        label: 'retired page double bit错误数量',
        unit: 'count',
        tooltip: '该指标用于统计该GPU当前卡隔离的双比特页的数量。'
    },
    gpu_performance_state: {
        label: '性能状态',
        unit: '',
        tooltip: '该指标用于统计该GPU的性能状态。'
    },
    gpu_usage_mem: {
        label: '显存使用率',
        unit: '%',
        tooltip: '该指标用于统计该GPU的显存使用率。'
    },
    gpu_usage_gpu: {
        label: 'GPU使用率',
        unit: '%',
        tooltip: '该指标用于统计该GPU的算力使用率。'
    },
    gpu_free_mem: {
        label: 'GPU显存剩余量',
        unit: 'MB',
        tooltip: '该指标用于统计该GPU的显存剩余量。'
    },
    gpu_graphics_clocks: {
        label: 'GPU显卡时钟频率',
        unit: 'MHz',
        tooltip: '该指标用于统计该GPU的显卡（着色器）时钟频率。'
    },
    gpu_mem_clocks: {
        label: 'GPU内存时钟频率',
        unit: 'MHz',
        tooltip: '该指标用于统计该GPU的内存时钟频率。'
    },
    gpu_power_draw: {
        label: 'GPU功率',
        unit: 'W',
        tooltip: '该指标用于统计该GPU的功率。'
    },
    gpu_rx_throughput_pci: {
        label: 'GPU PCI入方向流量',
        unit: 'MB/s',
        tooltip: '该指标用于统计该GPU的PCI入方向流量。'
    },
    gpu_sm_clocks: {
        label: 'GPU流式处理器时钟频率',
        unit: 'MHz',
        tooltip: '该指标用于统计该GPU的流式处理器时钟频率。'
    },
    gpu_temperature: {
        label: 'GPU温度',
        unit: '℃',
        tooltip: '该指标用于统计该GPU的温度。'
    },
    gpu_tx_throughput_pci: {
        label: 'GPU PCI出方向流量',
        unit: 'MB/s',
        tooltip: '该指标用于统计该GPU的PCI出方向带宽。'
    },
    gpu_used_mem: {
        label: 'GPU显存使用量',
        unit: 'MB',
        tooltip: '该指标用于统计该GPU的显存使用量。'
    },
    gpu_video_clocks: {
        label: 'GPU视频时钟频率',
        unit: 'MHz',
        tooltip: '该指标用于统计该GPU的视频（包含编解码）时钟频率。'
    },
    // NPU相关监控指标
    npu_device_health: {
        label: 'NPU健康状况',
        unit: '',
        tooltip: '该指标用于统计虚拟机上NPU卡的健康状态，是一个综合指标。'
    },
    npu_util_rate_mem: {
        label: 'NPU显存使用率',
        unit: '%',
        tooltip: '该指标用于统计该NPU的显存使用率。'
    },
    npu_util_rate_ai_core: {
        label: 'NPU卡AI核心使用率',
        unit: '%',
        tooltip: '该指标用于统计该NPU的AI核心使用率。'
    },
    npu_util_rate_ai_cpu: {
        label: 'NPU卡AI CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计该NPU的AI CPU的使用率。'
    },
    npu_util_rate_ctrl_cpu: {
        label: 'NPU控制CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计该NPU的控制CPU的使用率。'
    },

    // 进程指标数
    proc_pHashId_cpu: {
        label: '进程CPU使用率',
        unit: '%',
        tooltip: '进程消耗的CPU百分比，pHashId是（进程名+进程ID）的md5值。'
    },
    proc_pHashId_mem: {
        label: '进程内存使用率',
        unit: '%',
        tooltip: '进程消耗的内存百分比，pHashId是（进程名+进程ID）的md5值。'
    },
    proc_pHashId_file: {
        label: '进程打开文件数',
        unit: 'Count',
        tooltip: '进程打开文件数，pHashId是（进程名+进程ID）的md5值。'
    },
    proc_running_count: {
        label: '运行中进程数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于运行状态的进程数。'
    },
    proc_idle_count: {
        label: '空闲进程数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于空闲状态的进程数。'
    },
    proc_zombie_count: {
        label: '僵死进程数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于僵死状态的进程数。'
    },
    proc_blocked_count: {
        label: '阻塞进程数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象被阻塞的进程数。'
    },
    proc_sleeping_count: {
        label: '睡眠进程数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象处于睡眠状态的进程数。'
    },
    proc_total_count: {
        label: '系统进程数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象的总进程数。'
    },
    proc_specified_count: {
        label: '指定进程数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象指定的进程数。'
    },
    specified_process_file: {
        label: '指定进程打开文件数',
        unit: 'Count',
        tooltip: '该指标用于统计测量对象指定进程打开的文件数。'
    }
};
