import {message} from "ant-design-vue";

/**
 * 用于提供成功、警告和错误等反馈信息。
 * 顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式。
 * @param
 * type: 表示弹窗的类型
 * closeCallback: 表示弹窗关闭的回调
 * duration: 延迟多少秒进行关闭
 * content: 提示显示的内容
 * arg: 其它的配置
 * **/

export default  function opsMessageTip({type='success', content, duration= 2, closeCallback, arg= {}}) {
    let defaultConfig = {
        content,
        duration,
        ...arg,
    };
    if (closeCallback) {
        defaultConfig.onClose = closeCallback();
    }
    message[type](defaultConfig);
};
