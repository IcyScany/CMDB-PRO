<script setup>
const props = defineProps({
    defaultSearchField: { // @todo 不选择字段的时候，支持默认搜索的字段匹配
        type: Object,
        default: () => ({}),
    },
    titleFieldSearch: {
        type: Array,
        default: () => [],
    },
    defaultQueryCondition: { // 默认的查询条件
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['search']);
let { titleFieldSearch, defaultQueryCondition } = toRefs(props);

// 搜索状态
const searchInput = ref('');
const searchTags = ref([]);
const suggestions = ref([]);
const currentStep = ref('field'); // field | operator | value
const selectedField = ref(null);
const selectedOperator = ref(null);
const tempValue = ref(''); // 临时存储输入的值
const selectedValues = ref([]);

// 添加一个变量控制下拉框的显示
const isInputFocused = ref(false);

// 添加一个变量存储当前正在编辑的标签
const editingTagId = ref(null);

// 添加输入框的引用
const inputRef = ref(null);


const helpBasicSteps = [
    {
        title: '选择字段',
        description: '点击输入框选择要搜索的字段'
    },
    {
        title: '选择操作符',
        description: '选择合适的比较操作符'
    },
    {
        title: '输入值',
        description: '输入或选择搜索值'
    },
    {
        title: '执行搜索',
        description: '按回车键或点击应用按钮'
    }
];

// 帮助说明内容
const helpContent = [
    {
        title: '基本搜索步骤',
        items: [
            '1. 选择要搜索的字段',
            '2. 选择操作符（如：包含、等于、大于等于等）',
            '3. 输入或选择搜索值',
            '4. 按回车键或点击应用按钮进行搜索'
        ]
    },
    {
        title: '特殊功能说明',
        items: [
            '字段选择：点击输入框可查看所有可搜索字段',
            '数据源选择：对于有预设选项的字段，会自动显示可选值',
            '多值搜索：选择"in(包含)"操作符时，可以输入多个值，用英文逗号分隔',
            '修改条件：点击已生成标签中的操作符可以修改搜索条件',
            '删除条件：点击标签右侧的关闭图标可删除该搜索条件',
            '清空所有：点击输入框右侧的清除按钮可清空所有搜索条件'
        ]
    },
    {
        title: '快捷操作',
        items: [
            '回车键：确认当前输入并进入下一步',
            '空格键：在字段选择时可快速展开选项列表',
            '英文逗号键：在多值搜索模式下用于分隔多个值'
        ]
    }
];

// 搜索字段选项
const searchFieldOptions = computed(() => {
    let result = [];
    if (titleFieldSearch.value) {
        for (let item of titleFieldSearch.value) {
            let {search_display} = item.oriTitle;
            if (search_display) {
                result.push({
                    label: item.title,
                    value: item.field,
                    type: item?.oriTitle?.page_data_source?.data_source || 'text'
                });
            }
        }
    }
    return result;
});

// 操作符选项
const operatorOptions = [
    { label: 'in(包含)', value: 'in' },
    { label: '模糊查询', value: 'vague' },
    { label: '等于', value: '=' },
    { label: '不等于', value: '!=' },
    { label: '大于等于', value: '>=' },
    { label: '小于等于', value: '<=' },
    { label: '开始于', value: 'start' },
    { label: '结束于', value: 'end' },
];

// 获取当前字段的数据源选项
const getCurrentFieldOptions = computed(() => {
    const currentField = selectedField.value;
    if (!currentField || !titleFieldSearch.value) {
        return [];
    }

    const currentColumn = titleFieldSearch.value.find(col => {
        const { field } = col?.oriTitle || {};
        return field === currentField;
    });

    if (!currentColumn?.oriTitle?.page_data_source) {
        return [];
    }

    const { page_data_source } = currentColumn.oriTitle;
   
    const dataSource = currentColumn?.title_data?.[currentField];
    const options = [];

    if (dataSource) {
        const { label = 'label', value = 'value', data, data_source, info_tip, info_color } = page_data_source;
        
        switch (data_source) {
            case 'url':
                for (let i in dataSource) {
                    const item = dataSource[i];
                    if (item[value] || item[label]) {
                        options.push({
                            label: item[label] || i,
                            value: item[value] || i,
                            infoTip: item?.[info_tip],
                            color: item?.[info_color] || 'text-warning',
                        });
                    } else if (typeof item === 'string') {
                        options.push({
                            label: item,
                            value: item
                        });
                    }
                }
                break;
            case 'user_custom':
                if (Array.isArray(dataSource)) {
                    dataSource.forEach(item => {
                        if (Array.isArray(item)) {
                            options.push({
                                label: item[0],
                                value: item[0]
                            });
                        }
                    });
                }
                break;
            case 'data':
                if (Array.isArray(data)) {
                    data.forEach(item => options.push(item));
                } else if (data) {
                    Object.entries(data).forEach(([key, val]) => {
                        options.push({
                            value: isNaN(key) ? key : Number(key),
                            label: val
                        });
                    });
                }
                break;
        }
    }
    return options;
});

// 获取选项的实际值和显示值
const getOptionInfo = (field, searchValue) => {
    searchValue = String(searchValue)?.trim()?.toString();
    if (!field || !searchValue) return { value: searchValue, label: searchValue };
    
    // 获取当前字段的选项
    let options = [];
    if (selectedField.value === field) {
        options = getCurrentFieldOptions.value;
    } else {
        // 如果selectedField为null，直接从titleFieldSearch中查找对应字段的选项
        const currentColumn = titleFieldSearch.value.find(col => {
            const { field: colField } = col?.oriTitle || {};
            return colField === field;
        });

        if (currentColumn?.oriTitle?.page_data_source) {
            const { page_data_source } = currentColumn.oriTitle;
            const dataSource = currentColumn?.title_data?.[field];
            
            if (dataSource) {
                const { label = 'label', value = 'value', data, data_source } = page_data_source;
                
                switch (data_source) {
                    case 'url':
                        for (let i in dataSource) {
                            const item = dataSource[i];
                            if (item[value] || item[label]) {
                                options.push({
                                    label: item[label] || i,
                                    value: item[value] || i
                                });
                            } else if (typeof item === 'string') {
                                options.push({
                                    label: item,
                                    value: item
                                });
                            }
                        }
                        break;
                    case 'user_custom':
                        if (Array.isArray(dataSource)) {
                            dataSource.forEach(item => {
                                if (Array.isArray(item)) {
                                    options.push({
                                        label: item[0],
                                        value: item[0]
                                    });
                                }
                            });
                        }
                        break;
                    case 'data':
                        if (Array.isArray(data)) {
                            data.forEach(item => options.push(item));
                        } else if (data) {
                            Object.entries(data).forEach(([key, val]) => {
                                options.push({
                                    value: isNaN(key) ? key : Number(key),
                                    label: val
                                });
                            });
                        }
                        break;
                }
            }
        }
    }
    
    if (!options || !options.length) return { value: searchValue, label: searchValue };
    
    // 模糊匹配选项
    const option = options.find(opt => {
        return !Number.isNaN(Number(searchValue)) ? Number(opt.value) === Number(searchValue) : opt.label.trim().toString().toLowerCase().indexOf(searchValue) > -1;
    });
    

    return option ? { value: option.value, label: option.label } : { value: searchValue, label: searchValue };
};

// 执行搜索
const handleSearch = () => {
    const formattedTags = searchTags.value.map(tag => {
        let value = tag.value;
        let displayValue = tag.displayValue || tag.value;
        

        if (tag.operator === 'in' && typeof value === 'string') {
            // 处理多值搜索
            const values = value.split(',').map(v => v.trim());
            let result = '';
            const convertedValues = values.map((v, index) => {
                const { value: actualValue, label } = getOptionInfo(tag.field, v);
                result += label + (index === values.length - 1 ? '' : ',');
               
                return actualValue;
            });
            displayValue = result; // 更新显示值
            value = convertedValues;
        } else {
            // 处理单值搜索
            const { value: actualValue, label } = getOptionInfo(tag.field, value);
            value = actualValue;
            displayValue = label;
        }

        // 更新标签显示值
        const tagIndex = searchTags.value.findIndex(t => t.id === tag.id);
        if (tagIndex !== -1) {
            searchTags.value[tagIndex] = {
                ...tag,
                displayValue // 保存显示值
            };
        }

        return {
            field: tag.field,
            condition: tag.operator,
            value: value,
            logic: tag.logic,
            displayValue
        };
    });

    emit('search', {
        tags: formattedTags,
        expression: searchInput.value
    });
};

// 处理默认的查询条件
watch(defaultQueryCondition, () => {
    searchTags.value = [];
    defaultQueryCondition.value.forEach(item => {
        const matchedField = searchFieldOptions.value.find(field => field.value === item.field);

        const newTag = {
            id: Date.now(),
            field: item.field, // 用于提交的字段名
            operator: item.condition || 'vague',
            value: item.value,
            displayValue: item.value,
            label: matchedField?.label || item.field_name || item.field,
            logic: searchTags.value.length > 0 ? 'AND' : null,
            disableClose: item.disableClose || false
        };
        searchTags.value.push(newTag);
    });
    handleSearch();
});

// 修改处理键盘事件
const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
        if (searchInput.value && !selectedField.value) {
            // 检查是否有匹配的默认字段
            if (props.defaultSearchField?.fields) {
                const inputValue = searchInput.value.trim();
                
                // 使用字段的 validate 函数进行验证
               

              

                // 使用字段的 validate 函数进行验证
                let matchedField = null;
                for (const field of props.defaultSearchField.fields) {
                    if (field?.validate) {
                        const result = await field.validate(inputValue);
                        if (result) {
                            matchedField = field;
                            break;
                        }
                    } else {
                        matchedField = field;
                        break;
                    }
                }
                console.log('matchedField', matchedField);

                if (matchedField) {
                    // 使用默认字段创建标签，确保使用 field_name 显示中文
                    const newTag = {
                        id: Date.now(),
                        field: matchedField.field,          // 用于提交的字段名
                        operator: matchedField.operator || 'vague',
                        value: inputValue,
                        displayValue: inputValue,
                        label: matchedField.field_name,     // 显示的中文名
                        logic: searchTags.value.length > 0 ? 'AND' : null
                    };
                    searchTags.value.push(newTag);
                    
                    // 提交搜索时使用 field
                    handleSearch();
                    searchInput.value = '';
                    selectedField.value = null;
                    selectedOperator.value = null;
                    currentStep.value = 'field';
                    inputRef.value?.input?.blur();
                    return;
                }
            }

            // 如果没有匹配的默认字段，保持原有的搜索逻辑
            if (searchFieldOptions.value.length > 0) {
                selectedField.value = searchFieldOptions.value[0].value;
                selectedOperator.value = 'vague';
                tempValue.value = searchInput.value;
                
                const newTag = {
                    id: Date.now(),
                    field: selectedField.value,
                    operator: selectedOperator.value,
                    value: searchInput.value,
                    displayValue: searchInput.value,
                    label: searchFieldOptions.value[0].label,
                    logic: searchTags.value.length > 0 ? 'AND' : null
                };
                
                searchTags.value.push(newTag);
                handleSearch();
                searchInput.value = '';
                selectedField.value = null;
                selectedOperator.value = null;
                currentStep.value = 'field';
                inputRef.value?.input?.blur();
            }
        }
        
        if (currentStep.value === 'value' && selectedField.value && selectedOperator.value) {
            let newTag = null;
            let shouldCreateTag = false;
            
            if (selectedOperator.value === 'in' && selectedValues.value.length > 0) {
                // 处理多选值
                shouldCreateTag = true;
                const logic = searchTags.value.length > 0 ? 'AND' : null;
                newTag = {
                    id: Date.now(),
                    field: selectedField.value,
                    operator: selectedOperator.value,
                    value: selectedValues.value.join(','),
                    logic
                };
            } else if (tempValue.value || searchInput.value) {  // 添加对 searchInput.value 的检查
                // 处理单选值
                shouldCreateTag = true;
                const logic = searchTags.value.length > 0 ? 'AND' : null;
                newTag = {
                    id: Date.now(),
                    field: selectedField.value,
                    operator: selectedOperator.value,
                    value: searchInput.value || tempValue.value,  // 优先使用输入框的值
                    logic
                };
            }

            if (shouldCreateTag && newTag) {
                searchTags.value.push(newTag);
                handleSearch();

                // 只在成功创建标签后才重置状态
                searchInput.value = '';
                tempValue.value = '';
                selectedValues.value = [];
                currentStep.value = 'field';
                selectedField.value = null;
                selectedOperator.value = null;
                suggestions.value = searchFieldOptions.value;
                // 使用 blur() 方法主动触发失焦
                inputRef.value?.input?.blur();
            }
           
        }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // 当输入框为空时的删除逻辑
        if (!searchInput.value) {
            e.preventDefault(); // 阻止默认的删除行为
            
            // 优先删除当前的选择状态
            if (selectedOperator.value) {
                selectedOperator.value = null;
                currentStep.value = 'operator';
                suggestions.value = operatorOptions;
            } else if (selectedField.value) {
                selectedField.value = null;
                currentStep.value = 'field';
                suggestions.value = searchFieldOptions.value;
            } else if (searchTags.value.length > 0) {
                
                // 如果没有选择状态，则删除最后一个标签
                const lastTag = searchTags.value[searchTags.value.length - 1];
                if (!lastTag.disableClose) {
                    removeSearchTag(lastTag.id);
                }
            }
        } 
    }
};

