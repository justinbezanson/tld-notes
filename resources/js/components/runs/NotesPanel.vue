<script setup lang="ts">
import { Map, Plus } from '@lucide/vue';
import { computed, ref } from 'vue';
import EmptyState from '@/components/EmptyState.vue';
import AddNoteDialog from '@/components/runs/AddNoteDialog.vue';
import AddRegionDialog from '@/components/runs/AddRegionDialog.vue';
import RegionCard from '@/components/runs/RegionCard.vue';
import { Button } from '@/components/ui/button';
import { groupNotesByRegion, notesForRegion } from '@/lib/notes';
import type { Note, Region } from '@/types';

type Props = {
    runId: number;
    regions: Region[];
    notes: Note[];
};

const props = defineProps<Props>();

const addRegionOpen = ref(false);
const addNoteOpen = ref(false);
const addNoteRegion = ref<Region | null>(null);
const openRegionIds = ref(new Set<string>());

const groupedNotes = computed(() => groupNotesByRegion(props.notes));

function toggleRegion(regionId: string) {
    const next = new Set(openRegionIds.value);

    if (next.has(regionId)) {
        next.delete(regionId);
    } else {
        next.add(regionId);
    }

    openRegionIds.value = next;
}

function requestAddNote(region: Region) {
    addNoteRegion.value = region;
    addNoteOpen.value = true;
}
</script>

<template>
    <div>
        <AddRegionDialog v-model:open="addRegionOpen" :run-id="props.runId">
            <template #trigger>
                <Button
                    variant="outline"
                    title="Add new region"
                    class="mb-2 cursor-pointer"
                >
                    <Plus /> Add Region
                </Button>
            </template>
        </AddRegionDialog>

        <AddNoteDialog
            v-model:open="addNoteOpen"
            :run-id="props.runId"
            :region="addNoteRegion"
        />

        <EmptyState
            v-if="props.regions.length === 0"
            title="No regions yet"
            description="Add a region to start tracking your notes for this run."
        >
            <template #icon>
                <Map class="h-7 w-7 text-muted-foreground" />
            </template>
        </EmptyState>

        <div v-else class="space-y-4">
            <RegionCard
                v-for="region in props.regions"
                :key="region.id"
                :region="region"
                :notes="notesForRegion(groupedNotes, region.region_id)"
                :open="openRegionIds.has(region.region_id)"
                @toggle="toggleRegion"
                @add-note="requestAddNote"
            />
        </div>
    </div>
</template>
