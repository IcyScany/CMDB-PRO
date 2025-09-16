<script setup>

// 定义组件属性
const props = defineProps({
    // 菜单数据
    menus: {
        type: Array,
        default: () => []
    },
    // 已选中的菜单ID数组
    checkedMenus: {
        type: Array,
        default: () => []
    },
    // 已选中的标题/按钮ID数组
    checkedTitles: {
        type: Array,
        default: () => []
    },
    // 已选中的层号ID数组
    checkedLayers: {
        type: Array,
        default: () => []
    },
    // 禁用检查函数
    disabledCheck: {
        type: Function,
        default: () => false
    },
    // 展开状态对象
    expandList: {
        type: Object,
        default: () => ({})
    },
    // 是否显示全选功能
    showSelectAll: {
        type: Boolean,
        default: false
    },
    // 全选状态
    selectAllState: {
        type: Object,
        default: () => ({
            checkAll: false,
            indeterminate: false
        })
    },
    // 是否显示层号选择
    showLayerSelection: {
        type: Boolean,
        default: true
    },
    // 是否显示按钮标识
    showButtonBadge: {
        type: Boolean,
        default: true
    },
    // 自定义字段名映射
    fieldNameMap: {
        type: Object,
        default: () => ({
            title_name: 'title_name',
            field_name: 'field_name'
        })
    },
    // 是否显示加载状态
    loading: {
        type: Boolean,
        default: false
    },
    // 是否默认全展开
    defaultExpandAll: {
        type: Boolean,
        default: false
    },
    // 是否显示一级菜单
    showLevel1Menu: {
        type: Boolean,
        default: true
    },
    // 是否禁用层号选择
    disabledLayerSelection: {
        type: Boolean,
        default: false
    },
    //是否禁用一级菜单选择
    disabledLevel1MenuSelection: {
        type: Boolean,
        default: false
    },
    // 是否显示一级菜单复选框
    showLevel1MenuCheckbox: {
        type: Boolean,
        default: true
    }
});

// 定义事件
const emit = defineEmits([
    'menu-check',
    'title-check',
    'layer-check',
    'expand-change',
    'select-all-change',
    'update:checkedMenus',
    'update:checkedTitles',
    'update:checkedLayers'
]);

// 内部状态管理
const internalCheckedMenus = ref([...props.checkedMenus]);
const internalCheckedTitles = ref([...props.checkedTitles]);
const internalCheckedLayers = ref([...props.checkedLayers]);
const internalExpandList = ref({...props.expandList});

// 初始化展开状态
function initExpandState() {
    if (props.defaultExpandAll && props.menus) {
        const expandState = {...internalExpandList.value}; // 保留现有的展开状态
        props.menus.forEach(menu => {
            if (menu.menus) {
                Object.keys(menu.menus).forEach(subMenuKey => {
                    // 只有当该二级菜单的展开状态未设置时才设置为展开
                    if (expandState[subMenuKey] === undefined) {
                        expandState[subMenuKey] = true;
                    }
                });
            }
        });
        internalExpandList.value = expandState;
    }
}

// 监听props变化
watch(() => props.checkedMenus, (newVal) => {
    internalCheckedMenus.value = [...newVal];
}, { deep: true });

watch(() => props.checkedTitles, (newVal) => {
    internalCheckedTitles.value = [...newVal];
}, { deep: true });

watch(() => props.checkedLayers, (newVal) => {
    internalCheckedLayers.value = [...newVal];
}, { deep: true });

watch(() => props.expandList, (newVal) => {
    internalExpandList.value = {...newVal};
}, { deep: true });

// 监听菜单数据变化（仅用于同步外部传入的 expandList）
watch(() => props.menus, (newVal) => {
    // 当菜单数据变化时，只处理新增的菜单项
    if (newVal && props.defaultExpandAll) {
        const expandState = {...internalExpandList.value};
        let hasNewItems = false;
        
        newVal.forEach(menu => {
            if (menu.menus) {
                Object.keys(menu.menus).forEach(subMenuKey => {
                    if (expandState[subMenuKey] === undefined) {
                        expandState[subMenuKey] = true;
                        hasNewItems = true;
                    }
                });
            }
        });
        
        if (hasNewItems) {
            internalExpandList.value = expandState;
        }
    }
}, { deep: true });

