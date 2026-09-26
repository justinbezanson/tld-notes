<script setup lang="ts">
import InputError from '@/components/InputError.vue';
import { Label } from '@/components/ui/label';

type Props = {
    id: string;
    label: string;
    error?: string;
};

withDefaults(defineProps<Props>(), {
    error: undefined,
});
</script>

<template>
    <div class="grid min-w-0 gap-3">
        <Label :for="id">{{ label }}</Label>
        <slot />
        <InputError :message="error" />
    </div>
</template>
