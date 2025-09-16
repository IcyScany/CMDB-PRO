import config from './config';
import XEUtils from 'xe-utils';
import * as antdvIcons from '@ant-design/icons-vue';
import { lazyVxeUI, lazyVxeTable } from '@/utils/cmdbVxeTableConfig';


export default {
    install(app) {
        XEUtils.mixin({
            isValidMobilePhone: (phone) => { // 用于验证是否为手机号
                // 定义手机号正则表达式
                const phoneRegex = /^1[345789]\d{9}$/;
                return Promise.resolve(phoneRegex.test(phone));
            },
            isValidEmail: (email) => { // 用于验证是否为邮箱
                // 定义邮箱的正则表达式：防止匹配多个@ 符号
                const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return Promise.resolve(mailRegex.test(email));
            },
            getRemainingDays: (targetDateStr) => { // 获取剩余的天数
            // 获取当前时间
                const currentDate = new Date();
                // 将目标日期字符串转换为 Date 对象
                const targetDate = new Date(targetDateStr);
                // 计算时间差（毫秒）
                const timeDiff = targetDate - currentDate;
                // 将时间差转换为天数
                const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                return remainingDays;
            },
            isServerIp: (ip) => { // 简单的Ip格式，主要用于服务器端模式的上方的ip模糊搜索
                // 匹配IP格式的数字和点
                const ipPattern = /^[0-9.]+$/.test(ip);
                return Promise.resolve(ipPattern);
            },
            isInstanceId: (instanceId) => { // 主要用于服务器端模式的上方的实例Id的精确搜索：云类型：阿里云、华为云
               
                // 阿里云 ECS 实例 ID 格式规则：
                // 1. 前缀: i- (固定小写字母i+短划线)
                // 2. 功能区域标识: 2位小写字母(bp/uf/gc等)
                let aliCloudPattern = /^i-[a-z]{2}[a-z0-9]+$/;
                let rdsPattern = /^[a-zA-Z0-9]+-[a-zA-Z0-9]+$/;
                // 华为云实例Id 格式
                const huaweiCloudPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                return Promise.resolve(aliCloudPattern.test(instanceId) || rdsPattern.test(instanceId) || huaweiCloudPattern.test(instanceId));
            },

            bytesToSize: (bytes) => { // 将字节大小转换为更友好的显示格式
                if (bytes === 0) return '0B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return (bytes / Math.pow(k, i)).toPrecision(3) + '' + sizes[i];
            },

        });

        // 挂载全局对象
        app.config.globalProperties.$CONFIG = config;
        // 全局注册 xeUtils
        app.config.globalProperties.$utils = XEUtils;

        // 统一注册antdv图标
        for (const icon in antdvIcons) {
            app.component(icon, antdvIcons[icon]);
        }
        // 注册常用组件
        app.use(lazyVxeUI);
        app.use(lazyVxeTable);


    }
};
