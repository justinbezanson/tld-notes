<script setup lang="ts">
import { Trash2 } from '@lucide/vue';
import { computed } from 'vue';
import ItemPicker from '@/components/items/ItemPicker.vue';
import type { ItemSelection } from '@/components/items/ItemPicker.vue';
import { Button } from '@/components/ui/button';
import {
    NumberField,
    NumberFieldContent,
    NumberFieldDecrement,
    NumberFieldIncrement,
    NumberFieldInput,
} from '@/components/ui/number-field';
import type { NoteItemLine } from '@/types';

const line = defineModel<NoteItemLine>('line', { required: true });

const emit = defineEmits<{
    remove: [];
}>();

const selection = computed<ItemSelection | null>({
    get: () =>
        line.value.item_id === null && line.value.item_name === ''
            ? null
            : { item_id: line.value.item_id, item_name: line.value.item_name },
    set: (value) => {
        line.value.item_id = value?.item_id ?? null;
        line.value.item_name = value?.item_name ?? '';
    },
});

const quantity = computed<number>({
    get: () => line.value.quantity,
    set: (value) => {
        line.value.quantity = value ?? 1;
    },
});
</script>

<template>
    <div class="flex w-full min-w-0 items-start gap-2">
        <div class="min-w-0 flex-1">
            <ItemPicker v-model="selection" />
        </div>
        <NumberField
            v-model="quantity"
            :min="1"
            :step="1"
            class="w-24 shrink-0"
        >
            <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput aria-label="Quantity" />
                <NumberFieldIncrement />
            </NumberFieldContent>
        </NumberField>
        <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Remove item"
            class="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
            @click="emit('remove')"
        >
            <Trash2 />
        </Button>
    </div>
</template>
