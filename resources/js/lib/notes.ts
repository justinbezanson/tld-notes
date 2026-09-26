import type { Note } from '@/types';

export function groupNotesByRegion(notes: Note[]): Map<string, Note[]> {
    const grouped = new Map<string, Note[]>();

    for (const note of notes) {
        const existing = grouped.get(note.region_id);

        if (existing) {
            existing.push(note);
        } else {
            grouped.set(note.region_id, [note]);
        }
    }

    return grouped;
}

export function notesForRegion(
    grouped: Map<string, Note[]>,
    regionId: string,
): Note[] {
    return grouped.get(regionId) ?? [];
}
