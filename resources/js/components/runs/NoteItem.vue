<script setup lang="ts">
import { Pencil } from '@lucide/vue';
import { Button } from '@/components/ui/button';
import { useGameData } from '@/composables/useGameData';
import type { Note } from '@/types';

type Props = {
    note: Note;
    regionId: string;
};

const props = defineProps<Props>();

const emit = defineEmits<{
    edit: [note: Note];
}>();

const { locationName } = useGameData();
</script>

<template>
    <li class="rounded-md border px-3 py-2 text-sm">
        <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
                <p class="font-medium">
                    {{ locationName(props.regionId, props.note.location_id) }}
                </p>

                <ul v-if="props.note.items.length > 0" class="mt-2 space-y-0.5">
                    <li
                        v-for="item in props.note.items"
                        :key="item.id"
                        class="flex items-baseline gap-2 text-muted-foreground"
                    >
                        <span
                            class="w-9 shrink-0 text-right font-medium text-foreground tabular-nums"
                        >
                            {{ item.quantity }}&times;
                        </span>
                        <span>{{ item.item_name }}</span>
                    </li>
                </ul>

                <p
                    v-if="props.note.note_text"
                    class="mt-2 whitespace-pre-line text-muted-foreground"
                >
                    {{ props.note.note_text }}
                </p>
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Edit note"
                class="h-7 w-7 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                @click="emit('edit', props.note)"
            >
                <Pencil class="h-4 w-4" />
            </Button>
        </div>
    </li>
</template>
