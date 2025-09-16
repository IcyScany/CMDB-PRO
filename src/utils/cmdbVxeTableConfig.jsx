// 模块用于引入关于Vxetable相关配置
import { VXE_PAGE_SIZES, LAYER_ZINDEX_MIDDLE } from "@/config/globalOption";

/** vxe组件按需加载是不带语言包和主题的，需要手动导入语言包和主题变量。 **/
import * as VxeUI from 'vxe-pc-ui';
import tableTitle from "@/composables/tableTitle";

import {

    VxeColumn,
    VxeColgroup,
    VxeGrid,
    VxeToolbar
} from 'vxe-table';
import zhCN from 'vxe-pc-ui/lib/language/zh-CN';
import commonApi from "@/api/common";
import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';

import CloudTypeIcon from '@/components/common/CloudTypeIcon.vue';
import VirtualTeamCell from '@/components/common/VirtualTeamCell.vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

// import UuidNameInfo from '@/components/common/UuidNameInfo.vue';
import opsStatus from '@/components/opsStatus/index.vue';


// 导入主题变量，也可以重写主题变量


// 注册语言
VxeUI.setI18n('zh-CN', zhCN);
// 切换语言
VxeUI.setLanguage('zh-CN');
// vxetable插件-全局配置
VxeUI.setConfig({
    pager: {
        pageSizes: VXE_PAGE_SIZES,
        layouts: ['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total'],
    },
    grid: {
        round: true,
        pagerConfig: {
            enabled: true,
        },
    },
    modal: {
        width: '80%',
        height: '80%',
        minWidth: '80%',
        minHeight: '80%',
        transfer: false,
        mask: true, // 是否显示遮罩层
        maskClosable: true, // 是否允许点击遮罩层关闭窗口
        escClosable: true,  // 是否允许按 Esc 键关闭窗口
        showMaximize: true, // 是否显示最大化按钮
        showMinimize: true, // 是否显示最小化按钮
        showZoom: true, // 是否显示最大化与最小化按钮
        showClose: true, // 是否显示关闭按钮
        resize: true, // 是否允许窗口边缘拖动调整窗口大小
        lockScroll: true, // 是否锁住滚动条，不允许页面滚动
        zIndex: LAYER_ZINDEX_MIDDLE,
    }
});

const vxeTableMixinCode = {
    'opsSystemGetTableColumn': { // 表格获取列指令
        async commandMethod({$table}, options) {
            let {
                generateTitle,
                columns,
            } = tableTitle();
            let title = ref([]);
            let button = ref([]);
            const menuButtonTitle = await commonApi.getCurrentMenuTitleApi({id: options?.menu_id, layer: options?.layer});
            if (menuButtonTitle?.title_data) {
                for (let item in menuButtonTitle.title_data) {
                    for (let title_button of menuButtonTitle.title_data[item]) {
                        let {types} = title_button;
                        if (types === 1) {
                            title.value.push(title_button);
                        }
                        if (types === 2) {
                            button.value.push(title_button);
                        }
                    }
                }
            }
            await generateTitle({titles: title.value});
            $table.MENU_TITLE_BUTTON = {
                title,
                button,
            };
            /* $table.loadColumn(columns.value);*/
            let responseData = {
                title,
                button,
                columns
            };
            options.receiveData && options.receiveData(responseData);

            return responseData;


        }
    },
    'myToolbarCustom': {
        commandMethod({$table}) {
            $table.openCustom();
        }
    },
};

// 云的来源模板
VxeUI.renderer.add('myCloud', {
    // 默认显示模板
    renderTableDefault(renderOpts, params) {
        const { row, column } = params;
        return <CloudTypeIcon type={row[column.field]} />;
    },
});

// 虚拟用户组渲染模板
VxeUI.renderer.add('opsVirtualTeam', {
    // 默认显示模板
    renderTableDefault(renderOpts, params) {
        const { row, column } = params;
        const { data_source, label, hyphen } = renderOpts.props;
        return <VirtualTeamCell 
            fieldValue={row[column.field]}
            dataSource={data_source[column.field]}
            label={label}
            hyphen={hyphen}
        />;
    },
});

/* 
    状态展示渲染
    active_value: 激活状态的值（默认为"true"）
    transform_rule: 字段转换的规则对象
*/
VxeUI.renderer.add('opsStatus', {
    renderTableDefault(renderOpts, params) {
        const { row, column } = params;
        const { active_value, transform_rule } = renderOpts.props;
        return <opsStatus
            value={row[column.field]}
            activeValue={active_value}
            transformRule={transform_rule}
        />;
    },
});

/* 
公共数据的渲染规范 @todo 目前主页面不需要，只有子页面在使用
    1. 当数据库表遇到下面定义的字段，且字段内容符合规则，即调用接口获取数据
    2. 字段规则， UUID 或 阿里云
    3. 调用接口获取获取，返回非200，页面不做任何操作
    4. 接口：/v3/{business}/public/name-info/{obj_type}/{uuid}
   uuid 鼠标放上去的渲染
*/
/* VxeUI.renderer.add('opsUuidNameRender', {
    renderTableDefault(renderOpts, params) {
        const { row, column } = params;
        const { obj_type, uuid_field} = renderOpts.props;
        return row[uuid_field] || row[column.field] ? (<UuidNameInfo objType={obj_type} uuid={uuid_field ? row[uuid_field]: row[column.field]}>{row[column.field]}</UuidNameInfo>) : row[column.field];
    }
});
 */

// 平台的模板
VxeUI.renderer.add('myPlatform', {
    // 默认显示模板
    renderTableDefault(renderOpts, params) {
        const { row, column } = params;
        return (
            <span>
                <SvgIcon iconname={`icon-${row[column.field]}`} class={{'w-6 h-6 inline-block mr-1': row?.[column.field] !== 'harmonyos', 'w-16 h-16 inline-block mr-1': row?.[column.field] === 'harmonyos'}} />
            </span>
        );
    },
});


VxeUI.commands.mixin({...vxeTableMixinCode});

// 可选组件
const lazyVxeUI = (app) => {
    app.use(VxeUI);
    /* app.use(VxeButtonGroup);
    app.use(VxeCheckbox);
    app.use(VxeCheckboxGroup);
    app.use(VxeForm);
    app.use(VxeFormGather);
    app.use(VxeFormItem);
    app.use(VxeIcon);
    app.use(VxeInput);
    app.use(VxeList);
    app.use(VxeLoading);
    app.use(VxeModal);
    app.use(VxeOptgroup);
    app.use(VxeOption);
    app.use(VxePager);
    app.use(VxePulldown);
    app.use(VxeRadio);
    app.use(VxeRadioButton);
    app.use(VxeRadioGroup);
    app.use(VxeSelect);
    app.use(VxeSwitch);
    app.use(VxeTextarea);
    app.use(VxeTooltip);
    app.use(VxeAlert);
    app.use(VxeNoticeBar);
    app.use(VxeText);
    app.use(VxeMenu).use(VxeLink).use(VxeLayoutAside).use(VxeLayoutContainer).use(VxeLayoutBody).use(VxeLayoutHeader);*/

};

const lazyVxeTable = (app) => {

    app.use(VxeColumn);
    app.use(VxeColgroup);
    app.use(VxeGrid);
    app.use(VxeToolbar);
};




export  {
    lazyVxeUI,
    lazyVxeTable,
};
