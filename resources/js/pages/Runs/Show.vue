<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { ChevronsUpDown, Plus } from '@lucide/vue';
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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import type { Run } from '@/types';
import regionsData from '@data/regions.json';

const props = defineProps<{
    run: Run;
}>();

const dialogOpen = ref(false);

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

const form = useForm({
    name: '',
    run_type: 'CUSTOM',
});

function createRegion() {
    // form.post(store.url(), {
    //     onSuccess: () => {
    //         dialogOpen.value = false;
    //         form.reset();
    //     },
    // });
}

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
                <Dialog v-model:open="dialogOpen">
                    <DialogTrigger as-child>
                        <Button
                            variant="outline"
                            title="Add new region"
                            class="mb-2 cursor-pointer"
                        >
                            <Plus /> Add Region
                        </Button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-[425px]">
                        <form @submit.prevent="createRegion">
                            <DialogHeader>
                                <DialogTitle>Add New Region</DialogTitle>
                                <DialogDescription>
                                    Add a new region to your save file. Click
                                    save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div class="mb-4 grid gap-4">
                                <div class="grid gap-3">
                                    <Label for="name">Name</Label>
                                    <Input
                                        id="name"
                                        v-model="form.name"
                                        name="name"
                                        placeholder="Road to 500"
                                        required
                                    />
                                    <InputError :message="form.errors.name" />
                                </div>
                                <div class="grid gap-3">
                                    <Label for="run_type">Run Type</Label>
                                    <Select v-model="form.run_type">
                                        <SelectTrigger
                                            id="run_type"
                                            class="w-full"
                                        >
                                            <SelectValue
                                                placeholder="Select a run type"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PILGRIM"
                                                >Pilgrim</SelectItem
                                            >
                                            <SelectItem value="VOYAGER"
                                                >Voyager</SelectItem
                                            >
                                            <SelectItem value="STALKER"
                                                >Stalker</SelectItem
                                            >
                                            <SelectItem value="INTERLOPER"
                                                >Interloper</SelectItem
                                            >
                                            <SelectItem value="MISERY"
                                                >Misery</SelectItem
                                            >
                                            <SelectItem value="CUSTOM"
                                                >Custom</SelectItem
                                            >
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        :message="form.errors.run_type"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose as-child>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        class="cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    :disabled="form.processing"
                                    class="cursor-pointer"
                                >
                                    {{ form.processing ? 'Saving...' : 'Save' }}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

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
                                <ul class="space-y-1 text-sm">
                                    <li
                                        v-for="region in regionsData"
                                        :key="region.id"
                                        class="rounded-md px-2 py-1 hover:bg-muted"
                                    >
                                        {{ region.name }}
                                    </li>
                                </ul>
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
