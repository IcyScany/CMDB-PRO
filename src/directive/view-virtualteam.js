/*
 点击查看域用户信息的弹窗
 */
import {LAYER_ZINDEX_MIDDLE} from '@/config/globalOption';
import {Modal} from 'ant-design-vue';
import virtualteamInfo from "@/components/common/virtualteamInfo.vue";

const viewVirtualteam = {
    mounted(el, binding) {
        el.$teamId = binding.value;
        el.handler = () => {
            Modal.info({
                icon: null,
                closable: true,
                id: Date.now(),
                title: '',
                content: () => h(virtualteamInfo, {
                    teamId: el.$teamId
                }),
                okButtonProps: { style: {display: 'none'} },
                maskClosable: true,
                width: 1000,
                zIndex: LAYER_ZINDEX_MIDDLE,
                wrapClassName:"view-virtual-team-info-box"
            });
        };
        // 绑定点击事件
        el.addEventListener("click", el.handler);
    },
    updated(el, binding) {
        el.$teamId = binding.value; // 更新绑定的值
    },
    unmounted(el) {
        el.removeEventListener("click", el.handler);
    },
};

export default viewVirtualteam;
