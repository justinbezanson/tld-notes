<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
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
import { store } from '@/routes/runs/regions';

type Props = {
    runId: number;
};

const props = defineProps<Props>();

const open = defineModel<boolean>('open', { required: true });

const { regionOptions } = useGameData();

const form = useForm({
    region_id: GENERAL_ID,
});

function createRegion() {
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
        title="Add New Region"
        description="Add a new region to your save file. Click save when you're done."
        :processing="form.processing"
        @submit="createRegion"
    >
        <FormField id="region" label="Region" :error="form.errors.region_id">
            <Select v-model="form.region_id">
                <SelectTrigger id="region" class="w-full">
                    <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem
                        v-for="option in regionOptions"
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
