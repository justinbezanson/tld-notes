<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { Plus, Pencil, Trash } from '@lucide/vue';
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
import { destroy, store, update } from '@/routes/runs';
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

const deleteDialogOpen = ref(false);
const runToDelete = ref<Run | null>(null);

const deleteForm = useForm({});

function requestDelete(run: Run) {
    runToDelete.value = run;
    deleteDialogOpen.value = true;
}

function deleteRun() {
    if (!runToDelete.value) {
        return;
    }

    deleteForm.delete(destroy.url(runToDelete.value.id), {
        preserveScroll: true,
        onSuccess: () => {
            deleteDialogOpen.value = false;
            runToDelete.value = null;
        },
    });
}

const editDialogOpen = ref(false);
const editingRun = ref<Run | null>(null);

const editForm = useForm({
    name: '',
    run_type: 'CUSTOM',
});

function requestEdit(run: Run) {
    editingRun.value = run;
    editForm.clearErrors();
    editForm.name = run.name;
    editForm.run_type = run.run_type;
    editDialogOpen.value = true;
}

function updateRun() {
    if (!editingRun.value) {
        return;
    }

    editForm.put(update.url(editingRun.value.id), {
        onSuccess: () => {
            editDialogOpen.value = false;
            editForm.reset();
            editingRun.value = null;
        },
    });
}
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
                    <Button
                        variant="outline"
                        title="Create a new run"
                        class="cursor-pointer"
                    >
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
                    <div class="flex w-full justify-end gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            title="Edit run"
                            class="cursor-pointer"
                            @click="requestEdit(run)"
                            ><Pencil
                        /></Button>
                        <Button
                            variant="outline"
                            size="icon"
                            class="cursor-pointer border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                            title="Delete run"
                            @click="requestDelete(run)"
                        >
                            <Trash />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>

        <Dialog v-model:open="editDialogOpen">
            <DialogContent class="sm:max-w-[425px]">
                <form @submit.prevent="updateRun">
                    <DialogHeader>
                        <DialogTitle>Edit Run</DialogTitle>
                        <DialogDescription>
                            Update the settings for your run. Click save when
                            you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div class="mb-4 grid gap-4">
                        <div class="grid gap-3">
                            <Label for="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                v-model="editForm.name"
                                name="name"
                                placeholder="Road to 500"
                                required
                            />
                            <InputError :message="editForm.errors.name" />
                        </div>
                        <div class="grid gap-3">
                            <Label for="edit-run_type">Run Type</Label>
                            <Select v-model="editForm.run_type">
                                <SelectTrigger
                                    id="edit-run_type"
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
                            <InputError :message="editForm.errors.run_type" />
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
                            :disabled="editForm.processing"
                            class="cursor-pointer"
                        >
                            {{ editForm.processing ? 'Saving...' : 'Save' }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog v-model:open="deleteDialogOpen">
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Run</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{{
                            runToDelete?.name
                        }}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
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
                        variant="destructive"
                        :disabled="deleteForm.processing"
                        class="cursor-pointer"
                        @click="deleteRun"
                    >
                        {{ deleteForm.processing ? 'Deleting...' : 'Delete' }}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
