import type { Note, NoteItemLine } from '@/types';

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

export function itemLinesToSubmit(lines: NoteItemLine[]): NoteItemLine[] {
    return lines.filter(
        (line) => line.item_id !== null || line.item_name !== '',
    );
}

export function firstItemsError(
    errors: Record<string, string | undefined>,
): string | undefined {
    return Object.entries(errors).find(([field]) =>
        field.startsWith('items.'),
    )?.[1];
}
