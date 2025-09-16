<script setup>
import {computed, toRefs} from "vue";
import "@/assets/iconfont/iconfont.js";
const  props = defineProps (
    {
        iconname: {
            type: String,
            required: true
        }
    }
);
let {iconname} = toRefs(props);

let iconHref = computed(()=> {
    return `#${iconname.value}`;
});
</script>

<template>
    <svg class="svg-icon" aria-hidden="true">
        <use :xlink:href="iconHref"></use>
    </svg>
</template>

<style>
.svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
</style>
