import commonApi from "@/api/common";
import axios from "@/utils/axios";
import { userCommonMessageStore } from '@/stores';
import opsFormTitle from "@/composables/form/opsFormTitle";
import {find, orderBy} from "xe-utils";
import { storeToRefs } from 'pinia';
// 获取得到页面的title、button
/**
 * isEdit: 是否为编辑使用
 * **/
const tableRender = {
    // 对不同有数据源title进行处理
    handleDataSourceType: async ({title, title_data}) => {
        // 处理常用字段数据源
        tableRender.handleCommonDataSource(title);

        let { page_data_source, field } = title;
        if (page_data_source) {
            let titleDataSource = page_data_source?.data_source;
            let diffType = ['url'];
            if (titleDataSource){
                if (diffType.indexOf(titleDataSource) > -1) {
                    if (page_data_source.url) {
                        title.get_data_api = function () {
                            axios.get(page_data_source.url)
                                .then( async res => {
                                    let data = res;
                                    if (page_data_source?.received_key) {
                                        data = res[page_data_source?.received_key];
                                    }
                                    title.title_data = data;
                                    title_data.value[field] = data;
                                });
                        };
                        await title.get_data_api();
                    }
                }
                if (titleDataSource === 'data') {
                    title.title_data = page_data_source?.data;
                    title_data.value[field] = page_data_source?.data;
                }
            }
        }
        return title;
    },

    // 处理常用字段数据源
    handleCommonDataSource: async (title) => {
        let { page_data_source, field } = title;
        switch (field) {
            case 'virtual_teams':
            case 'virtual_team_v3_id':
                title.page_data_source = Object.assign({
                    "url": "/public/virtual-team/list",
                    "label": "group_name",
                    "data_source": "url",
                    "tooltip_text": "虚拟用户组用于控制行数据的权限",
                    "template_render": { "name": "opsVirtualTeam" },
                }, page_data_source);
                break;
            case 'cloud_source':
                title.page_data_source = Object.assign({
                    "children_field":"cloud_master_account_id",
                    "need_slots":true,
                    "template_render": { "name": "myCloud" },
                }, page_data_source);
                break;
            case 'cloud_master_account_id':
                title.page_data_source = Object.assign({
                    "url":"/public/cloud-account-name/list",
                    "data_source":"url",
                    "label": "page_display"
                }, page_data_source);
                break;
            case 'zone_id':
                title.page_data_source = Object.assign({
                    "need_slots":true,
                    "children_field":"region_id"
                }, page_data_source);
                break;
            case 'region_id':
                title.page_data_source = Object.assign({
                    "url":"/public/cloud-regions/list",
                    "data_source":"url",
                }, page_data_source);
                break;
        }
    },
    
    // 获取表格的title
    getTitle: async ({layer= 1, customTitleButton, isEdit = false, customTitle = []}) => {
        let title = ref(customTitle);
        let button = ref([]);
        let userCommonStore = userCommonMessageStore();
        const { current_user_menu } = storeToRefs(userCommonStore);
        let currentMenu = computed(() => current_user_menu.value?.current_menu);
        let currentParentMenu = computed(() => current_user_menu.value?.current_parent_menu);
      
        const currentMenuID = computed(() => { // 异步赋值，确保在数据到位后再访问要不然其值可能出现undefined
            return current_user_menu.value?.current_menu?.sid  || current_user_menu.value?.current_menu?.id || currentMenu.value?.current_all_second_menu?.id;
        });
        let title_data = ref({});

        const {
            generateCmdbFormTitle,
            formState,
            initFormState,
            rules,
        } = opsFormTitle(title_data, {currentMenuID, layer});

        if(currentMenuID.value && layer && !customTitle.length) { // 获取当前页面的title、button
            title.value = [];
            button.value = [];
            try {
                const responseTitleButton = await commonApi.getCurrentMenuTitleApi({layer, id: currentMenuID.value});
                let result = [];
                let responseData = responseTitleButton?.title_data || {};
                if(responseData) {
                    for (let item in responseData) {
                        for (let title_button of responseData[item]) {
                            title_button.layer = Number(layer);
                            let { types,} = title_button;
                            if (types === 1) {
                                let formatAfterTitle = await tableRender.handleDataSourceType({title: title_button, title_data: title_data});
                              
                                title.value.push(formatAfterTitle);
                                result.push(formatAfterTitle);
                            }
                            if (types === 2) {
                                button.value.push(title_button);
                            }
                        }
                    }
                }
                userCommonStore.handleSetCurrentMenu({
                    current_parent_menu: currentParentMenu.value,
                    current_menu: Object.assign({}, currentMenu.value, responseTitleButton?.page_data_source ? {page_data_source: responseTitleButton?.page_data_source} : {}),
                });

                if (isEdit) {
                    await generateCmdbFormTitle(result);
                }
                if(customTitleButton) {
                    customTitleButton(responseData);
                }
            } catch (error) {
                title.value = [];
                button.value = [];
            }
            title.value =  orderBy(title.value, [['sorting', 'asc']]);
        } else {
            if (isEdit) {
                await generateCmdbFormTitle(title.value);
            }
        }
        return {
            title,
            button,
            formState,
            initFormState,
            rules,
            currentMenuID,
            title_data,
        };
    },

    // 获取到的title对其处理为列
    formatTitle: async ({title, tableType, isCustomTitle=false, page_title_data}) => {
        let columns = ref([]); // 返回显示的columns
        let subPageColumns = ref([]); // 返回显示的columns
        let title_field_search = ref([]); // 服务端表格-可以高级搜索的字段
        let title_data = ref({});
        page_title_data = isRef(page_title_data) ? page_title_data : ref({});
        if (title) {
            for (let item in title) {
                let currTitle = title[item] || {};
                let {
                    field, // title在数据库中的名称
                    field_name, // title的中文名
                    page_data_source: pageDataSource,  // 页面title自定义的数据源
                    search_display: canSearchDisplay,  // title是否搜索显示
                    page_display: canPageDisplay, // title是否显示
                    sub_page_display: canSubPageDisplay, // title是否子页面显示
                    page_sort: canPageSort, // 是否进行排序，主要用于服务器端模式 &todo(情形1： 有无客户端模式，无需排序)
                    get_data_api,
                } = currTitle;

                isCustomTitle && await tableRender.handleDataSourceType({title:currTitle, title_data:title_data});

                
                // 服务端表格-页面可以排序的字段都可以排序；客户端-默认都可以排序
                let col = {
                    field: field,
                    title: field_name,
                    showOverflow: true,
                    sortable: !(tableType === 'server' && !canPageSort),
                    oriTitle: currTitle,
                    minWidth: field === 'id' ? '80' : pageDataSource?.width || '120',
                    page_data_source: pageDataSource,
                    get_data_api: get_data_api,
                    title_data: page_title_data.value,
                };
               

                // 列的显示处理
                if(canPageDisplay) {
                    if (pageDataSource?.column) {
                        if (pageDataSource?.column?.tooltip) {
                            col[pageDataSource?.column?.position] = {
                                content: pageDataSource?.column?.tooltip,
                                icon: 'vxe-icon-question-circle-fill'
                            };
                        }
                    }

                    // 关于表格列的合并一键方式配置
                    if (pageDataSource?.children_field) {
                        let children = find(title, row => row?.field === pageDataSource?.children_field &&
                            currTitle.block === row.block
                        );
                        if (children) {
                            let handleFormat = {
                                title: children.field_name,
                                minWidth: pageDataSource?.width || '120',
                                sortable: !(tableType === 'server' && !children.page_sort),
                            };
                            if (pageDataSource?.need_slots) { //是否给予插槽
                                handleFormat.slots = {
                                    default: children.field
                                };
                            } else {
                                handleFormat.formatter = ({cellValue, row}) => {
                                    return `${row[field]  ? row[field] : ''} \n ${cellValue ? cellValue : ''}`;
                                };
                            }
                            col.children = [{...children, ...handleFormat}];
                        }
                    }

                    let parent = find(title, row => row?.page_data_source?.children_field === field &&
                        currTitle.block === row.block
                    );
                    if (!parent) {
                        columns.value.push(col);
                    }
                }

                // 子页面展示字段
                if (canSubPageDisplay) {
                    subPageColumns.value.push(col);
                }
                // 条件搜索中高级搜索可以搜索的字段
                if (canSearchDisplay) {
                    title_field_search.value.push(col);
                }
            }
        }
        return {
            table_columns: columns.value,
            sub_page_columns: subPageColumns.value,
            table_title_field_search: title_field_search.value,
            table_title_data: title_data,
        };
    },

    // 用于设置表格的title
    setColumn: async ({layer, customOrder, tableType}) => {
        let columns = ref([]); // 返回显示的columns
        let title_field_search = ref([]); // 服务端表格-可以高级搜索的字段
        let order = ref(null); // 服务端表格-初始排序
        let {
            title_data,
            button,
            title,
        } = await tableRender.getTitle({layer});
        let {table_columns, table_title_field_search, sub_page_columns} =  await tableRender.formatTitle({title:title.value, tableType, page_title_data: title_data });
        columns.value = table_columns;
        title_field_search.value = table_title_field_search;

        if (customOrder) { // 初始字段排序
            customOrder();
        } else { // 默认使用columns的第一个字段asc排序
            if (Array.isArray(columns.value) && columns.value.length) {
                if (columns.value[0]['field'] !== 'operation') {
                    order.value = {field: columns.value[0]['field'], order: 'DESC'};
                }
            }
        }

        return {
            title_data,
            columns,
            title_field_search,
            order,
            button,
            title,
            sub_page_columns
        };
    },
};

export default tableRender;
