<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { dashboard } from '@/routes';
import type { Run } from '@/types';

const props = defineProps<{
    run: Run;
}>();

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: dashboard(),
            },
        ],
    },
});
</script>

<template>
    <Head :title="props.run.name" />

    <div
        class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
    >
        <div
            class="flex w-full items-center justify-center gap-2 md:justify-start md:text-left"
        >
            <h1 class="mr-4">{{ props.run.name }}</h1>
        </div>
    </div>
</template>
