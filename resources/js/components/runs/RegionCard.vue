<script setup lang="ts">
import { ChevronsUpDown, Plus } from '@lucide/vue';
import NoteList from '@/components/runs/NoteList.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useGameData } from '@/composables/useGameData';
import type { Note, Region } from '@/types';

type Props = {
    region: Region;
    notes: Note[];
    open: boolean;
};

const props = defineProps<Props>();

const emit = defineEmits<{
    toggle: [regionId: string];
    addNote: [region: Region];
}>();

const { regionName } = useGameData();
</script>

<template>
    <Card class="w-full">
        <Collapsible
            :open="props.open"
            @update:open="emit('toggle', props.region.region_id)"
        >
            <CardHeader
                class="flex flex-row items-center justify-between space-y-0"
            >
                <CardTitle>{{ regionName(props.region.region_id) }}</CardTitle>

                <CollapsibleTrigger as-child>
                    <Button
                        variant="ghost"
                        size="sm"
                        class="w-9 cursor-pointer p-0"
                    >
                        <ChevronsUpDown class="h-4 w-4" />
                        <span class="sr-only">Toggle Content</span>
                    </Button>
                </CollapsibleTrigger>
            </CardHeader>

            <CollapsibleContent
                class="data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down transition-all"
            >
                <CardContent>
                    <div class="mt-2 mb-2">
                        <Button
                            variant="outline"
                            class="cursor-pointer"
                            @click="emit('addNote', props.region)"
                        >
                            <Plus /> Add Note
                        </Button>
                    </div>

                    <NoteList
                        :region-id="props.region.region_id"
                        :notes="props.notes"
                    />
                </CardContent>
            </CollapsibleContent>
        </Collapsible>
    </Card>
</template>
