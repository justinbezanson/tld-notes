<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { ChevronsUpDown } from '@lucide/vue';
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const isOpen = ref(false);
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
                <Card class="w-full">
                    <Collapsible v-model:open="isOpen">
                        <CardHeader
                            class="flex flex-row items-center justify-between space-y-0"
                        >
                            <div>
                                <CardTitle>Collapsible Card</CardTitle>
                                <CardDescription
                                    >Click the button to reveal
                                    content.</CardDescription
                                >
                            </div>

                            <CollapsibleTrigger as-child>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="w-9 p-0"
                                >
                                    <ChevronsUpDown class="h-4 w-4" />
                                    <span class="sr-only">Toggle Content</span>
                                </Button>
                            </CollapsibleTrigger>
                        </CardHeader>

                        <CollapsibleContent
                            class="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down transition-all"
                        >
                            <CardContent>
                                <div
                                    class="rounded-md border p-3 font-mono text-sm"
                                >
                                    This content can be toggled smoothly. It
                                    stays hidden until you explicitly request to
                                    see it!
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>
            </TabsContent>
            <TabsContent value="goals">
                Goals & Tasks content goes here. You can add your goals and
                tasks related to the run in this section.
            </TabsContent>
        </Tabs>
    </div>
</template>
