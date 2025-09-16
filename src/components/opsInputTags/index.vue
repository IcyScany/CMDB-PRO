<script setup>
const props = defineProps({
    tags: {
        type: Array,
        default: () => {
            return [];
        }
    },
    editable: {
        type: Boolean,
        default: false
    }
});

const { tags, editable } = toRefs(props);
const emit = defineEmits(['update:tags']);

const inputValue = ref('');
const editIndex = ref(null);

// 编辑/新增tag
const editTag = (index) => {
    if(index === 'add') {
        updateTag('add');
        nextTick(() => {
            editIndex.value = tags.value.length - 1;
        });
    } else {
        editIndex.value = index;
        inputValue.value = tags.value[index];
    }
};

// 更新tag值
const updateTag = (type, index) => {
    let tagsArr = tags.value ? [...tags.value] : [];
    if(type === 'add') {
        tagsArr.push('');
    } 
    else if(type === 'del') {
        tagsArr.splice(index, 1);
    } 
    else if(type === 'edit') {
        tagsArr[editIndex.value] = inputValue.value;
        tagsArr = tagsArr.filter(item => item);
    }
    emit('update:tags', tagsArr);
    inputValue.value = '';
    editIndex.value = null;
};

// 输入框自动聚焦
watch(editIndex, val => {
    if(val !== null) {
        nextTick(() => {
            document.querySelector(`.tag-input-${val}`).focus();
        });
    }
});
</script>

<template>
    <div>
        <template
            v-for="(tag, index) in tags"
            :key="index"
        >
            <a-tag
                v-if="editIndex !== index"
                :closable="editable"
                style="margin-bottom: 5px; cursor: pointer"
                @click="e => editTag(index)"
                @close.prevent="updateTag('del', index)"
            >
                {{ tag }}
            </a-tag>
            <a-input
                v-else
                v-model:value="inputValue"
                :class="`tag-input-${index}`"
                style="width: 150px; margin-right: 5px;"
                size="small"
                @blur="updateTag('edit')"
                @keyup.enter.stop="updateTag('edit')"
            >
            </a-input>
        </template>

        <!-- 新增tag -->
        <a-tag 
            v-if="editable" 
            style="background: #fff; border-style: dashed; cursor: pointer;" 
            @click="editTag('add')"
        >
            <PlusOutlined />
        </a-tag>
    </div>
</template>
