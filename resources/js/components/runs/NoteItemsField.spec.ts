import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import NoteItemsField from '@/components/runs/NoteItemsField.vue';
import { makeNoteItemLine } from '@/test/factories';
import type { NoteItemLine } from '@/types';

function mountField(lines: NoteItemLine[] = []) {
    return mount(NoteItemsField, {
        props: { modelValue: lines },
    });
}

function rows(wrapper: ReturnType<typeof mountField>) {
    return wrapper.findAllComponents({ name: 'NoteItemRow' });
}

function addItemButton(wrapper: ReturnType<typeof mountField>) {
    return wrapper
        .findAll('button')
        .find((button) => button.text().includes('Add Item'))!;
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('adding a row', () => {
    it('appends a blank line', async () => {
        const wrapper = mountField();

        await addItemButton(wrapper).trigger('click');

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
            { item_id: null, item_name: '', quantity: 1 },
        ]);
    });

    it('appends after the existing lines', async () => {
        const wrapper = mountField([makeNoteItemLine({ item_name: 'Rope' })]);

        await addItemButton(wrapper).trigger('click');

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toHaveLength(
            2,
        );
    });

    it('does not submit the surrounding form', () => {
        // Project rule: shadcn Button has no default type, so a missing
        // type="button" here silently saved the note instead of adding a row.
        expect(addItemButton(mountField()).attributes('type')).toBe('button');
    });
});

describe('removing a row', () => {
    it('drops the row at that index', async () => {
        const first = makeNoteItemLine({ item_name: 'Rope' });
        const second = makeNoteItemLine({ item_name: 'Bandage' });
        const wrapper = mountField([first, second]);

        await rows(wrapper)[0].vm.$emit('remove');
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
            second,
        ]);
    });

    it('can remove the last remaining row', async () => {
        const wrapper = mountField([makeNoteItemLine({ item_name: 'Rope' })]);

        await rows(wrapper)[0].vm.$emit('remove');
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([]);
    });
});

describe('error', () => {
    it('renders no message without an error', () => {
        expect(
            mountField([])
                .findComponent({ name: 'InputError' })
                .props('message'),
        ).toBeUndefined();
    });

    it('surfaces the repeater error once', () => {
        const wrapper = mount(NoteItemsField, {
            props: {
                modelValue: [],
                error: 'The quantity must be at least 1.',
            },
        });

        expect(wrapper.text()).toContain('The quantity must be at least 1.');
    });
});
