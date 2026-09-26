<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3';
import { Pencil, Plus, Trash } from '@lucide/vue';
import { computed, ref } from 'vue';
import FormDialog from '@/components/FormDialog.vue';
import FormField from '@/components/FormField.vue';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard } from '@/routes';
import { destroy, show, store, update } from '@/routes/runs';
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

const deleteDescription = computed(() =>
    runToDelete.value
        ? `Are you sure you want to delete "${runToDelete.value.name}"? This action cannot be undone.`
        : 'This action cannot be undone.',
);

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
            <FormDialog
                v-model:open="dialogOpen"
                title="Add New Run"
                description="Add a new run to your save files. Click save when you're done."
                :processing="form.processing"
                @submit="createRun"
            >
                <template #trigger>
                    <Button
                        variant="outline"
                        size="icon"
                        title="Create a new run"
                        class="cursor-pointer"
                    >
                        <Plus />
                    </Button>
                </template>

                <FormField id="name" label="Name" :error="form.errors.name">
                    <Input
                        id="name"
                        v-model="form.name"
                        name="name"
                        placeholder="Road to 500"
                        required
                    />
                </FormField>

                <FormField
                    id="run_type"
                    label="Run Type"
                    :error="form.errors.run_type"
                >
                    <Select v-model="form.run_type">
                        <SelectTrigger id="run_type" class="w-full">
                            <SelectValue placeholder="Select a run type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PILGRIM">Pilgrim</SelectItem>
                            <SelectItem value="VOYAGER">Voyager</SelectItem>
                            <SelectItem value="STALKER">Stalker</SelectItem>
                            <SelectItem value="INTERLOPER"
                                >Interloper</SelectItem
                            >
                            <SelectItem value="MISERY">Misery</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>
            </FormDialog>
        </div>

        <div v-if="props.runs.length === 0">
            <p>No runs found.</p>
        </div>

        <div
            v-else
            class="regions-container grid grid-cols-1 gap-4 text-left md:grid-cols-3"
        >
            <Card v-for="run in props.runs" :key="run.id">
                <CardHeader>
                    <CardTitle class="text-2xl">
                        <a :href="show.url(run.id)" class="hover:underline">
                            {{ run.name }}
                        </a>
                    </CardTitle>
                    <CardDescription>{{ run.run_type }}</CardDescription>
                </CardHeader>
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

        <FormDialog
            v-model:open="editDialogOpen"
            title="Edit Run"
            description="Update the settings for your run. Click save when you're done."
            :processing="editForm.processing"
            @submit="updateRun"
        >
            <FormField
                id="edit-name"
                label="Name"
                :error="editForm.errors.name"
            >
                <Input
                    id="edit-name"
                    v-model="editForm.name"
                    name="name"
                    placeholder="Road to 500"
                    required
                />
            </FormField>

            <FormField
                id="edit-run_type"
                label="Run Type"
                :error="editForm.errors.run_type"
            >
                <Select v-model="editForm.run_type">
                    <SelectTrigger id="edit-run_type" class="w-full">
                        <SelectValue placeholder="Select a run type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PILGRIM">Pilgrim</SelectItem>
                        <SelectItem value="VOYAGER">Voyager</SelectItem>
                        <SelectItem value="STALKER">Stalker</SelectItem>
                        <SelectItem value="INTERLOPER">Interloper</SelectItem>
                        <SelectItem value="MISERY">Misery</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                </Select>
            </FormField>
        </FormDialog>

        <FormDialog
            v-model:open="deleteDialogOpen"
            title="Delete Run"
            :description="deleteDescription"
            submit-label="Delete"
            submit-variant="destructive"
            processing-label="Deleting..."
            :processing="deleteForm.processing"
            @submit="deleteRun"
        />
    </div>
</template>
