/**
 * 表格列（title）的绘制处理
  ** @param  order：服务端表格-初始默认的排序
  ** @param  customOrder：提供单独的初始排序方法。默认是使用title_field_search的第一个字段作为初始排序字段，进行asc排序
  ** @param  successCallBack: 对获取到公共数据进行自定义的数据结构处理
  **
  **/

import axios from '@/utils/axios';

const tableTitle = (customOrder) => {
    let columns = ref([]); // 返回显示的columns
    let title_data = ref({}); // 返回公共数据
    let title_field_search = ref([]); // 服务端表格-可以高级搜索的字段
    let order = ref(null); // 服务端表格-初始排序

    const generateTitle = async ({titles, tableType, successCallBack}) => {
        if (titles) {
            for (let item in titles) {
                let currTitle = titles[item];
                let {
                    field, // title在数据库中的名称
                    field_name, // title的中文名
                    page_data_source: pageDataSource,  // 页面title自定义的数据源
                    search_display: canSearchDisplay,  // title是否搜索显示
                    page_display: canPageDisplay, // title是否显示
                    page_sort: canPageSort, // 是否进行排序，主要用于服务器端模式 &todo(情形1： 有无客户端模式，无需排序)
                } = currTitle;
                
                // 通过自定义的页面数据源获取其公共的数据获取相关
                if (pageDataSource) {
                    if (pageDataSource?.data_source === 'url' || pageDataSource?.data_source === 'titleUrl') {
                        if (!Object.prototype.hasOwnProperty.call(title_data.value, field)) {
                            axios
                                .get(pageDataSource.url)
                                .then((res) => {
                                    title_data.value[field] = res;
                                    if (successCallBack){
                                        successCallBack(field, res);
                                    }
                                });
                        }
                    } else if (pageDataSource?.data_source === 'data') {
                        title_data.value[field] = pageDataSource?.data;
                    }
                }

                // 条件搜索中高级搜索可以搜索的字段
                if (canSearchDisplay) {
                    title_field_search.value.push(currTitle);
                }

                // 列的显示处理
                if(canPageDisplay) {
                    // 服务端表格-页面可以排序的字段都可以排序；客户端-默认都可以排序
                    let col = {
                        field: field,
                        title: field_name,
                        showOverflow: true,
                        sortable: !(tableType === 'server' && !canPageSort),
                        oriTitle: currTitle,
                        minWidth: '120',
                        type: 'html',
                    };
                    if (pageDataSource?.column) {
                        if (pageDataSource?.column?.tooltip) {
                            col[pageDataSource?.column?.position] = {
                                content: pageDataSource?.column?.tooltip,
                                icon: 'vxe-icon-question-circle-fill'
                            };
                        }

                    }
                    columns.value.push(col);
                }
            }
        }
        if (customOrder) { // 初始字段排序
            customOrder();
        } else { // 默认使用columns的第一个字段asc排序
            if (Array.isArray(columns.value) && columns.value.length) {
                if (columns.value[0]['field'] !== 'operation') {
                    order.value = {field: columns.value[0]['field'], order: 'asc'};
                }
            }
        }
    };

    return {
        generateTitle,
        columns,
        title_data,
        title_field_search,
        order,
    };
};

export default tableTitle;
