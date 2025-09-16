/** 列配置 */



export function useColumns(props = { columns: [] }, commitRequest) {
    /** vxe的全局配置 */
    watch(
        () => props.columns,
        () => {
            setupDefaultConfig(props.columns);
            setupColumns(props.columns);
        },
        { immediate: true }
    );

    /** 设置列表默认配置 */
    function setupDefaultConfig(columns) {
        if (['checkbox', 'radio', 'seq', 'expand'].includes(columns?.[0]?.type)) {
            const column = columns[0];
            column.minWidth = column.minWidth ?? '65px';
            column.width = column.width ?? '65px';
            column.align = column.align ?? 'center';
            column.fixed = column.fixed ?? 'left';
        }

        for (let col of columns) {
            let { field, page_data_source, title_data}  = col;

            switch (field) {
                case 'operation':
                    col.slots = {
                        default: field
                    };
                    col.fixed = 'right';
                    delete col.showOverflow;
                    break;
                default:
                    if (page_data_source) {
                        switch (page_data_source.form_type) {
                            case 'boole':
                                col.cellRender = {
                                    name: 'VxeSwitch',
                                    props: {
                                        openValue: page_data_source?.checked ? page_data_source.checked : 1,
                                        closeValue: page_data_source?.unchecked === false || page_data_source?.unchecked ? page_data_source?.unchecked : 0,
                                        openLabel: page_data_source?.checkedChildren || '打开',
                                        closeLabel: page_data_source?.unCheckedChildren || '关闭',
                                        disabled: !props?.authBtn?.edit?.page_display,
                                    },
                                    events: {
                                        change: ({row, column}, e) => {
                                            if (props?.switchClickStatusConfig?.api) {
                                                let requestParam = props?.switchClickStatusConfig?.params || [];
                                                let otherParam = {};
                                                for(let item in requestParam) {
                                                    otherParam[requestParam[item]] = row[requestParam[item]];
                                                }
                                                let result = {
                                                    [column.field]: e.value,
                                                    ...otherParam
                                                };
                                                props.switchClickStatusConfig.api(row.id, result)
                                                    .then(() => {
                                                        commitRequest && commitRequest();
                                                        props.loading = false;
                                                    })
                                                    .catch(() => {
                                                        props.loading = false;
                                                    });
                                            }
                                        }
                                    }
                                };
                                break;
                        }
                       
                    }
                    break;
            }
            let templateRender = page_data_source?.template_render;
            if (templateRender) {
                col.cellRender = {
                    name: templateRender?.name,
                    props: {
                        data_source: title_data,
                        ...templateRender,
                    }
                };
            }

        }
    }

    /** 设置列配置 */
    function setupColumns(columns) {
        columns.forEach((column) => {
            if (column.children) {
                setupColumns(column.children);
            }
        });
    }


}


