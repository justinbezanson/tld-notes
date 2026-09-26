<script setup lang="ts">
import { MapPin } from '@lucide/vue';
import EmptyState from '@/components/EmptyState.vue';
import NoteItem from '@/components/runs/NoteItem.vue';
import type { Note } from '@/types';

type Props = {
    regionId: string;
    notes: Note[];
};

const props = defineProps<Props>();
</script>

<template>
    <ul v-if="props.notes.length > 0" class="space-y-2">
        <NoteItem
            v-for="note in props.notes"
            :key="note.id"
            :note="note"
            :region-id="props.regionId"
        />
    </ul>

    <EmptyState
        v-else
        compact
        title="No notes yet"
        description="Add a note to start tracking this region."
    >
        <template #icon>
            <MapPin class="h-5 w-5 text-muted-foreground" />
        </template>
    </EmptyState>
</template>