// 处理操作符点击
const handleOperatorClick = (tag) => {
    // 只显示操作符选择下拉框，不改变当前输入状态
    isInputFocused.value = true;
    editingTagId.value = tag.id;
    suggestions.value = operatorOptions;
};

// 修改标签的操作符
const updateTagOperator = (tagId, newOperator) => {
    const index = searchTags.value.findIndex(t => t.id === tagId);
    if (index > -1) {
        searchTags.value[index] = {
            ...searchTags.value[index],
            operator: newOperator
        };
        // 更新后触发搜索
        handleSearch();
    }
    // 只清除编辑状态
    editingTagId.value = null;
    suggestions.value = [];
    isInputFocused.value = false;
};

// 修改建议选择处理函数
const handleSuggestionSelect = (item) => {
    if (editingTagId.value) {
        // 如果是在编辑已有标签的操作符
        updateTagOperator(editingTagId.value, item.value);
        return;
    }

    // 常规的选择逻辑
    if (currentStep.value === 'field') {
        selectedField.value = item.value;
        searchInput.value = '';
        currentStep.value = 'operator';
        suggestions.value = operatorOptions;
        selectedValues.value = []; // 重置多选值
    } else if (currentStep.value === 'operator') {
        selectedOperator.value = item.value;
        searchInput.value = '';
        currentStep.value = 'value';
        suggestions.value = getCurrentFieldOptions.value;
    } else if (currentStep.value === 'value') {
        if (selectedOperator.value === 'in') {
            // 多选模式
            const index = selectedValues.value.findIndex(v => v === item.value);
            if (index === -1) {
                selectedValues.value.push(item.value);
                searchInput.value = selectedValues.value.map(val => {
                    const option = getCurrentFieldOptions.value.find(opt => opt.value === val);
                    return option?.label || val;
                }).join(',');
            }
        } else {
            // 单选模式
            tempValue.value = item.value;
            searchInput.value = item.label;
            suggestions.value = [];
        }
    }
};

