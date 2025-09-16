/*
 先请求接口解码，然后再复制
 */
import { VxeUI } from 'vxe-pc-ui';
import http from '@/utils/axios';
import {decodePasswd} from '@/composables/encryptField';

const decodeCopyPwd = {
    mounted(el, binding) {
        // 使用指令时，传入的值是url
        el.$value = binding.value;
        el.handler = () => {
            http.get(el.$value).then(res => {
                if(VxeUI?.clipboard?.copy(decodePasswd(res))) {
                    VxeUI.modal.message({
                        status: 'success',
                        content: '复制成功',
                        duration: 200
                    });
                }
            }).catch(() => {
                el.classList.add('text-error');
                el.classList.remove('text-success');
            });
        };
        // 绑定点击事件
        el.addEventListener("click", el.handler);
    },
    updated(el, binding) {
        el.$value = binding.value; // 更新绑定的值
    },
    unmounted(el) {
        el.removeEventListener("click", el.handler);
    },
};

export default decodeCopyPwd;
