import type { Note, NoteItem, NoteItemLine, Region, Run, User } from '@/types';

const timestamp = '2026-01-01T00:00:00.000000Z';

export function makeUser(overrides: Partial<User> = {}): User {
    return {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        email_verified_at: null,
        avatar: '',
        created_at: timestamp,
        updated_at: timestamp,
        ...overrides,
    };
}

export function makeRun(overrides: Partial<Run> = {}): Run {
    return {
        id: 1,
        user_id: 1,
        name: 'My Run',
        run_type: 'CUSTOM',
        created_at: timestamp,
        updated_at: timestamp,
        ...overrides,
    };
}

export function makeRegion(overrides: Partial<Region> = {}): Region {
    return {
        id: 1,
        user_id: 1,
        run_id: 1,
        region_id: 'GENERAL',
        created_at: timestamp,
        updated_at: timestamp,
        ...overrides,
    };
}

export function makeNote(overrides: Partial<Note> = {}): Note {
    return {
        id: 1,
        run_id: 1,
        user_id: 1,
        region_id: 'GENERAL',
        location_id: null,
        note_text: null,
        items: [],
        created_at: timestamp,
        updated_at: timestamp,
        ...overrides,
    };
}

export function makeNoteItemLine(
    overrides: Partial<NoteItemLine> = {},
): NoteItemLine {
    return {
        item_id: null,
        item_name: '',
        quantity: 1,
        ...overrides,
    };
}

export function makeNoteItem(overrides: Partial<NoteItem> = {}): NoteItem {
    return {
        id: 1,
        note_id: 1,
        item_id: null,
        item_name: '',
        quantity: 1,
        created_at: timestamp,
        updated_at: timestamp,
        ...overrides,
    };
}