// 组件初始化时设置展开状态
initExpandState();

// 勾选/取消权限：checked表示是否指定勾选/取消勾选
function toggleCheck({key, type, checked}) {
    let targetArray;
    switch(type) {
        case 'menu':
            targetArray = internalCheckedMenus;
            break;
        case 'title':
        case 'button':
            targetArray = internalCheckedTitles;
            break;
        case 'layer':
            targetArray = internalCheckedLayers;
            break;
        default:
            return;
    }

    
    let index = targetArray.value.indexOf(key);
    if (!checked && index !== -1) { // 1. 不指定的情况；2. 指定取消勾选的情况。并且目前已勾选。则需要去除
        targetArray.value.splice(index, 1);
    }
    if (index === -1 && (checked === true || checked === undefined)) { // 1. 不指定的情况；2. 指定勾选的情况。并且目前未勾选。则需要增加
        targetArray.value.push(key);
    }
}

// 处理权限勾选的复杂逻辑
function handleCheckPermission({key, level1, level2, type, layer, title, button, num, idx}) {

    let targetArray;
    switch(type) {
        case 'menu':
            targetArray = internalCheckedMenus;
            break;
        case 'title':
        case 'button':
            targetArray = internalCheckedTitles;
            break;
        case 'layer':
            targetArray = internalCheckedLayers;
            break;
        default:
            return;
    }
    
    let index = targetArray.value.indexOf(key);
    let isCurrentlyChecked = index !== -1;
    let willBeChecked = !isCurrentlyChecked; // 切换状态
    

    
    // 先切换当前项目的状态
    toggleCheck({key, type, checked: willBeChecked});
    
    switch (willBeChecked) {
        case false: { // 将要取消选中的时候
            if (type === 'title' || type === 'button') { // title或button取消选中时，更新层号状态
                updateLayerSelection(level1, level2, layer);
            }
            if (type === 'layer') { // 所有title取消选中
                for (let t of title) {
                    toggleCheck({key:t.sid || t.id, type:'title', checked: false});
                }
                for (let b of button) {
                    toggleCheck({key:b.sid || b.id, type:'title', checked: false});
                }
            }
            if (type === 'menu' && num === 2) { // 二级菜单未勾选的时候所有title、层号无需选中
                let data = props.menus[idx]?.menus?.[level2]?.title_button;
                if (data) {
                    for (let item in data) {
                        let { title, button } = data[item];
                        toggleCheck({key:`${level1}_${level2}_${item}`, type:'layer', checked: false});
                        for (let t of title) {
                            toggleCheck({key:t.sid || t.id, type:'title', checked: false});
                        }
                        for (let b of button) {
                            toggleCheck({key:b.sid || b.id, type:'title', checked: false});
                        }
                    }
                }
            }
            if (type === 'menu' && num === 1) { // 一级菜单未勾选的时候所有二级菜单、层号、title无需选中
                let currentCheckedMenuData = props.menus[idx]?.menus;
                if (currentCheckedMenuData) {
                    for (let level2_id in currentCheckedMenuData) {
                        toggleCheck({key:level2_id * 1, type:'menu', checked: false});
                        let { title_button } = currentCheckedMenuData[level2_id];
                        if (title_button) {
                            for (let item in title_button) {
                                let { title, button } = title_button[item];
                                toggleCheck({key:`${level1}_${level2_id * 1}_${item}`, type:'layer', checked: false});
                                for (let t of title) {
                                    toggleCheck({key:t.sid || t.id, type:'title', checked: false});
                                }
                                for (let b of button) {
                                    toggleCheck({key:b.sid || b.id, type:'title', checked: false});
                                }
                            }
                        }
                    }
                }
            }
            break;
        }
        case true: {// 将要选中的时候
            if (type === 'title' || type === 'button') { // 其对应的父级一级菜单、二级菜单、层号需选中
                toggleCheck({key:level1, type:'menu', checked: true});
                toggleCheck({key:level2 * 1, type:'menu', checked: true});
                // 更新层号选中状态
                updateLayerSelection(level1, level2, layer);
            }
            if (type === 'layer') { // 其对应的父级一级菜单、二级菜单、所有title需选中
                toggleCheck({key:level1, type:'menu', checked: true});
                toggleCheck({key:level2 * 1, type:'menu', checked: true});
                for (let t of title) {
                    toggleCheck({key:t.sid || t.id, type:'title', checked: true});
                }
                for (let b of button) {
                    toggleCheck({key:b.sid || b.id, type:'title', checked: true});
                }
            }
            if (type === 'menu' && num === 2) { // 二级菜单勾选的时候所有title、层号、一级菜单需选中
                let data = props.menus[idx]?.menus?.[level2]?.title_button;
                toggleCheck({key:level1, type:'menu', checked: true});
                if (data) {
                    for (let item in data) {
                        let { title, button } = data[item];
                        toggleCheck({key:`${level1}_${level2}_${item}`, type:'layer', checked: true});
                        for (let t of title) {
                            toggleCheck({key:t.sid || t.id, type:'title', checked: true});
                        }
                        for (let b of button) {
                            toggleCheck({key:b.sid || b.id, type:'title', checked: true});
                        }
                    }
                }
            }
            if (type === 'menu' && num === 1) { // 一级菜单选中的时候所有二级菜单、层号、title需选中

                let currentCheckedMenuData = props.menus[idx]?.menus;
                if (currentCheckedMenuData) {
                    for (let level2_id in currentCheckedMenuData) {

                        toggleCheck({key:level2_id * 1, type:'menu', checked: true});
                        let { title_button } = currentCheckedMenuData[level2_id];
                        if (title_button) {
                            for (let item in title_button) {
                                let { title, button } = title_button[item];
                                toggleCheck({key:`${level1}_${level2_id * 1}_${item}`, type:'layer', checked: true});
                                for (let t of title) {
                                    toggleCheck({key:t.sid || t.id, type:'title', checked: true});
                                }
                                for (let b of button) {
                                    toggleCheck({key:b.sid || b.id, type:'title', checked: true});
                                }
                            }
                        }
                    }
                }
            }
            break;
        }
    }
    
    // 更新父组件状态
    emit('update:checkedMenus', [...internalCheckedMenus.value]);
    emit('update:checkedTitles', [...internalCheckedTitles.value]);
    emit('update:checkedLayers', [...internalCheckedLayers.value]);
}



