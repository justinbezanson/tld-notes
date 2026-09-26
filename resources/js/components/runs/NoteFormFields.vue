<script setup lang="ts">
import { computed } from 'vue';
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
import { useGameData } from '@/composables/useGameData';
import type { NoteItemLine } from '@/types';

type Props = {
    regionId: string;
    locationError?: string;
    itemsError?: string;
    noteTextError?: string;
};

const props = withDefaults(defineProps<Props>(), {
    locationError: undefined,
    itemsError: undefined,
    noteTextError: undefined,
});

const locationId = defineModel<string>('locationId', { required: true });
const items = defineModel<NoteItemLine[]>('items', { required: true });
const noteText = defineModel<string>('noteText', { required: true });

const { locationOptionsFor } = useGameData();

const locationOptions = computed(() => locationOptionsFor(props.regionId));
</script>

<template>
    <FormField id="location" label="Location" :error="props.locationError">
        <Select v-model="locationId">
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

    <NoteItemsField v-model="items" :error="props.itemsError" />

    <FormField id="note_text" label="Notes" :error="props.noteTextError">
        <Textarea
            id="note_text"
            v-model="noteText"
            placeholder="Anything else worth remembering about this spot..."
            rows="4"
        />
    </FormField>
</template>
