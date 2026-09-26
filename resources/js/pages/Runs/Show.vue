<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import GoalsPanel from '@/components/runs/GoalsPanel.vue';
import NotesPanel from '@/components/runs/NotesPanel.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import type { Note, Region, Run } from '@/types';

const props = defineProps<{
    run: Run;
    regions: Array<Region>;
    notes: Array<Note>;
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
        <div class="flex w-full gap-2 md:justify-start md:text-left">
            <h1 class="mr-4">{{ props.run.name }}</h1>
        </div>

        <Tabs default-value="notes">
            <TabsList class="w-full md:w-100">
                <TabsTrigger
                    class="rounded-none border-b data-[state=active]:border-b-2 data-[state=active]:border-b-white! data-[state=active]:bg-transparent! data-[state=active]:shadow-none!"
                    value="notes"
                >
                    Regions Notes
                </TabsTrigger>
                <TabsTrigger
                    class="rounded-none border-b data-[state=active]:border-b-2 data-[state=active]:border-b-white! data-[state=active]:bg-transparent! data-[state=active]:shadow-none!"
                    value="goals"
                >
                    Goals & Tasks
                </TabsTrigger>
            </TabsList>
            <TabsContent value="notes">
                <NotesPanel
                    :run-id="props.run.id"
                    :regions="props.regions"
                    :notes="props.notes"
                />
            </TabsContent>
            <TabsContent value="goals">
                <GoalsPanel />
            </TabsContent>
        </Tabs>
    </div>
</template>
