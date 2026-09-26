<script setup lang="ts">
type Props = {
    title: string;
    description?: string;
    compact?: boolean;
};

withDefaults(defineProps<Props>(), {
    description: undefined,
    compact: false,
});
</script>

<template>
    <div :class="compact ? 'py-4 text-center' : 'p-8 text-center'">
        <div
            v-if="$slots.icon"
            :class="
                compact
                    ? 'mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-muted'
                    : 'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted'
            "
        >
            <slot name="icon" />
        </div>
        <p class="font-medium">{{ title }}</p>
        <p v-if="description" class="mt-1 text-sm text-muted-foreground">
            {{ description }}
        </p>
        <div v-if="$slots.default" class="mt-4">
            <slot />
        </div>
    </div>
</template>