// 处理标题/按钮勾选
function handleTitleCheck(titleId, checked, parentData = {}) {
    handleCheckPermission({
        key: titleId,
        level1: parentData.level1,
        level2: parentData.level2,
        layer: parentData.layer,
        idx: parentData.menuIndex,
        type: parentData.type || 'title'
    });
    
    emit('title-check', { titleId, checked, ...parentData });
}

// 处理层号勾选
function handleLayerCheck(layerId, checked, parentData = {}) {
    handleCheckPermission({
        key: layerId,
        level1: parentData.level1,
        level2: parentData.level2,
        layer: parentData.layer,
        idx: parentData.menuIndex,
        title: parentData.title,
        button: parentData.button,
        type: 'layer'
    });
    
    emit('layer-check', { layerId, checked, ...parentData });
}

// 处理展开/收起
function handleExpandChange(menuId, expanded) {
    internalExpandList.value[menuId] = expanded;
    emit('expand-change', { menuId, expanded });
}

// 处理全选按钮点击
function handleSelectAllClick(e) {
    const newState = e.target.checked;
    checkAllData(newState);
    emit('select-all-change', { checked: newState });
}

// 全选数据处理
function checkAllData(isChecked) {
    if (props.menus) {
        for (let level1Data of props.menus) {
            let { sid, id, menus } = level1Data;
            const menuId = id || sid;
            
            // 只有当显示一级菜单时才选中一级菜单
            if (props.showLevel1Menu) {
                toggleCheck({key: menuId, type:'menu', checked: isChecked});
            }

            for (let level2_id in menus) {
                toggleCheck({key:level2_id * 1, type:'menu', checked: isChecked});
                let { title_button } = menus[level2_id];
                if (title_button) {
                    for (let item in title_button) {
                        let { title, button } = title_button[item];
                        
                        // 先处理 title 和 button
                        for (let t of title) {
                            toggleCheck({key:t.sid || t.id, type:'title', checked: isChecked});
                        }
                        for (let b of button) {
                            toggleCheck({key:b.sid || b.id, type:'title', checked: isChecked});
                        }
                        
                        // 然后根据智能层号选中逻辑更新层号状态
                        if (isChecked) {
                            // 全选时，直接选中层号
                            toggleCheck({key:`${menuId}_${level2_id * 1}_${item}`, type:'layer', checked: true});
                        } else {
                            // 取消全选时，取消层号选中
                            toggleCheck({key:`${menuId}_${level2_id * 1}_${item}`, type:'layer', checked: false});
                        }
                    }
                }
            }
        }
    }
    
    // 更新父组件状态
    emit('update:checkedMenus', [...internalCheckedMenus.value]);
    emit('update:checkedTitles', [...internalCheckedTitles.value]);
    emit('update:checkedLayers', [...internalCheckedLayers.value]);
}

