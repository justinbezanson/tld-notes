<script setup lang="ts">
import { router, useForm } from '@inertiajs/vue3';
import { ListTodo, Plus } from '@lucide/vue';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import EmptyState from '@/components/EmptyState.vue';
import TaskItem from '@/components/runs/TaskItem.vue';
import { Button } from '@/components/ui/button';
import { isBlankDescription, sortTasks } from '@/lib/tasks';
import type { TaskRow } from '@/lib/tasks';
import { destroy, store, update } from '@/routes/runs/tasks';
import type { Task } from '@/types';

type Props = {
    runId: number;
    tasks: Task[];
};

const props = defineProps<Props>();

const newTaskForm = useForm({ description: '' });
const editTaskForm = useForm({ description: '' });

const taskRows = ref<TaskRow[]>(props.tasks.map((task) => ({ ...task })));
const adding = ref(false);
const editingTaskId = ref<number | null>(null);
const nextDraftId = ref(-1);

const busy = computed(() => adding.value || editingTaskId.value !== null);
const sortedTasks = computed(() => sortTasks(taskRows.value));

watch(
    () => props.tasks,
    (tasks) => {
        const drafts = taskRows.value.filter((task) => task.isNew);

        taskRows.value = [...tasks.map((task) => ({ ...task })), ...drafts];
    },
);

function isEditing(task: TaskRow): boolean {
    return task.isNew === true || editingTaskId.value === task.id;
}

function descriptionFor(task: TaskRow): string {
    return task.isNew === true
        ? newTaskForm.description
        : editTaskForm.description;
}

function descriptionError(task: TaskRow): string | undefined {
    return task.isNew === true
        ? newTaskForm.errors.description
        : editTaskForm.errors.description;
}

function descriptionProcessing(task: TaskRow): boolean {
    return task.isNew === true
        ? newTaskForm.processing
        : editTaskForm.processing;
}

function addTask(): void {
    if (busy.value) {
        return;
    }

    newTaskForm.reset();
    newTaskForm.clearErrors();
    adding.value = true;

    const draft: TaskRow = {
        id: nextDraftId.value,
        run_id: props.runId,
        status: false,
        description: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isNew: true,
    };

    nextDraftId.value -= 1;
    taskRows.value.push(draft);
}

function startEdit(task: TaskRow): void {
    if (busy.value || task.isNew === true) {
        return;
    }

    editTaskForm.reset();
    editTaskForm.clearErrors();
    editTaskForm.description = task.description;
    editingTaskId.value = task.id;
}

function updateDescription(task: TaskRow, value: string): void {
    if (task.isNew === true) {
        newTaskForm.description = value;

        return;
    }

    editTaskForm.description = value;
}

function saveTask(task: TaskRow): void {
    if (task.isNew === true) {
        saveNewTask(task);

        return;
    }

    saveEditedTask(task);
}

function saveNewTask(task: TaskRow): void {
    if (isBlankDescription(newTaskForm.description)) {
        return;
    }

    newTaskForm.description = newTaskForm.description.trim();

    newTaskForm.post(store.url(props.runId), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            taskRows.value = taskRows.value.filter((row) => row.id !== task.id);
            adding.value = false;
            newTaskForm.reset();
        },
    });
}

function saveEditedTask(task: TaskRow): void {
    if (isBlankDescription(editTaskForm.description)) {
        return;
    }

    const description = editTaskForm.description.trim();
    editTaskForm.description = description;

    editTaskForm.patch(update.url({ run: props.runId, task: task.id }), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            const row = taskRows.value.find((item) => item.id === task.id);

            if (row) {
                row.description = description;
            }

            cancelEdit();
        },
    });
}

function deleteTask(task: TaskRow): void {
    if (task.isNew === true) {
        cancelAdd();

        return;
    }

    router.delete(destroy.url({ run: props.runId, task: task.id }), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
            taskRows.value = taskRows.value.filter((row) => row.id !== task.id);

            if (editingTaskId.value === task.id) {
                cancelEdit();
            }
        },
    });
}

function toggleComplete(task: TaskRow): void {
    if (task.isNew === true || isEditing(task)) {
        return;
    }

    const previous = task.status;
    task.status = !task.status;

    router.patch(
        update.url({ run: props.runId, task: task.id }),
        { status: task.status },
        {
            preserveScroll: true,
            preserveState: true,
            onError: () => {
                const row = taskRows.value.find((item) => item.id === task.id);

                if (row) {
                    row.status = previous;
                }
            },
        },
    );
}

function cancelAdd(): void {
    taskRows.value = taskRows.value.filter((task) => task.isNew !== true);
    adding.value = false;
    newTaskForm.reset();
    newTaskForm.clearErrors();
}

function cancelEdit(): void {
    editingTaskId.value = null;
    editTaskForm.reset();
    editTaskForm.clearErrors();
}

function cancelEditing(): void {
    if (adding.value) {
        cancelAdd();

        return;
    }

    cancelEdit();
}

function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
        return;
    }

    if (adding.value) {
        event.preventDefault();
        cancelAdd();

        return;
    }

    if (editingTaskId.value !== null) {
        event.preventDefault();
        cancelEdit();
    }
}

onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
    <div class="space-y-4">
        <div>
            <Button
                type="button"
                class="cursor-pointer"
                :disabled="busy"
                @click="addTask"
            >
                <Plus /> Add Task
            </Button>
        </div>

        <ul v-if="sortedTasks.length > 0" class="space-y-2">
            <TaskItem
                v-for="task in sortedTasks"
                :key="task.id"
                :task="task"
                :editing="isEditing(task)"
                :description="descriptionFor(task)"
                :processing="descriptionProcessing(task)"
                :error="descriptionError(task)"
                @update:description="updateDescription(task, $event)"
                @toggle="toggleComplete"
                @edit="startEdit"
                @save="saveTask"
                @delete="deleteTask"
                @cancel="cancelEditing"
            />
        </ul>

        <EmptyState
            v-else
            title="There are no tasks to display"
            description="Add a task to start tracking your goals for this run."
        >
            <template #icon>
                <ListTodo class="h-5 w-5 text-muted-foreground" />
            </template>
        </EmptyState>
    </div>
</template>
