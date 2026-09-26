<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { computed, watch } from 'vue';
import FormDialog from '@/components/FormDialog.vue';
import NoteFormFields from '@/components/runs/NoteFormFields.vue';
import { GENERAL_ID, useGameData } from '@/composables/useGameData';
import { firstItemsError, itemLinesToSubmit } from '@/lib/notes';
import { update } from '@/routes/runs/notes';
import type { Note, NoteFormData } from '@/types';

type Props = {
    runId: number;
    note: Note;
};

const props = defineProps<Props>();

const open = defineModel<boolean>('open', { required: true });

const { regionName } = useGameData();

const form = useForm<NoteFormData>({
    region_id: '',
    location_id: GENERAL_ID,
    note_text: '',
    items: [],
});

const itemsError = computed(() => firstItemsError(form.errors));

watch(
    open,
    (isOpen) => {
        if (!isOpen) {
            return;
        }

        form.clearErrors();
        form.region_id = props.note.region_id;
        form.location_id = props.note.location_id ?? GENERAL_ID;
        form.note_text = props.note.note_text ?? '';
        form.items = props.note.items.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
        }));
    },
    { immediate: true },
);

function updateNote() {
    form.items = itemLinesToSubmit(form.items);

    form.put(update.url({ run: props.runId, note: props.note.id }), {
        onSuccess: () => {
            open.value = false;
        },
    });
}
</script>

<template>
    <FormDialog
        v-model:open="open"
        :title="`Edit Note in ${regionName(props.note.region_id)}`"
        description="Update what you are carrying at this location."
        submit-label="Update"
        :processing="form.processing"
        @submit="updateNote"
    >
        <NoteFormFields
            v-model:location-id="form.location_id"
            v-model:items="form.items"
            v-model:note-text="form.note_text"
            :region-id="props.note.region_id"
            :location-error="form.errors.location_id"
            :items-error="itemsError"
            :note-text-error="form.errors.note_text"
        />
    </FormDialog>
</template>
