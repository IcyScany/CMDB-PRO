/**
 *模块主要用于业务指标监控/预测
   校验'告警级别'的必填
   因为值是对象，所以默认的必填校验没有用永远可以通过
   所以需要另外写校验逻辑：至少选择一个告警级别
 **/
async function validateAlertLevel(rule, value) {
    if (value && !Object.keys(value).length) {
        return Promise.reject();
    }
    return Promise.resolve();
}

export {
    validateAlertLevel,
};
