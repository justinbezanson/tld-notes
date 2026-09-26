<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { computed, watch } from 'vue';
import FormDialog from '@/components/FormDialog.vue';
import FormField from '@/components/FormField.vue';
import NoteItemsField from '@/components/runs/NoteItemsField.vue';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GENERAL_ID, useGameData } from '@/composables/useGameData';
import { store } from '@/routes/runs/notes';
import type { NoteItemLine, Region } from '@/types';

type Props = {
    runId: number;
    region: Region | null;
};

const props = defineProps<Props>();

const open = defineModel<boolean>('open', { required: true });

const { regionName, locationOptionsFor } = useGameData();

const form = useForm({
    region_id: '',
    location_id: GENERAL_ID,
    note_text: '',
    items: [] as NoteItemLine[],
});

const locationOptions = computed(() =>
    props.region ? locationOptionsFor(props.region.region_id) : [],
);

const itemsError = computed(() => {
    const match = Object.entries(form.errors).find(([field]) =>
        field.startsWith('items.'),
    );

    return match?.[1];
});

watch(open, (isOpen) => {
    if (!isOpen || !props.region) {
        return;
    }

    form.clearErrors();
    form.reset();
    form.region_id = props.region.region_id;
});

function createNote() {
    form.items = form.items.filter(
        (line) => line.item_id !== null || line.item_name !== '',
    );

    form.post(store.url(props.runId), {
        onSuccess: () => {
            open.value = false;
            form.reset();
        },
    });
}
</script>

<template>
    <FormDialog
        v-model:open="open"
        :title="
            region ? `Add Note to ${regionName(region.region_id)}` : 'Add Note'
        "
        description="Log what you are carrying at this location."
        :processing="form.processing"
        @submit="createNote"
    >
        <FormField
            id="location"
            label="Location"
            :error="form.errors.location_id"
        >
            <Select v-model="form.location_id">
                <SelectTrigger id="location" class="w-full">
                    <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="option in locationOptions"
                        :key="option.id"
                        :value="option.id"
                    >
                        {{ option.name }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </FormField>

        <NoteItemsField v-model="form.items" :error="itemsError" />

        <FormField id="note_text" label="Notes" :error="form.errors.note_text">
            <Textarea
                id="note_text"
                v-model="form.note_text"
                placeholder="Anything else worth remembering about this spot..."
                rows="4"
            />
        </FormField>
    </FormDialog>
</template>
