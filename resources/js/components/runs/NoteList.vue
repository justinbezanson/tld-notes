<script setup lang="ts">
import { MapPin } from '@lucide/vue';
import EmptyState from '@/components/EmptyState.vue';
import { useGameData } from '@/composables/useGameData';
import type { Note } from '@/types';

type Props = {
    regionId: string;
    notes: Note[];
};

const props = defineProps<Props>();

const { locationName } = useGameData();
</script>

<template>
    <ul v-if="props.notes.length > 0" class="space-y-1">
        <li
            v-for="note in props.notes"
            :key="note.id"
            class="rounded-md border px-3 py-2 text-sm"
        >
            {{ locationName(props.regionId, note.location_id) }}
        </li>
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
