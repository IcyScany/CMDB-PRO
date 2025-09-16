<script setup>
import {useSlots} from "vue";

defineProps({
    popupContainer: {
        type: Object,
        default: null,
    },
});
const slots = useSlots();
const renderSlots = Object.keys(slots);
/** 搜索的时候输入框有前后空格的过滤 --Start**/
const fliterData = (inputVal, option) => {
    return option.label ? option.label.toLowerCase().indexOf(inputVal.trim().toLowerCase()) >= 0 : true;
};
/** 搜索的时候输入框有前后空格的过滤 --END**/
</script>

<template>
    <a-select
        :attr="$attrs"
        allow-clear
        auto-clear-search-value
        show-search
        :token-separators="[',', '，', ' ']"
        option-filter-prop="label"
        :filter-option="fliterData"
        :get-popup-container="(triggerNode) => popupContainer ? popupContainer : triggerNode.parentNode"
    >
        <template v-for="item in renderSlots" #[item]="scope" >
            <slot
                :name="item"
                :scope="scope"
                v-bind="scope || {}"
            />
        </template>
    </a-select>

</template>



<style scoped>

</style>
