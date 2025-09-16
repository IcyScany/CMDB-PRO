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


export const mongodbMetrics = {
    mongo001_command_ps: {
        label: 'command执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒command语句在节点上执行次数。'
    },
    mongo002_delete_ps: {
        label: 'delete语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒delete语句在节点上执行次数。'
    },
    mongo003_insert_ps: {
        label: 'insert语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒insert语句在节点上执行次数。'
    },
    mongo004_query_ps: {
        label: 'query语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒query语句在节点上执行次数。'
    },
    mongo005_update_ps: {
        label: 'update语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒update语句在节点上执行次数。'
    },
    mongo006_getmore_ps: {
        label: 'getmore语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒getmore语句在节点上执行次数。'
    },
    mongo007_chunk_num1: {
        label: '分片一的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片一的chunk个数。'
    },
    mongo007_chunk_num2: {
        label: '分片二的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片二的chunk个数。'
    },
    mongo007_chunk_num3: {
        label: '分片三的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片三的chunk个数。'
    },
    mongo007_chunk_num4: {
        label: '分片四的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片四的chunk个数。'
    },
    mongo007_chunk_num5: {
        label: '分片五的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片五的chunk个数。'
    },
    mongo007_chunk_num6: {
        label: '分片六的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片六的chunk个数。'
    },
    mongo007_chunk_num7: {
        label: '分片七的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片七的chunk个数。'
    },
    mongo007_chunk_num8: {
        label: '分片八的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片八的chunk个数。'
    },
    mongo007_chunk_num9: {
        label: '分片九的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片九的chunk个数。'
    },
    mongo007_chunk_num10: {
        label: '分片十的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片十的chunk个数。'
    },
    mongo007_chunk_num11: {
        label: '分片十一的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片十一的chunk个数。'
    },
    mongo007_chunk_num12: {
        label: '分片十二的chunk数',
        unit: 'Count',
        tooltip: '该指标用于统计分片十二的chunk个数。'
    },
    mongo008_connections: {
        label: '实例当前活动连接数',
        unit: 'Count',
        tooltip: '该指标用于统计试图连接到DDS实例的总连接数。'
    },
    mongo009_migFail_num: {
        label: '过去一天块迁移的失败次数',
        unit: 'Count',
        tooltip: '该指标用于统计过去一天中块迁移失败的次数。'
    },
    mongo007_connections: {
        label: '当前活动连接数',
        unit: 'Count',
        tooltip: '该指标用于统计试图连接到DDS实例节点的总连接数。'
    },
    mongo007_connections_usage: {
        label: '当前活动连接数百分比',
        unit: '%',
        tooltip: '该指标用于统计试图连接到实例节点的连接数占可用连接数百分比。'
    },
    mongo008_mem_resident: {
        label: '驻留内存',
        unit: 'MB',
        tooltip: '该指标用于统计当前驻留内存的大小。'
    },
    mongo009_mem_virtual: {
        label: '虚拟内存',
        unit: 'MB',
        tooltip: '该指标用于统计当前虚拟内存的大小。'
    },
    mongo010_regular_asserts_ps: {
        label: '常规断言频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计常规断言频率。'
    },
    mongo011_warning_asserts_ps: {
        label: '警告频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计警告频率。'
    },
    mongo012_msg_asserts_ps: {
        label: '消息断言频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计消息断言频率。'
    },
    mongo013_user_asserts_ps: {
        label: '用户断言频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计用户断言频率。'
    },
    mongo014_queues_total: {
        label: '等待锁的操作数',
        unit: 'Count',
        tooltip: '该指标用于统计当前等待锁的操作数。'
    },
    mongo015_queues_readers: {
        label: '等待读锁的操作数',
        unit: 'Count',
        tooltip: '该指标用于统计当前等待读锁的操作数。'
    },
    mongo016_queues_writers: {
        label: '等待写锁的操作数',
        unit: 'Count',
        tooltip: '该指标用于统计当前等待写锁的操作数。'
    },
    mongo017_page_faults: {
        label: '缺页错误数',
        unit: 'Count',
        tooltip: '该指标用于统计当前节点上的缺页错误数。'
    },
    mongo018_porfling_num: {
        label: '慢查询数',
        unit: 'Count',
        tooltip: '该指标用于统计当前节点上的前5分钟到当前时间点的慢查询总数。'
    },
    mongo019_cursors_open: {
        label: '当前维护游标数',
        unit: 'Count',
        tooltip: '该指标用于统计当前节点上的维护游标数。'
    },
    mongo020_cursors_timeOut: {
        label: '服务超时游标数',
        unit: 'Count',
        tooltip: '该指标用于统计当前节点上的服务超时游标数。'
    },
    mongo021_wt_cahe_usage: {
        label: '内存中数据量（WiredTiger引擎）',
        unit: 'MB',
        tooltip: '该指标用于统计当前内存中数据量（WiredTiger引擎）。'
    },
    mongo022_wt_cahe_dirty: {
        label: '内存中脏数据量（WiredTiger引擎）',
        unit: 'MB',
        tooltip: '该指标用于统计当前内存中脏数据量（WiredTiger引擎）。'
    },
    mongo023_wInto_wtCache: {
        label: '写入WiredTiger内存的频率',
        unit: 'byte/s',
        tooltip: '该指标用于统计当前内存中写入频率（WiredTiger引擎）。'
    },
    mongo024_wFrom_wtCache: {
        label: '从WiredTiger内存写入磁盘频率',
        unit: 'byte/s',
        tooltip: '该指标用于统计当前内存写入磁盘频率（WiredTiger引擎）。'
    },
    mongo025_repl_oplog_win: {
        label: '主节点的Oplog中可用时间',
        unit: 'h',
        tooltip: '该指标用于统计当前实例下的主节点的Oplog中可用时间。'
    },
    mongo025_repl_headroom: {
        label: '主备Oplog重叠时长',
        unit: 's',
        tooltip: '该指标用于统计实例下的主节点和Secondary节点之间Oplog重叠时长。'
    },
    mongo026_repl_lag: {
        label: '主备延时',
        unit: 's',
        tooltip: '该指标用于统计实例下的主节点和Secondary节点之间的复制延时。'
    },
    mongo027_repl_command_ps: {
        label: '备节点复制的command执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒Secondary节点复制的command语句执行次数。'
    },
    mongo028_repl_update_ps: {
        label: '备节点复制的update语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒Secondary节点复制的update语句执行次数。'
    },
    mongo029_repl_delete_ps: {
        label: '备节点复制的delete语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒Secondary节点复制的delete语句执行次数。'
    },
    mongo030_repl_insert_ps: {
        label: '备节点复制的insert语句执行频率',
        unit: 'Count/s',
        tooltip: '该指标用于统计平均每秒Secondary节点复制的insert语句执行次数。'
    },
    mongo031_cpu_usage: {
        label: 'CPU使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象的CPU利用率。'
    },
    mongo032_mem_usage: {
        label: '内存使用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象的内存利用率。'
    },
    mongo033_bytes_out: {
        label: '网络输出吞吐量',
        unit: 'byte/s',
        tooltip: '该指标用于统计平均每秒从测量对象的所有网络适配器输出的流量。'
    },
    mongo034_bytes_in: {
        label: '网络输入吞吐量',
        unit: 'byte/s',
        tooltip: '该指标用于统计平均每秒从测量对象的所有网络适配器输入的流量。'
    },
    mongo035_disk_usage: {
        label: '磁盘利用率',
        unit: '%',
        tooltip: '该指标用于统计测量对象的磁盘利用率。'
    },
    mongo036_iops: {
        label: 'IOPS',
        unit: 'Count/s',
        tooltip: '该指标用于统计当前实例节点，单位时间内系统处理的I/O请求数量（平均值）。'
    },
    mongo037_read_throughput: {
        label: '硬盘读吞吐量',
        unit: 'byte/s',
        tooltip: '硬盘平均每秒读字节数。'
    },
    mongo038_write_throughput: {
        label: '硬盘写吞吐量',
        unit: 'byte/s',
        tooltip: '硬盘平均每秒写字节数。'
    },
    mongo039_avg_disk_sec_per_read: {
        label: '硬盘读耗时',
        unit: 's',
        tooltip: '该指标用于统计某段时间平均每次读取硬盘所耗时间。'
    },
    mongo040_avg_disk_sec_per_write: {
        label: '硬盘写耗时',
        unit: 's',
        tooltip: '该指标用于统计某段时间平均每次写入硬盘所耗时间。'
    },
    mongo042_disk_total_size: {
        label: '磁盘总大小',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象的磁盘总大小。'
    },
    mongo043_disk_used_size: {
        label: '磁盘使用量',
        unit: 'GB',
        tooltip: '该指标用于统计测量对象的磁盘已使用总大小。'
    },
    mongo044_swap_usage: {
        label: 'SWAP利用率',
        unit: '%',
        tooltip: '交换内存SWAP使用率百分数。'
    },
    mongo050_top_total_time: {
        label: '集合花费的总时间',
        unit: 'ms',
        tooltip: 'Mongotop-total time指标，集合操作花费的时间总和。'
    },
    mongo051_top_read_time: {
        label: '集合读花费的总时间',
        unit: 'ms',
        tooltip: 'Mongotop-read time指标，集合读操作花费的时间总和。'
    },
    mongo052_top_write_time: {
        label: '集合写花费的总时间',
        unit: 'ms',
        tooltip: 'Mongotop-write time指标，集合写操作花费的时间总和。'
    },
    mongo053_wt_flushes_status: {
        label: '周期Checkpoint的触发次数',
        unit: 'times',
        tooltip: 'WiredTiger一个轮询间隔期间checkpoint的触发次数，记录周期内发生的次数。'
    },
    mongo054_wt_cache_used_percent: {
        label: 'Wiredtiger使用中的缓存百分比',
        unit: '%',
        tooltip: 'Wiredtiger使用中的缓存大小百分数。'
    },
    mongo055_wt_cache_dirty_percent: {
        label: 'Wiredtiger脏数据的缓存百分比',
        unit: '%',
        tooltip: 'Wiredtiger脏数据的缓存大小百分数。'
    },
    mongo070_rocks_active_memtable: {
        label: 'memtable中的数据大小',
        unit: 'Byte',
        tooltip: '采集当前活动memtable中的数据大小。'
    },
    mongo071_rocks_oplogcf_active_memtable: {
        label: 'oplogcf上memtable中的数据大小',
        unit: 'Byte',
        tooltip: '采集当前用于oplogcf上活动memtable中的数据大小。'
    },
    mongo072_rocks_all_memtable: {
        label: 'memtable和immutable-mem中的总数据大小',
        unit: 'Byte',
        tooltip: '采集当前memtable和immutable-mem中的总数据大小。'
    },
    mongo073_rocks_oplogcf_all_memtable: {
        label: 'oplogcf上memtable和immutable-mem中的总数据大小',
        unit: 'Byte',
        tooltip: '采集当前用于oplogcf上memtable和immutable-mem中的总数据大小。'
    },
    mongo074_rocks_snapshots: {
        label: '未释放的snapshot的数量',
        unit: 'Count',
        tooltip: '采集当前未释放的snapshot的数量。'
    },
    mongo075_rocks_oplogcf_snapshots: {
        label: 'oplogcf上未释放的snapshot的数量',
        unit: 'Count',
        tooltip: '采集当前oplogcf上未释放的snapshot的数量。'
    },
    mongo076_rocks_live_versions: {
        label: '活动的版本数量',
        unit: 'Count',
        tooltip: '采集当前活动的版本数量。'
    },
    mongo077_rocks_oplogcf_live_versions: {
        label: 'oplogcf上活动的版本数量',
        unit: 'Count',
        tooltip: '采集当前oplogcf上活动的版本数量。'
    },
    mongo078_rocks_block_cache: {
        label: '驻留在blockcache中的数据大小',
        unit: 'Byte',
        tooltip: '采集当前驻留在blockcache中的数据大小。'
    },
    mongo079_rocks_background_errors: {
        label: '后台累积错误数量',
        unit: 'Count',
        tooltip: '采集记录后台累积错误数量。'
    },
    mongo080_rocks_oplogcf_background_errors: {
        label: 'oplogcf上后台累积错误数量',
        unit: 'Count',
        tooltip: '采集记录oplogcf上后台累积错误数量。'
    },
    mongo081_rocks_conflict_bytes_usage: {
        label: '事务写写冲突处理缓冲区使用率',
        unit: '%',
        tooltip: '采集事务写中写冲突处理缓冲区使用率。'
    },
    mongo082_rocks_uncommitted_keys: {
        label: '未提交的key的数量',
        unit: 'Count',
        tooltip: '采集当前未提交的key的数量。'
    },
    mongo083_rocks_committed_keys: {
        label: '提交的key的数量',
        unit: 'Count',
        tooltip: '采集当前已提交的key的数量。'
    },
    mongo084_rocks_alive_txn: {
        label: '活跃事务链表的长度',
        unit: 'Count',
        tooltip: '采集记录活跃事务链表的长度。'
    },
    mongo085_rocks_read_queue: {
        label: '读队列的长度',
        unit: 'Count',
        tooltip: '采集当前读队列的长度。'
    },
    mongo086_rocks_commit_queue: {
        label: '提交队列的长度',
        unit: 'Count',
        tooltip: '采集当前提交队列的长度。'
    },
    mongo087_rocks_ct_write_out: {
        label: '已使用并发写事务数',
        unit: 'Count',
        tooltip: '采集当前已使用并发写事务数。'
    },
    mongo088_rocks_ct_write_available: {
        label: '剩余可用并发写事务数',
        unit: 'Count',
        tooltip: '采集当前剩余可用并发写事务数。'
    },
    mongo089_rocks_ct_read_out: {
        label: '已使用并发读事务数',
        unit: 'Count',
        tooltip: '采集当前已使用并发读事务数。'
    },
    mongo090_rocks_ct_read_available: {
        label: '剩余可用并发读事务数',
        unit: 'Count',
        tooltip: '采集当前剩余可用并发读事务数。'
    },
    mongo091_active_session_count: {
        label: '周期活跃会话数',
        unit: 'Count',
        tooltip: '该指标用于统计自上次刷新周期以来Mongo实例在内存中缓存的所有活跃本地会话的数目。'
    },
    mongo092_rx_errors: {
        label: '接收报文错误率',
        unit: '%',
        tooltip: '该指标用于统计监控周期内接收报文中错误报文数量与全部接收报文比值。'
    },
    mongo093_rx_dropped: {
        label: '接收报文丢包率',
        unit: '%',
        tooltip: '该指标用于监控周期内统计接收报文中丢失报文数量与全部接收报文比值。'
    },
    mongo094_tx_errors: {
        label: '发送报文错误率',
        unit: '%',
        tooltip: '该指标用于监控周期内统计发送报文中错误报文数量与全部发送报文比值。'
    },
    mongo095_tx_dropped: {
        label: '发送报文丢包率',
        unit: '%',
        tooltip: '该指标用于监控周期内统计发送报文中丢失报文数量与全部发送报文比值。'
    },
    mongo096_retrans_segs: {
        label: '重传包数目',
        unit: 'Counts',
        tooltip: '该指标用于监控周期内统计重传包数目。'
    },
    mongo097_retrans_rate: {
        label: '重传比例',
        unit: '%',
        tooltip: '该指标用于监控周期内统计重传包比例。'
    },
    mongo098_out_rsts_nums: {
        label: '发送RST数目',
        unit: 'Counts',
        tooltip: '该指标用于监控周期内统计RST数目。'
    },
    mongo099_read_time_average: {
        label: '读命令耗时平均值',
        unit: 'ms',
        tooltip: '该指标为单个节点的读命令耗时平均值。'
    },
    mongo100_read_time_p99: {
        label: '读命令p99耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的读命令p99耗时。'
    },
    mongo101_read_time_p999: {
        label: '读命令p999耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的读命令p999耗时。'
    },
    mongo102_write_time_average: {
        label: '写命令耗时平均值',
        unit: 'ms',
        tooltip: '该指标为单个节点的写命令耗时平均值。'
    },
    mongo103_write_time_p99: {
        label: '写命令p99耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的写命令p99耗时。'
    },
    mongo104_write_time_p999: {
        label: '写命令p999耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的写命令p999耗时。'
    },
    mongo105_command_time_average: {
        label: 'command耗时平均值',
        unit: 'ms',
        tooltip: '该指标为单个节点的节点command的耗时平均值。'
    },
    mongo106_command_time_p99: {
        label: 'command p99耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的command耗时p99耗时。'
    },
    mongo107_command_time_p999: {
        label: 'command p999耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的command耗时p999耗时。'
    },
    mongo108_txn_time_average: {
        label: '事务耗时平均值',
        unit: 'ms',
        tooltip: '该指标为单个节点的节点事务耗时平均值。'
    },
    mongo109_txn_time_p99: {
        label: '事务p99耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的事务p99耗时。'
    },
    mongo110_txn_time_p999: {
        label: '事务p999耗时',
        unit: 'ms',
        tooltip: '该指标为单个节点的事务p999耗时。'
    }
};
