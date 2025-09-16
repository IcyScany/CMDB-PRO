import {Modal} from "ant-design-vue";
import {createVNode} from "vue";

/**
 * 通用的确认弹窗方法
 * @param {Object} options - 配置选项
 * @param {Function|Object} options.okCallBack - 确认回调函数或包含api和data的对象
 * @param {Function|Object} options.cancelCallBack - 取消回调函数或包含api和data的对象
 * @param {string} options.tip - 提示文本
 * @param {VNode[]} options.otherNode - 额外的节点内容
 * @param {string} options.okText - 确认按钮文本
 * @param {string} options.cancelText - 取消按钮文本
 * @param {string} options.title - 弹窗标题
 * @param {string} options.icon - 自定义图标类名
 * @param {string} options.width - 弹窗宽度
 * @param {Object} options.other_props - 其他 Modal.confirm 的配置项
 */
export default function modalConfirm({
    okCallBack,
    cancelCallBack,
    tip,
    otherNode = [],
    okText = '是',
    cancelText = '否',
    title = '',
    icon = 'vxe-icon-warning-triangle-fill',
    width = 420,
    other_props = {}
}) {
    // 处理回调函数
    const handleCallback = (callback) => {
        if (!callback) return;
        if (typeof callback === 'function') {
            return callback;
        }
        return () => callback.api(callback.data);
    };

    Modal.confirm({
        title,
        width,
        class: 'ops-confirm-modal',
        icon: createVNode('span', 
            { 
                class: `${icon} text-warning`, 
                style: { display: 'inline-block', marginRight: '8px' }
            },
            tip,
        ),
        content: createVNode('div', 
            { 
                class: 'ops-confirm-content text-warning'
            }, 
            [
                ...otherNode
            ]
        ),
        okText,
        cancelText,
        onOk: handleCallback(okCallBack),
        onCancel: handleCallback(cancelCallBack),
        ...other_props
    });
}

// 使用示例:
/*
modalConfirm({
    title: '确认操作',
    tip: '是否确认执行此操作？',
    okCallBack: () => {
        // 直接传入函数
        console.log('confirmed');
    },
    // 或者传入对象
    okCallBack: {
        api: someApi,
        data: someData
    },
    width: 500,
    okText: '确定',
    cancelText: '取消'
});
*/
