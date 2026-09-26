<script setup lang="ts">
import { Plus } from '@lucide/vue';
import InputError from '@/components/InputError.vue';
import NoteItemRow from '@/components/runs/NoteItemRow.vue';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { NoteItemLine } from '@/types';

type Props = {
    error?: string;
};

withDefaults(defineProps<Props>(), {
    error: undefined,
});

const lines = defineModel<NoteItemLine[]>({ required: true });

function addLine() {
    lines.value = [
        ...lines.value,
        { item_id: null, item_name: '', quantity: 1 },
    ];
}

function removeLine(index: number) {
    lines.value = lines.value.filter((_, position) => position !== index);
}
</script>

<template>
    <div class="grid min-w-0 gap-3">
        <Label>Items</Label>
        <NoteItemRow
            v-for="(line, index) in lines"
            :key="index"
            v-model:line="lines[index]"
            @remove="removeLine(index)"
        />
        <div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                class="cursor-pointer"
                @click="addLine"
            >
                <Plus /> Add Item
            </Button>
        </div>
        <InputError :message="error" />
    </div>
</template>
