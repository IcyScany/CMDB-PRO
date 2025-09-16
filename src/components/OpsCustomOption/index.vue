<script setup>
// 用户的自定义选项

import formOptionApi from "@/api/system/formOptionApi";

defineProps({
    title: {
        type:Object,
        default: () => ({}),
    },
    options: {
        type: Array,
        default: () => ([]),
    },
});

const VNodes = defineComponent({
    props: {
        vnodes: {
            type: Object,
            required: true,
        },
    },
    render() {
        return this.vnodes;
    },
});

let userCunstomItem = reactive({
    name: null,
    describe: null,
});
let emits = defineEmits(['updateCustomOption']);
// 用户新建选项
const userAddItem = (orgi) => {
    if (orgi.sid) {
        formOptionApi.postFormOptionAdd(orgi.sid, userCunstomItem)
            .then(res => {
                userCunstomItem = {
                    name: null,
                    describe: null,
                };
                emits('updateCustomOption',res);
            });
    }
};
let currEditItem = ref(null);
let nameInputRef = ref(null);

const deleteOption = (item) => {
    formOptionApi.delFormOptionDel(item.sid)
        .then(res => {
            emits('updateCustomOption',res);
        });
};
const editOption = (item, idx) =>{
    currEditItem.value = idx;
    item.editing = true;
    nextTick(() => {
        nameInputRef.value && nameInputRef.value[0]?.focus();
    });
};
// 提交保存修改的
const saveOption = (orgi,item) =>{
    formOptionApi.putFormOptionEdit(orgi.sid, {
        id: item.sid,
        name: item.name,
        describe: item.describe,
    }).then((res) => {
        emits('updateCustomOption',res);
        currEditItem.value = null;
    });

};

// 取消编辑的操作
const cancelEdit = (item) =>{
    item.editing = false;
    currEditItem.value = null;
};

// 解决下拉选项中的input不能focus问题
const handleDesc = (e) => {
    e.target.focus();
};

// 关闭下拉弹窗的时候清空编辑的状态
const handleClearEditState = (open) => {
    if (!open) {
        currEditItem.value = null;
    }
};

    
</script>


<template>
    <ops-a-select
        :attr="$attrs"
        style="width: calc(100% - 50px)"
        :dropdown-style="{
            zIndex: $CONFIG.LAYER_ZINDEX_TOP

        }"
        option-label-prop="label"
        @dropdown-visible-change="handleClearEditState"

    >
        <a-select-option v-for="(item , idx) in options" :key="item.value" :label="item.label">
            <div v-if="currEditItem !== idx" class="option-content">
                <span>{{ item.label }}</span>
                <span style="margin-left: 10px; color: #999">{{ item.describe }}</span>
                <vxe-button icon="vxe-icon-edit"   status="primary" mode="text"  style="margin-left: 10px; cursor: pointer" size="mini" @click.stop="editOption(item, idx)"/>
                <vxe-button icon="vxe-icon-delete" status="error" mode="text"  style="margin-left: 10px; cursor: pointer"  size="mini" @click.stop="deleteOption(item)" />
            </div>
      <div v-else class="option-content">
        <a-input ref="nameInputRef" v-model:value="item.name" placeholder="名称" style="width: 100px" @click.stop="handleDesc" />
        <a-input v-model:value="item.describe" placeholder="描述" style="width: 100px; margin-left: 10px" @click.stop="handleDesc"/>
        <i class="vxe-icon-success-circle-fill" style="margin-left: 10px; cursor: pointer; color: green" @click.stop="saveOption(title,item)" ></i>
        <i class="vxe-icon-error-circle-fill" style="margin-left: 10px; cursor: pointer; color: red" @click.stop="cancelEdit(item)"/>
      </div>
        </a-select-option>
        <template  #dropdownRender="{ menuNode: menu }">
            <a-space style="padding: 4px 8px">
                <a-input v-model:value="userCunstomItem.name" placeholder="输入选项名" />
                <a-input v-model:value="userCunstomItem.describe" placeholder="备注" />
                <a-button type="text" :disabled="!userCunstomItem.name" @click="userAddItem(title)">
                    <template #icon>
                        <plus-outlined />
                    </template>
                    新建选项
                </a-button>
            </a-space>
            <a-divider style="margin: 4px 0" />
            <v-nodes :vnodes="menu" />

        </template>
    </ops-a-select>
</template>



<style scoped>

</style>
