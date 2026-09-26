<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { computed, watch } from 'vue';
import FormDialog from '@/components/FormDialog.vue';
import FormField from '@/components/FormField.vue';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { GENERAL_ID, useGameData } from '@/composables/useGameData';
import { store } from '@/routes/runs/notes';
import type { Region } from '@/types';

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
});

const locationOptions = computed(() =>
    props.region ? locationOptionsFor(props.region.region_id) : [],
);

watch(open, (isOpen) => {
    if (!isOpen || !props.region) {
        return;
    }

    form.clearErrors();
    form.reset();
    form.region_id = props.region.region_id;
});

function createNote() {
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
        description="Choose the location within this region the note is for."
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
    </FormDialog>
</template>
