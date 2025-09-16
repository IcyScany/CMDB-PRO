

import viewVirtualteam from './view-virtualteam';
import decodeCopyPwd from './decode-copy-pwd.js';

const directiveList = {
    viewVirtualteam, // 点击查看接口组信息弹窗
    decodeCopyPwd, // 点击复制密码
};

const directives = {
    install: function (app) {
        for (let i in directiveList) {
            app.directive(i, directiveList[i]); // 注册全局指令
        }
    }
};

export default directives;