// 获取当前步骤的提示文本
const getPlaceholder = computed(() => {
    switch (currentStep.value) {
        case 'field':
            // 当没有选择字段时，显示默认搜索字段的提示文本
            if (!selectedField.value && props.defaultSearchField?.placeholder) {
                return props.defaultSearchField.placeholder;
            }
            return '请选择搜索字段';
        case 'operator':
            return '请选择操作符';
        case 'value':
            // 如果当前选择的是 in 操作符，显示特殊提示
            if (selectedOperator.value === 'in') {
                return '多个使用","分隔，按回车键进行搜索';
            }
            return '请输入搜索值，按回车确认';
        default:
            return '';
    }
});

// 移除搜索标签
const removeSearchTag = (tagId) => {
    const index = searchTags.value.findIndex(tag => tag.id === tagId);
    if (index > -1) {
        searchTags.value.splice(index, 1);
        // 删除标签后也触发搜索
        handleSearch();
    }
};

// 处理输入框聚焦
const handleFocus = () => {
    isInputFocused.value = true;
    if (!searchInput.value && currentStep.value === 'field') {
        suggestions.value = searchFieldOptions.value;
    }
};

// 处理输入框失焦
const handleBlur = () => {
    setTimeout(() => {
        isInputFocused.value = false;
        suggestions.value = [];
        editingTagId.value = null;
    }, 200);
};

