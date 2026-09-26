<script setup lang="ts">
import { Check, Search } from '@lucide/vue';
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useGameItems } from '@/composables/useGameItems';
import type { GameItem } from '@/composables/useGameItems';

export type ItemSelection = {
    item_id: string | null;
    item_name: string;
};

type Props = {
    placeholder?: string;
};

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select an item',
});

const selected = defineModel<ItemSelection | null>({ required: true });

const { search } = useGameItems();

const open = ref(false);
const query = ref('');

const results = computed(() => search(query.value));

const hasSelection = computed(
    () => selected.value !== null && selected.value.item_name !== '',
);

watch(open, (isOpen) => {
    if (!isOpen) {
        query.value = '';
    }
});

function select(item: GameItem) {
    selected.value = { item_id: item.id, item_name: item.name };
    open.value = false;
}
</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button
                variant="outline"
                role="combobox"
                :aria-expanded="open"
                class="w-full cursor-pointer justify-between"
                :class="!hasSelection && 'text-muted-foreground'"
            >
                <span class="truncate">
                    {{ hasSelection ? selected?.item_name : props.placeholder }}
                </span>
                <Search v-if="!hasSelection" class="h-4 w-4 opacity-50" />
                <Check v-else class="h-4 w-4 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent
            class="w-(--reka-popover-trigger-width) p-0"
            align="start"
        >
            <div class="border-b p-2">
                <Input
                    v-model="query"
                    placeholder="Search items..."
                    class="h-8"
                />
            </div>
            <div class="max-h-64 overflow-y-auto p-1">
                <div v-for="group in results" :key="group.title">
                    <div
                        class="px-2 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                        {{ group.title }}
                    </div>
                    <button
                        v-for="item in group.items"
                        :key="item.id"
                        type="button"
                        class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        @click="select(item)"
                    >
                        <span class="truncate">{{ item.name }}</span>
                        <Check
                            v-if="selected?.item_id === item.id"
                            class="h-4 w-4 shrink-0"
                        />
                    </button>
                </div>
                <p
                    v-if="results.length === 0"
                    class="p-4 text-center text-sm text-muted-foreground"
                >
                    No items match "{{ query }}".
                </p>
            </div>
        </PopoverContent>
    </Popover>
</template>
