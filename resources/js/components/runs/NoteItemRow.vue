<script setup lang="ts">
import { Trash2 } from '@lucide/vue';
import { computed } from 'vue';
import ItemPicker from '@/components/items/ItemPicker.vue';
import type { ItemSelection } from '@/components/items/ItemPicker.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
</script>

<template>
    <div class="flex items-start gap-2">
        <div class="min-w-0 flex-1">
            <ItemPicker v-model="selection" />
        </div>
        <Input
            v-model.number="line.quantity"
            type="number"
            min="1"
            step="1"
            aria-label="Quantity"
            class="w-20"
        />
        <Button
            variant="ghost"
            size="icon"
            type="button"
            title="Remove item"
            class="cursor-pointer text-muted-foreground hover:text-destructive"
            @click="emit('remove')"
        >
            <Trash2 />
        </Button>
    </div>
</template>
