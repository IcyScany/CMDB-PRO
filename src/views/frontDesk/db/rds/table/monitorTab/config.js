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


export const rdsMetrics =  {
    rds001_cpu_util: {
        label: 'CPU使用率', 
        unit: '%',
        tooltip: '该指标用于统计测量对象的CPU使用率，以百分比为单位。'
    },
    rds002_mem_util: {
        label: '内存使用率', 
        unit: '%',
        tooltip: '该指标用于统计测量对象的内存使用率，以百分比为单位。'
    },
    rds003_iops: {
        label: 'IOPS', 
        unit: '次/秒',
        tooltip: '该指标用于统计当前实例，单位时间内系统处理的I/O请求数量（平均值）。'
    },
    rds004_bytes_in: {
        label: '网络输入吞吐量', 
        unit: '字节/秒',
        tooltip: '该指标用于统计平均每秒从测量对象的所有网络适配器输入的流量，以字节/秒为单位。'
    },
    rds005_bytes_out: {
        label: '网络输出吞吐量', 
        unit: '字节/秒',
        tooltip: '该指标用于统计平均每秒从测量对象的所有网络适配器输出的流量，以字节/秒为单位。'
    },
    rds006_conn_count: {
        label: '数据库总连接数', 
        unit: '个',
        tooltip: '该指标用于统计试图连接到MySQL服务器的总连接数，以个为单位。'
    },
    rds007_conn_active_count: {
        label: '当前活跃连接数', 
        unit: '个',
        tooltip: '该指标用于统计非sleep状态的连接，以个为单位。'
    },
    rds008_qps: {
        label: 'QPS', 
        unit: '次/秒',
        tooltip: '该指标用于统计SQL语句查询次数，含存储过程，以次/秒为单位。'
    },
    rds009_tps: {
        label: 'TPS', 
        unit: '次/秒',
        tooltip: '该指标用于统计事务执行次数，含提交和回退的次数，以次/秒为单位。'
    },
    rds010_innodb_buf_usage: {
        label: '缓冲池利用率', 
        unit: '比率',
        tooltip: '该指标用于统计空闲的页与InnoDB缓存中缓冲池页面总数的比例，以比率为单位。'
    },
    rds011_innodb_buf_hit: {
        label: '缓冲池命中率', 
        unit: '比率',
        tooltip: '该指标用于统计读命中与读请求数比例，以比率为单位。'
    },
    rds012_innodb_buf_dirty: {
        label: '缓冲池脏块率', 
        unit: '比率',
        tooltip: '该指标用于统计InnoDB缓存中脏数据与InnoDB缓存中使用的页比例，以比率为单位。'
    },
    rds013_innodb_reads: {
        label: 'InnoDB读取吞吐量', 
        unit: '字节/秒',
        tooltip: '该指标用于统计Innodb平均每秒读字节数，以字节/秒为单位。'
    },
    rds014_innodb_writes: {
        label: 'InnoDB写入吞吐量', 
        unit: '字节/秒',
        tooltip: '该指标用于统计Innodb平均每秒写字节数，以字节/秒为单位。'
    },
    rds015_innodb_read_count: {
        label: 'InnoDB文件读取频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计Innodb平均每秒从文件中读的次数，以次/秒为单位。'
    },
    rds016_innodb_write_count: {
        label: 'InnoDB文件写入频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计Innodb平均每秒向文件中写的次数，以次/秒为单位。'
    },
    rds017_innodb_log_write_req_count: {
        label: 'InnoDB日志写请求频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒的日志写请求数，以次/秒为单位。'
    },
    rds018_innodb_log_write_count: {
        label: 'InnoDB日志物理写频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒向日志文件的物理写次数，以次/秒为单位。'
    },
    rds019_innodb_log_fsync_count: {
        label: 'InnoDB日志fsync()写频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒向日志文件完成的fsync()写数量，以次/秒为单位。'
    },
    rds020_temp_tbl_rate: {
        label: '临时表创建速率', 
        unit: '个/秒',
        tooltip: '该指标用于统计每秒在硬盘上创建的临时表数量，以个/秒为单位。'
    },
    rds021_myisam_buf_usage: {
        label: 'Key Buffer利用率', 
        unit: '比率',
        tooltip: '该指标用于统计MyISAM Key buffer的利用率，以比率为单位。'
    },
    rds022_myisam_buf_write_hit: {
        label: 'Key Buffer写命中率', 
        unit: '比率',
        tooltip: '该指标用于统计MyISAM Key buffer写命中率，以比率为单位。'
    },
    rds023_myisam_buf_read_hit: {
        label: 'Key Buffer读命中率', 
        unit: '比率',
        tooltip: '该指标用于统计MyISAM Key buffer读命中率，以比率为单位。'
    },
    rds024_myisam_disk_write_count: {
        label: 'MyISAM硬盘写入频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计向磁盘写入索引的次数，以次/秒为单位。'
    },
    rds025_myisam_disk_read_count: {
        label: 'MyISAM硬盘读取频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计从磁盘读取索引的次数，以次/秒为单位。'
    },
    rds026_myisam_buf_write_count: {
        label: 'MyISAM缓冲池写入频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计向缓冲池写入索引的请求次数，以次/秒为单位。'
    },
    rds027_myisam_buf_read_count: {
        label: 'MyISAM缓冲池读取频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计从缓冲池读取索引的请求次数，以次/秒为单位。'
    },
    rds028_comdml_del_count: {
        label: 'Delete语句执行频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒Delete语句执行次数，以次/秒为单位。'
    },
    rds029_comdml_ins_count: {
        label: 'Insert语句执行频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒Insert语句执行次数，以次/秒为单位。'
    },
    rds030_comdml_ins_sel_count: {
        label: 'Insert_Select语句执行频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒Insert_Select语句执行次数，以次/秒为单位。'
    },
    rds031_comdml_rep_count: {
        label: 'Replace语句执行频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒Replace语句执行次数，以次/秒为单位。'
    },
    rds032_comdml_rep_sel_count: {
        label: 'Replace_Selection语句执行频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒Replace_Selection语句执行次数，以次/秒为单位。'
    },
    rds033_comdml_sel_count: {
        label: 'Select语句执行频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒Select语句执行次数。'
    },
    rds034_comdml_upd_count: {
        label: 'Update语句执行频率', 
        unit: '次/秒',
        tooltip: '该指标用于统计平均每秒Update语句执行次数，以次/秒为单位。'
    },
    rds035_innodb_del_row_count: {
        label: '行删除速率', 
        unit: '行/秒',
        tooltip: '该指标用于统计平均每秒从InnoDB表删除的行数，以行/秒为单位。'
    },
    rds036_innodb_ins_row_count: {
        label: '行插入速率', 
        unit: '行/秒',
        tooltip: '该指标用于统计平均每秒向InnoDB表插入的行数，以行/秒为单位。'
    },
    rds037_innodb_read_row_count: {
        label: '行读取速率', 
        unit: '行/秒',
        tooltip: '该指标用于统计平均每秒从InnoDB表读取的行数，以行/秒为单位。'
    },
    rds038_innodb_upd_row_count: {
        label: '行更新速率', 
        unit: '行/秒',
        tooltip: '该指标用于统计平均每秒向InnoDB表更新的行数，以行/秒为单位。'
    },
    rds039_disk_util: {
        label: '磁盘利用率', 
        unit: '%',
        tooltip: '该指标用于统计测量对象的磁盘利用率，以百分比为单位。'
    },
    rds047_disk_total_size: {
        label: '磁盘总大小', 
        unit: 'GB',
        tooltip: '该指标用于统计测量对象的磁盘总大小。'
    },
    rds048_disk_used_size: {
        label: '磁盘使用量', 
        unit: 'GB',
        tooltip: '该指标用于统计测量对象的磁盘使用大小。'
    },
    rds049_disk_read_throughput: {
        label: '硬盘读吞吐量', 
        unit: 'MB/s',
        tooltip: '该指标用于统计每秒从硬盘读取的字节数。'
    },
    rds050_disk_write_throughput: {
        label: '硬盘写吞吐量', 
        unit: 'MB/s',
        tooltip: '该指标用于统计每秒写入硬盘的字节数。'
    },
    rds072_conn_usage: {
        label: '连接数使用率', 
        unit: '%',
        tooltip: '该指标用于统计当前已用的MySQL连接数占总连接数的百分比。'
    },
    rds173_replication_delay_avg: {
        label: '平均复制时延', 
        unit: '秒',
        tooltip: '该指标为备库或只读与主库的平均延迟，对应seconds_behind_master。取60秒时间段的平均值。'
    },
    rds073_replication_delay: {
        label: '实时复制时延', 
        unit: '秒',
        tooltip: '该指标为备库或只读与主库的实时延迟，对应seconds_behind_master。该值为实时值。'
    },
    rds074_slow_queries: {
        label: '慢日志个数统计', 
        unit: '个',
        tooltip: '该指标用于展示每分钟MySQL产生慢日志的数量。即SQL执行完毕后耗时超过"long_query_time"阈值，才会被统计到慢日志的个数。'
    },
    rds075_avg_disk_ms_per_read: {
        label: '硬盘读耗时', 
        unit: '毫秒',
        tooltip: '该指标用于统计某段时间平均每次读取磁盘所耗时间。'
    },
    rds076_avg_disk_ms_per_write: {
        label: '硬盘写耗时', 
        unit: '毫秒',
        tooltip: '该指标用于统计某段时间平均写入磁盘所耗时间。'
    },
    rds077_vma: {
        label: 'VMA数量', 
        unit: '个',
        tooltip: '监控RDS进程的虚拟内存区域大小，以个为单位。'
    },
    rds078_threads: {
        label: '进程中线程数量', 
        unit: '个',
        tooltip: '监控RDS进程中的线程数量，以个为单位。'
    },
    rds079_vm_hwm: {
        label: '进程的物理内存占用峰值', 
        unit: 'KB',
        tooltip: '监控RDS进程的物理内存占用峰值，以KB为单位。'
    },
    rds080_vm_peak: {
        label: '进程的虚拟内存占用峰值', 
        unit: 'KB',
        tooltip: '监控RDS进程的虚拟内存占用峰值，以KB为单位。'
    },
    rds081_vm_ioutils: {
        label: '磁盘I/O处于非空闲状态的时间%', 
        unit: '%',
        tooltip: '该参数表示磁盘设备的繁忙程度，表示有I/O（非空闲）的时间百分比。因磁盘有并行处理多个I/O请求的能力，即使该指标达到100%也不意味着设备饱和。'
    },
    rds082_semi_sync_tx_avg_wait_time: {
        label: '事务平均等待时间', 
        unit: '微秒',
        tooltip: '监控半同步复制模式下平均等待时间，以微秒为单位。'
    },
    sys_swap_usage: {
        label: 'swap利用率', 
        unit: '%',
        tooltip: '该指标用于统计测量对象的swap利用率，以百分比为单位。'
    },
    rds_innodb_lock_waits: {
        label: '等待行锁事务数', 
        unit: '个',
        tooltip: '该指标用于统计当前等待行锁的Innodb事务数，以个为单位。'
    },
    rds_bytes_recv_rate: {
        label: '数据库每秒接收字节', 
        unit: '字节/秒',
        tooltip: '该指标用于统计数据库每秒接收字节，以字节/秒为单位。'
    },
    rds_bytes_sent_rate: {
        label: '数据库每秒发送字节', 
        unit: '字节/秒',
        tooltip: '该指标用于统计数据库每秒发送字节，以字节/秒为单位。'
    },
    rds_innodb_pages_read_rate: {
        label: 'innodb平均每秒读取的数据量', 
        unit: '页/秒',
        tooltip: '该指标用于统计innodb平均每秒读取的数据量，以页/秒为单位。'
    },
    rds_innodb_pages_written_rate: {
        label: 'innodb平均每秒写入的数据量', 
        unit: '页/秒',
        tooltip: '该指标用于统计innodb平均每秒写入的数据量，以页/秒为单位。'
    },
    rds_innodb_os_log_written_rate: {
        label: '平均每秒写入redo log的大小', 
        unit: '字节/秒',
        tooltip: '该指标用于统计平均每秒写入redo log的大小，以字节/秒为单位。'
    },
    rds_innodb_buffer_pool_read_requests_rate: {
        label: 'innodb_buffer_pool每秒读请求次数', 
        unit: '次/秒',
        tooltip: '该指标用于统计innodb_buffer_pool每秒读请求次数，以次/秒为单位。'
    },
    rds_innodb_buffer_pool_write_requests_rate: {
        label: 'innodb_buffer_pool每秒写请求次数', 
        unit: '次/秒',
        tooltip: '该指标用于统计innodb_buffer_pool每秒写请求次数，以次/秒为单位。'
    },
    rds_innodb_buffer_pool_pages_flushed_rate: {
        label: 'innodb_buffer_pool每秒页面刷新数', 
        unit: '次/秒',
        tooltip: '该指标用于统计innodb_buffer_pool每秒页面刷新数，以次/秒为单位。'
    },
    rds_innodb_log_waits_rate: {
        label: '因log buffer不足导致等待flush到磁盘次数', 
        unit: '次/秒',
        tooltip: '该指标用于统计因log buffer不足导致等待flush到磁盘次数，以次/秒为单位。'
    },
    rds_created_tmp_tables_rate: {
        label: '每秒创建临时表数', 
        unit: '个/秒',
        tooltip: '该指标用于统计每秒创建临时表数，以个/秒为单位。'
    },
    rds_wait_thread_count: {
        label: '等待线程数', 
        unit: '个',
        tooltip: '该指标用于统计实例下全部等待线程数，以个为单位。'
    },
    rds_threadpool_waiting_threads: {
        label: '线程池中等待线程数', 
        unit: '个',
        tooltip: '该指标用于统计当前线程池中等待的线程数，以个为单位。'
    },
    rds_innodb_row_lock_time_avg: {
        label: '历史行锁平均等待时间', 
        unit: '毫秒',
        tooltip: '该指标用于统计innodb历史行锁平均等待时间。'
    },
    rds_innodb_row_lock_current_waits: {
        label: '当前行锁等待数', 
        unit: '个',
        tooltip: '该指标用于统计innodb当前行锁等待数，以个为单位。'
    },
    rds_mdl_lock_count: {
        label: 'MDL锁数量', 
        unit: '个',
        tooltip: '该指标用于统计MDL锁数量，以个为单位。'
    },
    rds_buffer_pool_wait_free: {
        label: '缓冲池空闲页等待次数', 
        unit: '次/秒',
        tooltip: '该指标用于统计InnoDB缓冲池空闲页等待次数。'
    },
    rds_conn_active_usage: {
        label: '活跃连接数使用率', 
        unit: '%',
        tooltip: '该指标统计活跃连接数占最大连接数的百分比。'
    },
    rds_innodb_log_waits_count: {
        label: '日志等待次数', 
        unit: '个',
        tooltip: '该指标用于统计日志等待次数，以个为单位。该值为累加值，出现一次累加1。'
    },
    rds_long_transaction: {
        label: '长事务指标', 
        unit: '秒',
        tooltip: '该指标统计长事务耗时数据，以秒为单位。相关操作命令前后分别有BEGIN以及COMMIT命令才算作一个完整的长事务。'
    }
};
