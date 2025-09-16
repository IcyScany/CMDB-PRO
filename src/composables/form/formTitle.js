/*
 处理表单的title
 */
import {reactive, inject} from "vue";
import axios from '@/utils/axios';
import { validateJson } from '@/utils/json';
import { validateAlertLevel } from "@/composables/alertLevel";
import allApi from "@/api/common";
import { isValidMobilePhone } from "xe-utils";

export default function formTitle(title_data) {
    let initFormState = reactive({}); // 表单初始值
    let formState = reactive({}); // 表单值
    let rules = reactive({}); // 表单校验规则

    if (title_data === undefined) {
    // 如果未传入title_data，则通过inject获取,若未给予传入，给予默认值{}，防止控制台发生警告
        title_data = inject('title_data', {});
    }

    function generateFormTitle(titles) {
        if (titles && Array.isArray(titles)) {
            for (let i in titles) {
                let currTitle = titles[i];
                let {
                    field,  // 提交到数据库的字段
                    field_name,
                    page_data_source: pageDataSource, // 字段的数据源
                    edit_display: editDisplay, // 编辑时是否显示
                    edit_required: editRequired, // 编辑时字段是否必填
                } = currTitle;

                // 通过其配置的数据源公共数据获取
                if (pageDataSource && pageDataSource?.data_source) {
                    if (pageDataSource?.data_source === 'url' || pageDataSource?.data_source === 'app_url') {
                        if (!Object.prototype.hasOwnProperty.call(title_data.value, field)) {
                            if (pageDataSource?.url) {
                                axios
                                    .get(pageDataSource?.url)
                                    .then((res) => {
                                        title_data.value[field] = res;
                                    });
                            }

                        }
                    } else if (pageDataSource?.data_source === 'data') {
                        title_data.value[field] = pageDataSource?.data;
                    }
                }
                else if (pageDataSource?.data_origin) {
                    allApi[pageDataSource?.data_origin]().then(res => {
                        title_data.value[field] = res;

                    });

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
                            let hasDataSourceVal = ['url', 'data', 'app_url'];
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
                            if (pageDataSource.form_type === 'json') { // textarea中是json格式
                                val = null;
                                rule.push({ validator: validateJson, message: '请输入正确的json格式' });
                            }
                            if (pageDataSource.form_type === 'phone') { // 是手机号
                                val = null;
                                rule.push({ validator: isValidMobilePhone, message: '请输入正确的手机号' });
                            }
                            if (pageDataSource.form_type === 'checkbox') { // checkbox
                                val = [];
                            }
                            if (pageDataSource.form_type === 'select' && pageDataSource.multiple) { // 多选的select
                                val = [];
                            }
                            if (pageDataSource.form_type === 'input_tag') { // input标签
                                val = [];
                            }
                            if (pageDataSource.form_type === 'boole') { // 开关
                                val = pageDataSource.unchecked || 0;
                            }
                            if (pageDataSource.form_type === 'alert_level') { // 告警级别
                                val = {};
                                if (editRequired) { // 默认的必填判断不对，要另外写。默认的不能去掉，否则没有红色星号
                                    rule.push({validator: validateAlertLevel, message: '此项不能为空'});
                                }
                            }
                            if (pageDataSource.form_type === 'table') { // 表格模式，需要在使用的页面结合tableFormtitle.js、tableFormInit.js等一起使用
                                val = [];
                            }
                            if (pageDataSource.form_type === 'dynamic_form') { // 动态添加、减少表单
                                val = [];
                            }
                        }
                        if('default_value' in pageDataSource) {
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
        }
    }

    return {
        generateFormTitle,
        formState,
        initFormState,
        rules,
    };
}
