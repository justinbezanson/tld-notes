<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { Plus } from '@lucide/vue';
import { ref } from 'vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { store } from '@/routes/runs';
import type { Run } from '@/types';

const props = defineProps<{
    runs: Array<Run>;
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

const dialogOpen = ref(false);

const form = useForm({
    name: '',
    run_type: 'CUSTOM',
});

function createRun() {
    form.post(store.url(), {
        onSuccess: () => {
            dialogOpen.value = false;
            form.reset();
        },
    });
}

// const runs: Array<Run> = [
//     {
//         id: 1,
//         user_id: 1,
//         name: 'Road To 500 Days',
//         run_type: 'INTERLOPER',
//         created_at: '2024-06-01T12:00:00Z',
//         updated_at: '2024-06-01T12:00:00Z',
//     },
//     {
//         id: 2,
//         user_id: 1,
//         name: 'Stalker',
//         run_type: 'STALKER',
//         created_at: '2024-06-01T12:00:00Z',
//         updated_at: '2024-06-01T12:00:00Z',
//     },
//     {
//         id: 3,
//         user_id: 1,
//         name: 'All Achievements',
//         run_type: 'VOYAGER',
//         created_at: '2024-06-01T12:00:00Z',
//         updated_at: '2024-06-01T12:00:00Z',
//     },
// ];
</script>

<template>
    <Head title="Dashboard" />

    <div
        class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
    >
        <div
            class="flex w-full items-center justify-center gap-2 md:justify-start md:text-left"
        >
            <h1 class="mr-4">Save Files</h1>
            <Dialog v-model:open="dialogOpen">
                <DialogTrigger as-child>
                    <Button variant="outline" title="Create a new run">
                        <Plus />
                    </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-[425px]">
                    <form @submit.prevent="createRun">
                        <DialogHeader>
                            <DialogTitle>Add New Run</DialogTitle>
                            <DialogDescription>
                                Add a new run to your save files. Click save
                                when you're done.
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
                                    <SelectTrigger id="run_type" class="w-full">
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
                                <InputError :message="form.errors.run_type" />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose as-child>
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" :disabled="form.processing">
                                {{ form.processing ? 'Saving...' : 'Save' }}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <div v-if="props.runs.length === 0">
            <p>No runs found.</p>
        </div>

        <div
            class="regions-container grid grid-cols-1 gap-4 text-left md:grid-cols-3"
        >
            <Card v-for="run in props.runs" :key="run.id">
                <CardHeader>
                    <CardTitle class="text-2xl">{{ run.name }}</CardTitle>
                    <CardDescription>{{ run.run_type }}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p class="text-gray-500">Updated: {{ run.updated_at }}</p>
                </CardContent>
                <CardFooter>
                    <p>
                        <Button>Load</Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    </div>
</template>
