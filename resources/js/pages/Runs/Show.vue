<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { ChevronsUpDown, Plus } from '@lucide/vue';
import { computed, ref } from 'vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboard } from '@/routes';
import { store as notesStore } from '@/routes/runs/notes';
import { store } from '@/routes/runs/regions';
import type { Note, Region, Run } from '@/types';
import regionsData from '@data/regions.json';

const props = defineProps<{
    run: Run;
    regions: Array<Region>;
    notes: Array<Note>;
}>();

const dialogOpen = ref(false);
const noteDialogOpen = ref(false);
const activeRegion = ref<Region | null>(null);

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
    region_id: 'GENERAL',
});

const noteForm = useForm({
    region_id: '',
    location_id: 'GENERAL',
});

const locationOptions = computed(() => {
    const options: Array<{ name: string; id: string }> = [
        { name: 'General', id: 'GENERAL' },
    ];

    const region = activeRegion.value
        ? regionsData.find((r) => r.id === activeRegion.value?.region_id)
        : undefined;

    if (region) {
        options.push(...region.locations);
    }

    return options;
});

function createRegion() {
    form.post(store.url(props.run.id), {
        onSuccess: () => {
            dialogOpen.value = false;
            form.reset();
        },
    });
}

function openAddNote(region: Region) {
    activeRegion.value = region;
    noteForm.clearErrors();
    noteForm.reset('location_id');
    noteForm.region_id = region.region_id;
    noteDialogOpen.value = true;
}

function createNote() {
    noteForm.post(notesStore.url(props.run.id), {
        onSuccess: () => {
            noteDialogOpen.value = false;
            noteForm.reset();
        },
    });
}

function getRegionNameFromId(regionId: string): string {
    const region = regionsData.find((r) => r.id === regionId);

    return region ? region.name : 'Unknown Region';
}

function getLocationName(regionId: string, locationId: string | null): string {
    if (!locationId) {
        return 'General';
    }

    const region = regionsData.find((r) => r.id === regionId);
    const location = region?.locations.find((l) => l.id === locationId);

    return location?.name ?? 'Unknown Location';
}

function notesForRegion(region: Region): Note[] {
    return props.notes.filter((note) => note.region_id === region.region_id);
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
                                    <Label for="region">Region</Label>
                                    <Select v-model="form.region_id">
                                        <SelectTrigger
                                            id="region"
                                            class="w-full"
                                        >
                                            <SelectValue
                                                placeholder="Select a region"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GENERAL">
                                                General (No specific region)
                                            </SelectItem>
                                            <SelectItem
                                                v-for="region in regionsData"
                                                :key="region.id"
                                                :value="region.id"
                                            >
                                                {{ region.name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        :message="form.errors.region_id"
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

                <Dialog v-model:open="noteDialogOpen">
                    <DialogContent class="sm:max-w-[425px]">
                        <form @submit.prevent="createNote">
                            <DialogHeader>
                                <DialogTitle>
                                    Add Note to
                                    {{
                                        activeRegion
                                            ? getRegionNameFromId(
                                                  activeRegion.region_id,
                                              )
                                            : ''
                                    }}
                                </DialogTitle>
                                <DialogDescription>
                                    Choose the location within this region the
                                    note is for.
                                </DialogDescription>
                            </DialogHeader>
                            <div class="mb-4 grid gap-4">
                                <div class="grid gap-3">
                                    <Label for="location">Location</Label>
                                    <Select v-model="noteForm.location_id">
                                        <SelectTrigger
                                            id="location"
                                            class="w-full"
                                        >
                                            <SelectValue
                                                placeholder="Select a location"
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                v-for="location in locationOptions"
                                                :key="location.id"
                                                :value="location.id"
                                            >
                                                {{ location.name }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        :message="noteForm.errors.location_id"
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
                                    :disabled="noteForm.processing"
                                    class="cursor-pointer"
                                >
                                    {{
                                        noteForm.processing
                                            ? 'Saving...'
                                            : 'Save'
                                    }}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Card v-for="region in regions" :key="region.id" class="w-full">
                    <Collapsible v-model:open="isOpen">
                        <CardHeader
                            class="flex flex-row items-center justify-between space-y-0"
                        >
                            <div>
                                <CardTitle>{{
                                    getRegionNameFromId(region.region_id)
                                }}</CardTitle>
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
                                <div class="mt-2 mb-2">
                                    <Button
                                        variant="outline"
                                        class="cursor-pointer"
                                        @click="openAddNote(region)"
                                    >
                                        <Plus /> Add Note
                                    </Button>
                                </div>
                                <ul
                                    v-if="notesForRegion(region).length > 0"
                                    class="space-y-1"
                                >
                                    <li
                                        v-for="note in notesForRegion(region)"
                                        :key="note.id"
                                        class="rounded-md border px-3 py-2 text-sm"
                                    >
                                        {{
                                            getLocationName(
                                                region.region_id,
                                                note.location_id,
                                            )
                                        }}
                                    </li>
                                </ul>
                                <p v-else class="text-sm text-muted-foreground">
                                    No notes yet.
                                </p>
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
