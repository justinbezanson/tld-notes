import type { NoteItem } from './note-item';

export type Note = {
    id: number;
    run_id: number;
    user_id: number;
    region_id: string;
    location_id: string | null;
    note_text: string | null;
    items: NoteItem[];
    created_at: string;
    updated_at: string;
};

export type NoteItemLine = {
    item_id: string | null;
    item_name: string;
    quantity: number;
};
