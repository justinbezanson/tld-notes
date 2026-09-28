import { describe, expect, it } from 'vitest';
import {
    firstItemsError,
    groupNotesByRegion,
    itemLinesToSubmit,
    notesForRegion,
} from '@/lib/notes';
import { makeNote, makeNoteItemLine } from '@/test/factories';

describe('groupNotesByRegion', () => {
    it('returns an empty map when there are no notes', () => {
        expect(groupNotesByRegion([]).size).toBe(0);
    });

    it('buckets notes by region_id', () => {
        const grouped = groupNotesByRegion([
            makeNote({ id: 1, region_id: 'GENERAL' }),
            makeNote({ id: 2, region_id: 'SHALLOW_SHELVES' }),
            makeNote({ id: 3, region_id: 'GENERAL' }),
        ]);

        expect([...grouped.keys()]).toEqual(['GENERAL', 'SHALLOW_SHELVES']);
        expect(grouped.get('GENERAL')?.map((note) => note.id)).toEqual([1, 3]);
    });

    it('builds fresh buckets per call so callers cannot share arrays', () => {
        const note = makeNote({ region_id: 'GENERAL' });
        const grouped = groupNotesByRegion([note]);

        grouped.get('GENERAL')?.push(makeNote({ id: 2 }));

        expect(groupNotesByRegion([note]).get('GENERAL')).toHaveLength(1);
    });
});

describe('notesForRegion', () => {
    it('returns the notes in the matching bucket', () => {
        const first = makeNote({ region_id: 'GENERAL' });
        const grouped = groupNotesByRegion([
            first,
            makeNote({ id: 2, region_id: 'MARSH' }),
        ]);

        expect(notesForRegion(grouped, 'GENERAL')).toEqual([first]);
    });

    it('returns an empty array for a region with no notes', () => {
        expect(notesForRegion(new Map(), 'MARSH')).toEqual([]);
    });
});

describe('itemLinesToSubmit', () => {
    it('drops untouched rows', () => {
        const filled = makeNoteItemLine({
            item_id: 'GEAR_1',
            item_name: 'Bandage',
        });

        expect(itemLinesToSubmit([makeNoteItemLine(), filled])).toEqual([
            filled,
        ]);
    });

    it('keeps a row the user only named', () => {
        const named = makeNoteItemLine({ item_name: 'Bandage' });

        expect(itemLinesToSubmit([named])).toEqual([named]);
    });

    it('keeps a row whose item was picked but whose name was cleared', () => {
        const picked = makeNoteItemLine({ item_id: 'GEAR_1' });

        expect(itemLinesToSubmit([picked])).toEqual([picked]);
    });

    it('does not mutate the rows it was given', () => {
        const rows = [
            makeNoteItemLine(),
            makeNoteItemLine({ item_id: 'GEAR_1' }),
        ];

        itemLinesToSubmit(rows);

        expect(rows).toHaveLength(2);
    });
});

describe('firstItemsError', () => {
    it('returns the first items error', () => {
        expect(
            firstItemsError({
                'items.0.quantity': 'The quantity must be at least 1.',
                'items.1.quantity': 'Ignored.',
            }),
        ).toBe('The quantity must be at least 1.');
    });

    it('ignores errors outside the items repeater', () => {
        expect(firstItemsError({ note_text: 'Nope.' })).toBeUndefined();
    });

    it('ignores a key that merely contains items', () => {
        expect(
            firstItemsError({ items: 'Not a repeater error.' }),
        ).toBeUndefined();
    });

    it('returns undefined when there are no errors', () => {
        expect(firstItemsError({})).toBeUndefined();
    });
});
