/*
 删除数据的确认流程
 */
import {Modal} from 'ant-design-vue';
import {createVNode, ref} from "vue";
import {LAYER_ZINDEX_TOP, LAYER_ZINDEX_MIDDLE} from '@/config/globalOption';
import {Input} from 'ant-design-vue';
import { warningColor, errorColor } from '@/assets/less/variable.module.less';

// 可以传入delAjax方法，提供单独的确认删除后请求接口的逻辑
export default function deleteProcess(delAjax, additionNode = []) {
    const validKey = 'DELETE'; // 用于验证的字符
    let val = ref(''); // 用户输入的字符
    let errorTip = ref(''); // 错误提示
    Modal.confirm({
        title: () => createVNode('span', {}, [
            createVNode('i', {
                class: 'vxe-icon-info-circle-fill',
                style: `color: ${errorColor}; float: left; margin-right: 10px; font-size: 1.5rem; line-height: 23px;`
            }),
            createVNode('span', {}, `请输入验证单词 `),
            createVNode('span', {style: `color: ${errorColor};`}, validKey),
        ]),
        zIndex: LAYER_ZINDEX_MIDDLE,
        icon: null,
        maskClosable: true,
        content: () => createVNode('div', {}, [
            createVNode(Input, {
                value: val.value?.trim(),
                'onUpdate:value': value => {
                    val.value = value?.trim();
                },
            }),
            createVNode('div', { style: `color: ${errorColor}` }, errorTip.value),
            ...additionNode,
        ]),
        onOk() {
            return new Promise((resolve, reject) => {
                if (val.value.trim() !== validKey) {
                    errorTip.value = '需要输入验证单词 DELETE';
                    reject('需要输入验证单词 DELETE');
                } else {
                    resolve();
                    Modal.confirm({
                        title: () => createVNode('span', {}, [
                            createVNode('i', {
                                class: 'vxe-icon-warning-circle-fill',
                                style: `color: ${warningColor}; font-size: 1.5rem; margin-right: 10px; float: left; line-height: 23px;`
                            }),
                            createVNode('span', {}, `确认要删除吗？ `),
                           
                        ]),
                        zIndex: LAYER_ZINDEX_MIDDLE + 1,
                        maskClosable: true,
                        icon: null,
                        onOk() {
                            if (delAjax) {
                                delAjax();
                            } else {
                                Modal.success({
                                    title: '删除成功',
                                    maskClosable: true,
                                    zIndex: LAYER_ZINDEX_TOP,
                                });
                            }
                        },
                        onCancel() {
                            Modal.error({
                                title: '已取消',
                                maskClosable: true,
                                zIndex: LAYER_ZINDEX_TOP,
                            });
                        },
                    });
                }
            });
        },
    });
}
