/**
 * 用于管理系统的菜单Api
 * **/
import http from "@/utils/axios";


let menuUrlPrefix = `manage/menus/`;
let menuTitlePrefix = `manage/title/`;

let menuApi =  {
    /***
   * 获取系统菜单
     * @param id: =0 获取系统的一级菜单 >0 时获取该一级菜单下的二级菜单
     * @returns 接口返回系统的一级菜单，用于用户是否有权限进行使用该模块的内容
   ***/
    getSystemMenu({id=0}) {
        return http.get(`${menuUrlPrefix}list/${id}`);
    },

};

export {
    menuApi,
    menuUrlPrefix,
    menuTitlePrefix,
};