// 计算全选状态
const computedSelectAllState = computed(() => {
    const totalItems = getTotalItemsCount();
    let selectedItems = 0;
    
    // 计算选中的项目数量
    if (props.menus) {
        for (let level1Data of props.menus) {
            let { sid, id, menus } = level1Data;
            const menuId = id || sid;
            
            // 计算一级菜单选中数量
            if (props.showLevel1Menu && internalCheckedMenus.value.includes(menuId)) {
                selectedItems++;
            }
            
            // 计算二级菜单选中数量
            for (let level2_id in menus) {
                const level2MenuId = level2_id * 1;
                if (internalCheckedMenus.value.includes(level2MenuId)) {
                    selectedItems++;
                }
                
                // 计算层号、title、button 选中数量
                let { title_button } = menus[level2_id];
                if (title_button) {
                    for (let item in title_button) {
                        const layerId = `${menuId}_${level2_id * 1}_${item}`;
                        if (internalCheckedLayers.value.includes(layerId)) {
                            selectedItems++;
                        }
                        
                        let { title, button } = title_button[item];
                        title.forEach(t => {
                            if (internalCheckedTitles.value.includes(t.sid || t.id)) {
                                selectedItems++;
                            }
                        });
                        button.forEach(b => {
                            if (internalCheckedTitles.value.includes(b.sid || b.id)) {
                                selectedItems++;
                            }
                        });
                    }
                }
            }
        }
    }
    
    return {
        checkAll: totalItems > 0 && selectedItems === totalItems,
        indeterminate: totalItems > 0 && selectedItems > 0 && selectedItems < totalItems
    };
});

// 获取总项目数
function getTotalItemsCount() {
    let count = 0;
    if (props.menus) {
        for (let level1Data of props.menus) {
            if (props.showLevel1Menu) {
                count++; // 一级菜单
            }
            let { menus } = level1Data;
            for (let level2_id in menus) {
                count++; // 二级菜单
                let { title_button } = menus[level2_id];
                if (title_button) {
                    for (let item in title_button) {
                        count++; // 层号
                        let { title, button } = title_button[item];
                        count += title.length; // title
                        count += button.length; // button
                    }
                }
            }
        }
    }
    return count;
}

// 检查是否为普通功能
function isNormalFunction(item) {
    return props.disabledCheck(item);
}

// 获取显示名称
function getDisplayName(item, type = 'title') {
    const fieldMap = props.fieldNameMap;
    if (type === 'title') {
        return item[fieldMap.title_name] || item.title_name || item.field_name || '';
    }
    return item[fieldMap.field_name] || item.field_name || item.title_name || '';
}

