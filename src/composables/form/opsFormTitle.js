/**
 处理表单的title
 **/

import axios from '@/utils/axios';
import { validateJson } from '@/utils/json';
import { validateAlertLevel } from "@/composables/alertLevel";
import XEUtils from "xe-utils";
import formOptionApi from "@/api/system/formOptionApi";


const opsFormTitle =  (title_data, {currentMenuID, layer}) => {
    let initFormState = reactive({}); // 表单初始值
    let formState = reactive({}); // 表单值
    let rules = reactive({}); // 表单校验规则
    let userCustomSelectItem = ref({}); // 用户自定义的下拉框选项


    const generateCmdbFormTitle = async (titles = []) => {
        try {
            if (currentMenuID.value) {
                userCustomSelectItem.value =  await formOptionApi.getFormOptionList(currentMenuID.value, layer);
            }
        } catch (e) {
            userCustomSelectItem.value = {};
        }

        for (let i in titles) {
            let currTitle = titles[i];
            const {
                sid,
                field,  // 提交到数据库的字段
                field_name, // 字段的中文名
                page_data_source: pageDataSource, // 字段的数据源
                edit_display: editDisplay, // 编辑时是否显示
                edit_required: editRequired, // 编辑时字段是否必填
            } = currTitle;

            // 通过其配置的数据源公共数据获取
            if (pageDataSource && pageDataSource?.data_source && editDisplay) {
                if (pageDataSource?.data_source === 'url') {
                    if (!Object.prototype.hasOwnProperty.call(title_data.value, field)) {
                        if (pageDataSource?.url) {
                            currTitle.get_data_api = axios.get(pageDataSource?.url);
                            await currTitle.get_data_api
                                .then(async (res) => {
                                    let data = res;
                                    if (pageDataSource?.received_key) { // 存在接收的key
                                        data = res[pageDataSource?.received_key];
                                    }
                                    title_data.value[field] = data;
                                });
                        }
                    }
                }
                else if (pageDataSource?.data_source === 'user_custom') {
                    currTitle.get_data_api = async () => await formOptionApi.getFormOptionList(currentMenuID.value, layer);
                    if (userCustomSelectItem.value && userCustomSelectItem.value[sid]) {
                        title_data.value[field] = userCustomSelectItem.value[sid];
                    }
                }
                else if (pageDataSource?.data_source === 'data') {
                    title_data.value[field] = pageDataSource?.data;
                }
            }


            // 显示在表单里的字段、校验规则
            if (editDisplay) {
                let val = ''; // 表单初始值
                let rule = []; // 表单校验规则
                if (editRequired) {
                    rule.push({ required: true, message: `${field_name}不能为空`});
                }
                // 对应<formItem>组件中渲染不同表单项
                if (pageDataSource) {
                    if (pageDataSource?.data_source) {
                        let hasDataSourceVal = ['url', 'data'];
                        if (hasDataSourceVal.indexOf(pageDataSource.data_source) > -1) {
                            if (pageDataSource.form_type === 'checkbox') { // checkbox
                                val = [];
                            } else if (pageDataSource.form_type !== 'radio') {
                                if (pageDataSource.multiple) { // 多选的select
                                    val = [];
                                }
                            }
                        }
                    } else {
                        let pageDataSourceFormType = pageDataSource.form_type;
                        if (pageDataSourceFormType) {
                            switch (pageDataSourceFormType) {
                                case 'json': // textarea中是json格式
                                    val = null;
                                    rule.push({ validator: validateJson, message: '请输入正确的json格式' });
                                    break;
                                case 'phone': // 是手机号
                                    val = null;
                                    rule.push({ validator: XEUtils.isValidMobilePhone, message: '请输入正确的手机号' });
                                    break;
                                case 'checkbox': // checkbox
                                    val = [];
                                    break;
                                case 'select': // 多选的select
                                    if (pageDataSource.multiple) {
                                        val = [];
                                    }
                                    break;
                                case 'input_tag': // input标签
                                    val = [];
                                    break;
                                case 'boole': // 开关
                                    val = pageDataSource.unchecked || 0;
                                    break;
                                case 'alert_level': // 告警级别
                                    val = {};
                                    if (editRequired) { // 默认的必填判断不对，要另外写。默认的不能去掉，否则没有红色星号
                                        rule.push({validator: validateAlertLevel, message: '此项不能为空'});
                                    }
                                    break;
                                case 'table': // 表格模式
                                    val = [];
                                    break;
                                case 'dynamic_form': // 动态添加、减少表单
                                    val = [];
                                    break;
                                default:
                                    val = null;
                                    break;

                            }
                        }
                    }
                    if(pageDataSource?.default_value) { // 配置的有默认值
                        val = pageDataSource.default_value;
                    }
                }
                formState[field] = val;
                initFormState[field] = val;

                if (rule.length) {
                    rules[field] = rule;
                }
            }
        }

    };

    return {
        generateCmdbFormTitle,
        formState,
        initFormState,
        rules,
        title_data,
        userCustomSelectItem,
    };
};
export default opsFormTitle;





