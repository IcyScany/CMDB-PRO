/**
   填充接口获取到的edit_data到formState中
   会根据数据源配置，对值进行一些处理
 **/

const geneEditData = ({edit_title, edit_data, formState}) => {
    if (edit_title) {
        for (let i in edit_title) {
            let currTitle = edit_title[i];
            let { field, page_data_source: pageDataSource, edit_display } = currTitle;
            if (Object.prototype.hasOwnProperty.call(formState, field) || edit_display) {
                let flag = false; // 是否该字段没有值
                if (edit_data[field] === null || edit_data[field] === undefined) {
                    flag = true;
                }
                // 如果没有值，并且有数据源中配置的默认值，则使用默认值
                formState[field] = (flag && pageDataSource && 'default_value' in pageDataSource) ? pageDataSource['default_value']  : edit_data[field];
                // 对应<formItem>组件中渲染不同表单项
                if (pageDataSource) {
                    if (!pageDataSource.data_source) {
                        if (pageDataSource.form_type === 'json' && formState[field] && !flag) {
                            formState[field] = JSON.stringify(edit_data[field]);
                        }
                    }
                }
            }
        }
    }
};
export default geneEditData;
