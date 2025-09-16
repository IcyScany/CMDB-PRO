import http from '@/utils/axios';

const vpcUrlPrefix = `network/vpc/`;
const vpcSubnetUrlPrefix = `network/vpc-subnet/`;


export default {
    /**  VPC子网 --Start***/
    // 获取VPC列表
    getVpcList(vpc_sid) {
        return http.get(`${vpcUrlPrefix}list${vpc_sid ? '/'+ vpc_sid : ''}`);
    },
    // VPC编辑
    putVpcEdit(vpc_sid, data) {
        return http.put(`${vpcUrlPrefix}edit/${vpc_sid}`, data);
    },
    /**  VPC子网 --Start***/


    /**  VPC子网列表 --Start***/
    // 读取某一个vpc子网列表数据
    getVpcSubnetList(vpc_subnet_sid) {
        return http.get(`${vpcSubnetUrlPrefix}list/${vpc_subnet_sid}`);
    },

    // VPC子网列表
    postVpcSubnetList(data) { //读取vpc的子网列表
        return http.post(`${vpcSubnetUrlPrefix}list`, data);
    },

    // VPC子网列表的编辑
    putVpcSubnetEdit(vpc_subnet_sid, data) {
        return http.put(`${vpcSubnetUrlPrefix}edit/${vpc_subnet_sid}`, data);
    },
    /**  VPC子网列表 --END***/


    // 获取总览
    getOverview() {
        return http.get(`network/show/overview`);
    },
};
