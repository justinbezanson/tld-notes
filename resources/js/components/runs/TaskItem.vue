<script setup lang="ts">
import { Check, Pencil, Trash2, X } from '@lucide/vue';
import { nextTick, ref, watch } from 'vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { isBlankDescription } from '@/lib/tasks';
import type { TaskRow } from '@/lib/tasks';

type Props = {
    task: TaskRow;
    editing: boolean;
    processing?: boolean;
    error?: string;
};

const props = withDefaults(defineProps<Props>(), {
    processing: false,
    error: undefined,
});

const description = defineModel<string>('description', { required: true });

const emit = defineEmits<{
    toggle: [task: TaskRow];
    edit: [task: TaskRow];
    save: [task: TaskRow];
    delete: [task: TaskRow];
    cancel: [];
}>();

const form = ref<HTMLFormElement | null>(null);

watch(
    () => props.editing,
    async (editing) => {
        if (!editing) {
            return;
        }

        await nextTick();
        form.value?.querySelector('input')?.focus();
    },
    { immediate: true },
);
</script>

<template>
    <li class="flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
        <Checkbox
            :model-value="props.task.status"
            :disabled="props.editing"
            :aria-label="
                props.task.status
                    ? 'Mark task incomplete'
                    : 'Mark task complete'
            "
            class="mt-0.5"
            @update:model-value="emit('toggle', props.task)"
        />

        <div class="min-w-0 flex-1">
            <form
                v-if="props.editing"
                ref="form"
                class="flex min-w-0 items-center gap-1"
                @submit.prevent="emit('save', props.task)"
            >
                <Input
                    v-model="description"
                    aria-label="Task description"
                    placeholder="Task description"
                />

                <Button
                    type="submit"
                    size="icon-sm"
                    title="Save task"
                    class="cursor-pointer"
                    :disabled="
                        props.processing || isBlankDescription(description)
                    "
                >
                    <Check class="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    title="Delete task"
                    class="cursor-pointer text-muted-foreground hover:text-destructive"
                    @click="emit('delete', props.task)"
                >
                    <Trash2 class="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    title="Cancel edit"
                    class="cursor-pointer text-muted-foreground hover:text-foreground"
                    @click="emit('cancel')"
                >
                    <X class="h-4 w-4" />
                </Button>
            </form>

            <p
                v-else
                class="min-w-0 break-words"
                :class="
                    props.task.status
                        ? 'text-muted-foreground line-through'
                        : undefined
                "
            >
                {{ props.task.description }}
            </p>

            <InputError v-if="props.editing" :message="props.error" />
        </div>

        <Button
            v-if="!props.editing"
            type="button"
            variant="ghost"
            size="icon"
            title="Edit task"
            class="h-7 w-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
            @click="emit('edit', props.task)"
        >
            <Pencil class="h-4 w-4" />
        </Button>
    </li>
</template>