// 检查某个层号下是否有选中的 title 或 button
function hasSelectedItemsInLayer(level1, level2, layer) {
    const menuIndex = props.menus.findIndex(menu => (menu.id || menu.sid) === level1);
    
    if (menuIndex === -1) return false;
    
    const subMenu = props.menus[menuIndex]?.menus?.[level2];
    if (!subMenu?.title_button?.[layer]) return false;
    
    const { title, button } = subMenu.title_button[layer];
    
    // 检查是否有选中的 title
    const hasSelectedTitle = title.some(t => internalCheckedTitles.value.includes(t.sid || t.id));
    // 检查是否有选中的 button
    const hasSelectedButton = button.some(b => internalCheckedTitles.value.includes(b.sid || b.id));
    
    return hasSelectedTitle || hasSelectedButton;
}

// 更新层号选中状态
function updateLayerSelection(level1, level2, layer) {
    const layerId = `${level1}_${level2}_${layer}`;
    const hasSelected = hasSelectedItemsInLayer(level1, level2, layer);
    
    if (hasSelected) {
        // 如果有选中的项目，确保层号被选中
        if (!internalCheckedLayers.value.includes(layerId)) {
            internalCheckedLayers.value.push(layerId);
        }
    } else {
        // 如果没有选中的项目，取消层号选中
        const index = internalCheckedLayers.value.indexOf(layerId);
        if (index !== -1) {
            internalCheckedLayers.value.splice(index, 1);
        }
    }
}
</script>

