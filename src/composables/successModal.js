/*
 会自动关闭的成功弹窗提示
 默认3s后自动关闭
 */
import {Modal} from "ant-design-vue";
import {LAYER_ZINDEX_TOP} from '@/config/globalOption';

export default function successModal ({title = undefined, content = '', duration = 3000, callback = null}) {
    let successModal = Modal.success({
        title,
        content,
        zIndex: LAYER_ZINDEX_TOP,
    });
    setTimeout(() => {
        if (callback) {
            callback();
        }
        successModal.destroy();
    }, duration);
}
