import HW_CC from "./policy/cc/hw/index.vue";
import ALI_CC from "./policy/cc/ali/index.vue";
import HW_ONE_WHITE_LIST from "./policy/oneWhiteList/hw/index.vue";
import ALI_ONE_WHITE_LIST from "./policy/oneWhiteList/ali/index.vue";
import HW_ONE_WHITE_BLACK_IP_LIST from "./policy/oneWhiteBlackIpList/hw/index.vue";
import ALI_ONE_WHITE_BLACK_IP_LIST from "./policy/oneWhiteBlackIpList/ali/index.vue";

import HW_CC_EDIT from "./policy/cc/hw/editForm.vue";
import ALI_CC_EDIT from "./policy/cc/ali/editForm.vue";
import HW_ONE_WHITE_LIST_EDIT from "./policy/oneWhiteList/hw/editForm.vue";
import ALI_ONE_WHITE_LIST_EDIT from "./policy/oneWhiteList/ali/editForm.vue";
import HW_ONE_WHITE_BLACK_IP_LIST_EDIT from "./policy/oneWhiteBlackIpList/hw/editForm.vue";
import ALI_ONE_WHITE_BLACK_IP_LIST_EDIT from "./policy/oneWhiteBlackIpList/ali/editForm.vue";

export const policyMap = {
    cc: {
        '华为云': { component: HW_CC, key: 'cc' },
        '阿里云': { component: ALI_CC, key: 'custom_acl' },
    },
    one_white_list: {
        '华为云': { component: HW_ONE_WHITE_LIST, key: 'ignore' },
        '阿里云': { component: ALI_ONE_WHITE_LIST, key: 'whitelist' },
    },
    one_white_black_ip_list: {
        '华为云': { component: HW_ONE_WHITE_BLACK_IP_LIST, key: 'whiteblackip' },
        '阿里云': { component: ALI_ONE_WHITE_BLACK_IP_LIST, key: 'ip_blacklist' },
    },
};

export const editMap = {
    cc: {
        '华为云': HW_CC_EDIT,
        '阿里云': ALI_CC_EDIT,
    },
    one_white_list: {
        '华为云': HW_ONE_WHITE_LIST_EDIT,
        '阿里云': ALI_ONE_WHITE_LIST_EDIT,
    },
    one_white_black_ip_list: {
        '华为云': HW_ONE_WHITE_BLACK_IP_LIST_EDIT,
        '阿里云': ALI_ONE_WHITE_BLACK_IP_LIST_EDIT,
    },
};