<template>
  <div class="menu-title-button-tree">
    <!-- 全选功能 -->
    <div v-if="showSelectAll" class="select-all-section">
      <a-checkbox
        :checked="computedSelectAllState.checkAll"
        :indeterminate="computedSelectAllState.indeterminate"
        @change="handleSelectAllClick"
      >
        全选
      </a-checkbox>
    </div>

    <!-- 菜单列表 -->
    <div class="part-content-box">
      <a-spin :spinning="loading">
        <template v-if="menus.length">
          <template v-for="(menu, menuIndex) in menus" :key="menu.id || menu.sid">
            <!-- 一级菜单 -->
            <template v-if="showLevel1MenuCheckbox">
                <a-checkbox 
                    v-if="showLevel1Menu"
                    :checked="internalCheckedMenus.includes(menu.id || menu.sid)"
                    :disabled="isNormalFunction(menu) || disabledLevel1MenuSelection"
                    :class="{ 'normal-function': isNormalFunction(menu) }"
                    @click="handleCheckPermission({key: menu.id || menu.sid, type: 'menu', num: 1, idx: menuIndex, level1: menu.id || menu.sid})"
                    >
                    <h3>{{ menu.menu_name }}</h3>
                </a-checkbox>
            </template>
            <template v-else>
                <h3>{{ menu.menu_name }}</h3>
            </template>
            

            <!-- 二级菜单 -->
            <div :class="['m1-content-box', { 'no-level1-indent': !showLevel1Menu }]">
              <template v-for="(subMenu, subMenuKey) in menu.menus" :key="subMenuKey">
                <div>
                  <i
                    :class="[internalExpandList[subMenuKey] ? 'vxe-icon-arrow-down' : 'vxe-icon-arrow-up', 'm2-expand-icon', 'text-info']"
                    @click="handleExpandChange(subMenuKey, !internalExpandList[subMenuKey])"
                  />
                  <a-checkbox 
                    :checked="internalCheckedMenus.includes(subMenu.id || subMenuKey * 1)"
                    :disabled="isNormalFunction(subMenu)"
                    :class="{ 'normal-function': isNormalFunction(subMenu) }"
                    @click="handleCheckPermission({key: subMenu.id || subMenuKey * 1, type: 'menu', level1: menu.id || menu.sid, level2: subMenuKey, num: 2, idx: menuIndex})"
                  >
                    <h4>
                      <vxe-tag v-if="showButtonBadge" class="theme--primary">{{ subMenu.menu_name }}</vxe-tag>
                      <span v-else>{{ subMenu.menu_name }}</span>
                    </h4>
                  </a-checkbox>
                </div>
                
                <!-- 层号和功能列表 -->
                <div v-show="internalExpandList[subMenuKey]" class="m2-content-box">
                  <template v-if="subMenu.title_button">
                    <template v-for="(titleGroup, layerKey) in subMenu.title_button" :key="`${menu.id || menu.sid}_${subMenuKey}_${layerKey}`">
                      <!-- 层号选择 -->
                      <a-checkbox 
                        v-if="showLayerSelection"
                        :disabled="disabledLayerSelection"
                        :checked="internalCheckedLayers.includes(`${menu.id || menu.sid}_${subMenuKey}_${layerKey}`)"
                        @click="handleLayerCheck(`${menu.id || menu.sid}_${subMenuKey}_${layerKey}`, !internalCheckedLayers.includes(`${menu.id || menu.sid}_${subMenuKey}_${layerKey}`), {
                          level1: menu.id || menu.sid,
                          level2: subMenuKey,
                          layer: layerKey,
                          menuIndex,
                          title: titleGroup.title,
                          button: titleGroup.button
                        })"
                      >
                        层号: {{ layerKey }}
                      </a-checkbox>
                      
                      <!-- 功能列表 -->
                      <div class="layer-box">
                        <!-- 标题功能 -->
                        <a-checkbox 
                          v-for="title in titleGroup.title" 
                          :key="title.id || title.sid"
                          :checked="internalCheckedTitles.includes(title.id || title.sid)"
                          :disabled="isNormalFunction(title)"
                          :class="{ 'normal-function': isNormalFunction(title) }"
                          @click="handleTitleCheck(title.id || title.sid, !internalCheckedTitles.includes(title.id || title.sid), {
                            level1: menu.id || menu.sid,
                            level2: subMenuKey,
                            layer: layerKey,
                            menuIndex,
                            type: 'title'
                          })"
                        >
                          {{ getDisplayName(title, 'title') }}
                        </a-checkbox>
                        
                        <!-- 按钮功能 -->
                        <a-checkbox 
                          v-for="button in titleGroup.button" 
                          :key="button.id || button.sid"
                          :checked="internalCheckedTitles.includes(button.id || button.sid)"
                          :disabled="isNormalFunction(button)"
                          :class="{ 'normal-function': isNormalFunction(button) }"
                          @click="handleTitleCheck(button.id || button.sid, !internalCheckedTitles.includes(button.id || button.sid), {
                            level1: menu.id || menu.sid,
                            level2: subMenuKey,
                            layer: layerKey,
                            menuIndex,
                            type: 'button'
                          })"
                        >
                          <b v-if="showButtonBadge" class="text-error bold-class-btn">B</b>
                          {{ getDisplayName(button, 'button') }}
                        </a-checkbox>
                      </div>
                    </template>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </template>
        
        <!-- 空状态 -->
        <a-empty v-else>
          <template #description>
            暂无菜单数据
          </template>
        </a-empty>
      </a-spin>
    </div>
  </div>
</template>

<style scoped lang="less">
.menu-title-button-tree {
  .select-all-section {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #fafafa;
    border-radius: 6px;
  }

  .part-content-box {
    padding: 1.5rem;
  }

  .m1-content-box, .m2-content-box, .layer-box {
    padding-left: calc(1rem + 8px);
    
    .m2-expand-icon {
      margin-right: 10px;
      cursor: pointer;
    }
  }

  .no-level1-indent {
    padding-left: 0 !important;
  }

  .ant-checkbox-wrapper {
    margin: 5px 0;
  }

  .ant-checkbox-group {
    width: 100%;
  }

  .normal-function {
    color: #ccc !important;
    pointer-events: none;
    
    .ant-checkbox {
      opacity: 0.5;
    }
  }

  .bold-class-btn {
    width: 25px;
    height: 25px;
    display: inline-block;
    text-align: center;
    font-size: 16px;
    border-radius: 50%;
    border: 1px solid red;
  }

  h3 {
    margin: 0;
    color: #333;
  }

  h4 {
    margin: 0;
    color: #666;
  }
}
</style> 