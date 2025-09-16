// 单位转换函数
export const formatStorageUnit = (value, threshold = 1024) => {
    if (value >= threshold) {
        return {
            value: (value / threshold).toFixed(2),
            unit: 'TB'
        };
    }
    return {
        value: value,
        unit: 'GB'
    };
};

// 格式化区域数据为图表所需格式
export const formatRegionData = (regionData, cloudRegionList) => {
    if (!regionData) return { data: [], totalCount: 0 };
    
    let totalCount = 0;
    const data = [];

    Object.entries(regionData).forEach(([region, zones]) => {
        Object.entries(zones).forEach(([zone, count]) => {
            totalCount += count;
            const regionName = cloudRegionList[region] || region + `-`;
            data.push({
                name: `${regionName}${zone.slice(zone.indexOf(region)-1).toUpperCase()}区`,
                real_value: zone,
                value: count,
                itemStyle: {
                    opacity: 0.7
                }
            });
        });
    });

    return { data, totalCount };
};

// 格式化区域数据为表格所需格式
export const formatRegionTableData = (regionData, cloudRegionList) => {
    if (!regionData) return [];
    
    const tableData = [];
    Object.entries(regionData).forEach(([region, zones]) => {
        Object.entries(zones).forEach(([zone, count]) => {
            const regionName = cloudRegionList[region] || region;
            tableData.push({
                region: regionName,
                zone: zone.slice(zone.indexOf(region)-1).toUpperCase(),
                count: count
            });
        });
    });
    
    return tableData.sort((a, b) => b.count - a.count);
};

// 计算区域数据总计
export const getRegionTotal = (regionData) => {
    if (!regionData) return 0;
    let total = 0;
    Object.values(regionData).forEach(zones => {
        Object.values(zones).forEach(count => {
            total += count;
        });
    });
    return total;
};

// 计算容量百分比
export const getCapacityPercent = (value, max) => {
    if (!max) return 0;
    return Math.round((value / max) * 100);
};

// 合并业态数据
export const mergeBusinessData = (dataList) => {
    if (!Array.isArray(dataList) || dataList.length === 0) return null;

    const mergedData = {
        server: {
            region: {},
            charge_type: {},
            physical_resources: {
                total_cpu: 0,
                total_ram: 0,
                total_disk: 0
            },
            expiring_soon_number: 0
        },
        mysql: {
            expiring_soon_number: 0,
            total_disk: 0,
            'cn-east-3': 0  
        },
        redis: {
            expiring_soon_number: 0,
            total_mem: 0,
            'cn-east-3': 0
        },
        mongoDB: {
            expiring_soon_number: 0,
            total_disk: 0,
            'cn-east-3': 0
        }
    };

    dataList.forEach(item => {
        if (item.server) {
            Object.entries(item.server.region || {}).forEach(([region, zones]) => {
                if (!mergedData.server.region[region]) {
                    mergedData.server.region[region] = {};
                }
                Object.entries(zones).forEach(([zone, count]) => {
                    mergedData.server.region[region][zone] = (mergedData.server.region[region][zone] || 0) + count;
                });
            });

            Object.entries(item.server.charge_type || {}).forEach(([type, count]) => {
                mergedData.server.charge_type[type] = (mergedData.server.charge_type[type] || 0) + count;
            });

            if (item.server.physical_resources) {
                mergedData.server.physical_resources.total_cpu += item.server.physical_resources.total_cpu || 0;
                mergedData.server.physical_resources.total_ram += item.server.physical_resources.total_ram || 0;
                mergedData.server.physical_resources.total_disk += item.server.physical_resources.total_disk || 0;
            }

            mergedData.server.expiring_soon_number += item.server.expiring_soon_number || 0;
        }

        if (item.mysql) {
            mergedData.mysql.expiring_soon_number += item.mysql.expiring_soon_number || 0;
            mergedData.mysql.total_disk += item.mysql.total_disk || 0;
            mergedData.mysql['cn-east-3'] += item.mysql['cn-east-3'] || 0;
        }
        if (item.redis) {
            mergedData.redis.expiring_soon_number += item.redis.expiring_soon_number || 0;
            mergedData.redis.total_mem += item.redis.total_mem || 0;
            mergedData.redis['cn-east-3'] += item.redis['cn-east-3'] || 0;
        }
        if (item.mongoDB) {
            mergedData.mongoDB.expiring_soon_number += item.mongoDB.expiring_soon_number || 0;
            mergedData.mongoDB.total_disk += item.mongoDB.total_disk || 0;
            mergedData.mongoDB['cn-east-3'] += item.mongoDB['cn-east-3'] || 0;
        }
    });

    return mergedData;
}; 