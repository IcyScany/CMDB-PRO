<script setup>
defineProps({
    title: {
        type: [String, Number],
        default: ''
    },
    content: {
        type: [String, Number],
        default: ''
    },
    placement: {
        type: String,
        default: 'top'
    },
    primary: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['click']);

</script>

<template>
    <a-tooltip v-if="content" :placement="placement" :overlay-style="{maxWidth: 'none'}">
        <template #title>      
            <a-typography-paragraph 
                :copyable="{ tooltip: false}" 
                class="tooltip-text"
            >
                {{ title || content }}
            </a-typography-paragraph>
        </template>
        <div 
            class="truncate"
            :class="{ 'text-primary': primary, 'cursor-pointer': primary }"
            style="width: fit-content; max-width: 100%;"
            @click="emit('click')"
        >
            {{ content }}
        </div>
    </a-tooltip>
</template>