// 清空搜索
const handleClear = () => {
    searchInput.value = '';
    searchTags.value = [];
    currentStep.value = 'field';
    suggestions.value = [];
    selectedField.value = null;
    selectedOperator.value = null;
    emit('search', null);
};

// 修改标签显示逻辑
const getTagDisplay = (tag) => {
    // 优先使用默认字段的 field_name
    if (props.defaultSearchField?.fields) {
        const defaultField = props.defaultSearchField.fields.find(f => f.field === tag.field);
        if (defaultField) {
            return defaultField.field_name;  // 返回中文名
        }
    }
    
    // 回退到原有的显示逻辑
    return tag.label || searchFieldOptions.value.find(f => f.value === tag.field)?.label;
};


</script>

<template>

    <div class="advanced-filter">
        <div class="filter-input-wrapper">
            <div class="input-container">
                <FilterOutlined class="filter-icon" />
                <div class="tags-and-input">
                    <!-- 已选择的标签 -->
                    <template v-for="(tag, index) in searchTags" :key="tag.id">
                        <div class="tag-item">
                            <span class="tag-content">
                                <template v-if="index > 0">{{ tag.logic }} </template>
                                {{ getTagDisplay(tag) }}  <!-- 显示中文名 -->
                                &nbsp;
                                <span 
                                    class="operator-text"
                                    @click.stop="handleOperatorClick(tag)"
                                >
                                    {{ operatorOptions.find(o => o.value === tag.operator)?.label }}
                                </span>
                                &nbsp;
                                "{{ tag.displayValue || tag.value }}"
                            </span>
                            <CloseOutlined v-if="!tag.disableClose" class="close-icon" @click.stop="removeSearchTag(tag.id)" />
                        </div>
                    </template>
                    
                    <!-- 当前选择状态显示 -->
                    <div v-if="selectedField || selectedOperator" class="current-selection">
                        <template v-if="selectedField">
                            {{ searchFieldOptions.find(f => f.value === selectedField)?.label }}
                        </template>
                        <template v-if="selectedOperator">
                            &nbsp;
                            {{ operatorOptions.find(o => o.value === selectedOperator)?.label }}
                        </template>
                    </div>

                    <!-- 搜索输入框 -->
                    <a-input
                        ref="inputRef"
                        v-model:value="searchInput"
                        allow-clear
                        class="filter-input"
                        :placeholder="getPlaceholder"
                       
                        @keydown="handleKeyDown"
                        @focus="handleFocus"
                        @blur="handleBlur"
                    >
                        <template #suffix>
                            <a-space>
                                <a-button type="link" @click="handleClear">
                                    <CloseOutlined />
                                </a-button>
                                <!-- 暂时：以Enter键触发“应用”按钮 -->
                                <a-button type="primary" size="small" @click="handleKeyDown({key: 'Enter'})">
                                    应用
                                </a-button>
                                <a-popover
                                    placement="bottomRight"
                                    trigger="hover"
                                >
                                    <template #title>
                                        <h2>搜索使用说明</h2>
                                    </template>
                                    <template #content>
                                        <div class="help-content">
                                            <!-- 基本搜索步骤 - 使用步骤条 -->
                                            <div class="help-section">
                                                <h4>基本搜索步骤</h4>
                                                <a-steps 
                                                    :current="null" 
                                                    :initial="0"
                                                    size="small" 
                                                    direction="vertical"
                                                    :items="helpBasicSteps"
                                                >
                                                </a-steps>
                                            </div>

                                            <!-- 其他说明部分 -->
                                            <div v-for="(section, index) in helpContent.slice(1)" :key="index" class="help-section">
                                                <h4>{{ section.title }}</h4>
                                                <div class="pl-2">
                                                    <li v-for="(item, itemIndex) in section.items" :key="itemIndex">
                                                        {{ item }}
                                                    </li>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <a-button type="link" size="small">
                                        <QuestionCircleOutlined />
                                    </a-button>
                                </a-popover>
                            </a-space>
                        </template>
                    </a-input>
                </div>
            </div>

            <!-- 智能提示下拉框 -->
            <div v-if="isInputFocused && suggestions.length" class="suggestions-dropdown">
                <div
                    v-for="item in suggestions"
                    :key="item.value"
                    class="suggestion-item"
                    :class="{ 'suggestion-item-checkbox': selectedOperator === 'in' }"
                    @click="handleSuggestionSelect(item)"
                    @mousedown.prevent
                >
                  <template v-if="selectedOperator === 'in'">
                    <a-checkbox  :checked="selectedValues.includes(item.value)" :value="item.value" @change="handleSuggestionSelect(item)"> </a-checkbox>&nbsp;&nbsp;
                  </template>
                    <span  class="item-label">
                        {{ item.label }} 
                    </span>
                    <span v-if="item.type" class="item-type">{{ item.type }}</span>

                    <template v-if="item.infoTip">
                        <span  :class="item.color" class="ml-2">{{ item.infoTip }}</span>
                    </template>

                   
                    
                </div>
            </div>
        </div>
            </div>
