<script setup lang="ts">
import { MapPin } from '@lucide/vue';
import { ref } from 'vue';
import EmptyState from '@/components/EmptyState.vue';
import NoteItem from '@/components/runs/NoteItem.vue';
import UpdateNoteDialog from '@/components/runs/UpdateNoteDialog.vue';
import type { Note } from '@/types';

type Props = {
    runId: number;
    regionId: string;
    notes: Note[];
};

const props = defineProps<Props>();

const updateOpen = ref(false);
const editingNote = ref<Note | null>(null);

function requestEdit(note: Note) {
    editingNote.value = note;
    updateOpen.value = true;
}
</script>

<template>
    <ul v-if="props.notes.length > 0" class="space-y-2">
        <NoteItem
            v-for="note in props.notes"
            :key="note.id"
            :note="note"
            :region-id="props.regionId"
            @edit="requestEdit"
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

    <UpdateNoteDialog
        v-if="editingNote"
        v-model:open="updateOpen"
        :run-id="props.runId"
        :note="editingNote"
    />
</template>
