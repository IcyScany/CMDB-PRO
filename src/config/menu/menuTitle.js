/** 菜单下的title管理其列**/

const menuTitleArr = ['id', 'create_time', 'update_time', 'menu_id', 'layer', 'block', 'types', 'sorting', 'field', 'field_name', 'field_explain', 'page_display', 'page_sort', 'edit_display', 'edit_required', 'edit_change', 'search_display', 'data_source', 'page_data_source'];
const menuTitle = [
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 3,
        "lower_layer": 0,
        "field": "sorting",
        "field_name": "排序",
        "page_sort": 1,
        "page_display": true,
        "edit_display": false,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": null,
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 1,
        "field": "id",
        "field_name": "NO.",
        "page_display": true,
        "edit_display": false,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": null,
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 2,
        "lower_layer": 0,
        "field": "field",
        "field_name": "DB字段",
        "page_display": true,
        "edit_display": true,
        "edit_required": true,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "children_field": "field_name",
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 4,
        "lower_layer": 0,
        "field": "field_name",
        "field_name": "字段名",
        "page_display": true,
        "edit_display": true,
        "edit_required": true,
        "edit_change": true,
        "search_display": true,
        "page_data_source": null,
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 5,
        "lower_layer": 0,
        "field": "types",
        "field_name": "类型",
        "page_display": true,
        "edit_display": true,
        "edit_required": true,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "data": {
                "1": "Title",
                "2": "Button"
            },
            "data_source": "data"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 7,
        "page_sort": true,
        "field": "permissions_url",
        "field_name": "权限URL",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "select",
            "multiple": "tags"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 6,
        "lower_layer": 0,
        "field": "page_display",
        "field_name": "页面显示",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "boole"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 11,
        "page_sort": true,
        "field": "sub_page_display",
        "field_name": "子页面展示",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": false,
        "page_data_source": {
            "form_type": "boole",
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 7,
        "lower_layer": 0,
        "field": "layer",
        "field_name": "层号",
        "page_display": true,
        "edit_display": true,
        "edit_required": true,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "data": {
                "1": 1,
                "2": 2,
                "3": 3,
                "4": 4,
                "5": 5,
                "6": 6,
                "7": 7,
                "8": 8,
                "9": 9,
                "10": 10,
                "11": 11,
                "12": 12,
                "13": 13
            },
            "data_source": "data"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 8,
        "lower_layer": 0,
        "field": "block",
        "field_name": "块号",
        "page_display": false,
        "edit_display": true,
        "edit_required": true,
        "edit_change": true,
        "search_display": true,
        "page_data_source": null,
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 9,
        "lower_layer": 0,
        "field": "edit_display",
        "field_name": "编辑显示",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "boole",
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 10,
        "lower_layer": 0,
        "field": "edit_required",
        "field_name": "必填",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "boole"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 11,
        "lower_layer": 0,
        "field": "edit_change",
        "field_name": "可否编辑",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "boole"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 12,
        "lower_layer": 0,
        "field": "search_display",
        "field_name": "搜索显示",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "boole"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 16,
        "lower_layer": 0,
        "field": "page_sort",
        "field_name": "是否排序",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "boole"
        },
        "field_explain": null
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 14,
        "lower_layer": null,
        "field": "page_data_source",
        "field_name": "数据源",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": true,
        "page_data_source": {
            "form_type": "json"
        },
        "field_explain": "仅支持JSON格式字符串"
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 15,
        "lower_layer": null,
        "field": "field_explain",
        "field_name": "字段说明",
        "page_display": true,
        "edit_display": true,
        "edit_required": false,
        "edit_change": true,
        "search_display": false,
        "page_data_source": null,
        "field_explain": ""
    },
    {
        "layer": 1,
        "block": 1,
        "types": 1,
        "sorting": 18,
        "lower_layer": 0,
        "field": "operation",
        "field_name": "操作",
        "page_display": true,
        "edit_display": false,
        "edit_required": false,
        "edit_change": false,
        "search_display": false,
        "page_data_source": null,
        "field_explain": null
    }
];

export  {
    menuTitleArr,
    menuTitle,
};
