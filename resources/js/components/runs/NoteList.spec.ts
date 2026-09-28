import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import NoteList from '@/components/runs/NoteList.vue';
import { makeNote, makeNoteItem } from '@/test/factories';
import type { Note } from '@/types';

const runId = 4;

function mountList(notes: Note[], regionId = 'blackrock') {
    return mount(NoteList, {
        props: { runId, regionId, notes },
    });
}

describe('with no notes', () => {
    it('shows an empty state', () => {
        expect(mountList([]).text()).toContain('No notes yet');
    });

    it('does not render the update dialog until a note is chosen', () => {
        expect(
            mountList([]).findComponent({ name: 'UpdateNoteDialog' }).exists(),
        ).toBe(false);
    });
});

describe('with notes', () => {
    it('renders one row per note', () => {
        const wrapper = mountList([makeNote({ id: 1 }), makeNote({ id: 2 })]);

        expect(wrapper.findAllComponents({ name: 'NoteItem' })).toHaveLength(2);
    });

    it('passes the region down so rows can resolve location names', () => {
        const wrapper = mountList([makeNote({ id: 1 })]);

        expect(
            wrapper.findComponent({ name: 'NoteItem' }).props('regionId'),
        ).toBe('blackrock');
    });

    it('resolves the location name for a note', () => {
        const note = makeNote({ location_id: 'blackrock-prison' });

        expect(mountList([note]).text()).toContain('Blackrock Prison');
    });
});

describe('editing a note', () => {
    const note = makeNote({ id: 8, region_id: 'blackrock' });

    it('opens the update dialog for the note that was edited', async () => {
        const wrapper = mountList([note]);

        await wrapper
            .findComponent({ name: 'NoteItem' })
            .vm.$emit('edit', note);
        await nextTick();

        const dialog = wrapper.findComponent({ name: 'UpdateNoteDialog' });

        expect(dialog.exists()).toBe(true);
        expect(dialog.props('open')).toBe(true);
        expect(dialog.props('note')).toEqual(note);
        expect(dialog.props('runId')).toBe(runId);
    });

    it('swaps to the note edited last', async () => {
        const other = makeNote({ id: 9, region_id: 'bleak-inlet' });
        const wrapper = mountList([note, other]);

        await wrapper
            .findAllComponents({ name: 'NoteItem' })[0]
            .vm.$emit('edit', note);
        await nextTick();
        await wrapper
            .findAllComponents({ name: 'NoteItem' })[1]
            .vm.$emit('edit', other);
        await nextTick();

        expect(
            wrapper.findComponent({ name: 'UpdateNoteDialog' }).props('note')
                .id,
        ).toBe(9);
    });
});

describe('NoteItem', () => {
    it('renders the note text when there is one', () => {
        expect(
            mountList([
                makeNote({ note_text: 'Left the ladder down here.' }),
            ]).text(),
        ).toContain('Left the ladder down here.');
    });

    it('renders each item with its quantity', () => {
        const note = makeNote({
            items: [
                makeNoteItem({ id: 1, item_name: 'Bandage', quantity: 3 }),
                makeNoteItem({ id: 2, item_name: 'Rope', quantity: 1 }),
            ],
        });
        const text = mountList([note]).text();

        expect(text).toContain('3×');
        expect(text).toContain('1×');
        expect(text).toContain('Bandage');
        expect(text).toContain('Rope');
    });

    it('shows General when the note has no location', () => {
        expect(mountList([makeNote()]).text()).toContain('General');
    });

    it('emits edit when the pencil is clicked', async () => {
        const note = makeNote();
        const wrapper = mountList([note]);

        await wrapper.find('button[title="Edit note"]').trigger('click');

        expect(
            wrapper.findComponent({ name: 'NoteItem' }).emitted('edit'),
        ).toEqual([[note]]);
    });
});