</template>

<style lang="less" scoped>
.advanced-filter {
    .filter-input-wrapper {
        position: relative;
        width: 100%;

        .input-container {
            display: flex;
            align-items: center;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            padding: 4px 8px;
            background: #fff;
            min-height: 32px;

            &:hover {
                border-color: var(--primary-color);
            }

            .filter-icon {
                color: #999;
                margin-right: 8px;
            }

            .tags-and-input {
                display: flex;
                flex-wrap: wrap;
                flex: 1;
                gap: 4px;
                align-items: center;

                .tag-item {
                    display: inline-flex;
                    align-items: center;
                    background: #f0f2f5;
                    border-radius: 4px;
                    padding: 2px 8px;
                    margin: 2px;
                    font-size: 13px;
                    line-height: 20px;

                    .tag-content {
                        color: #333;
                    }

                    .close-icon {
                        margin-left: 4px;
                        color: #999;
                        cursor: pointer;
                        font-size: 12px;

                        &:hover {
                            color: #666;
                        }
                    }

                    .operator-text {
                        color: var(--primary-color);
                        cursor: pointer;
                        
                        &:hover {
                            text-decoration: underline;
                        }
                    }
                }

                .filter-input {
                    flex: 1;
                    min-width: 100px;
                    border: none;
                    padding: 0;

                    &:focus {
                        box-shadow: none;
                    }
                }
            }
        }

        .suggestions-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            margin-top: 4px;
            max-height: 300px;
            overflow-y: auto;

            .suggestion-item {
                padding: 8px 12px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;

                &:hover {
                    background: #f5f5f5;
                }

                .item-label {
                    color: #333;
                }

                .item-type {
                    color: #999;
                    font-size: 12px;
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 2px;
                }
            }
            .suggestion-item-checkbox {
                justify-content: flex-start;
            }
        }
    }

    .current-selection {
        display: inline-flex;
        align-items: center;
        color: #666;
        font-size: 13px;
        margin-right: 8px;
        
        &:not(:empty)::after {
            content: '|';
            margin: 0 8px;
            color: #d9d9d9;
        }
    }

    .help-content {
        max-width: 400px;
        
        .help-section {
            &:not(:last-child) {
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;
            }

            h4 {
                margin: 0 0 12px;
                color: #333;
                font-weight: 500;
            }

            // 步骤条样式调整
            :deep(.ant-steps) {
                .ant-steps-item {
                    min-height: 48px;
                    padding-bottom: 12px;

                    .ant-steps-item-title {
                        font-size: 14px;
                    }

                    .ant-steps-item-description {
                        font-size: 12px;
                        color: #666;
                    }
                }
            }

            ul {
                margin: 0;
                padding-left: 20px;

                li {
                    margin-bottom: 8px;
                    color: #666;
                    line-height: 1.5;

                    &:last-child {
                        margin-bottom: 0;
                    }
                }
            }
        }
    }
}
</style>
