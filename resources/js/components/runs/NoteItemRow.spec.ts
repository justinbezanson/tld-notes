import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import NoteItemRow from '@/components/runs/NoteItemRow.vue';
import { makeNoteItemLine } from '@/test/factories';
import type { NoteItemLine } from '@/types';

function mountRow(line: NoteItemLine = makeNoteItemLine()) {
    return mount(NoteItemRow, {
        props: { line },
    });
}

describe('line to picker', () => {
    it('shows the placeholder for an untouched row', () => {
        expect(mountRow().text()).toContain('Select an item');
    });

    it('shows the item name for a picked row', () => {
        expect(
            mountRow(
                makeNoteItemLine({ item_id: 'GEAR_Rope', item_name: 'Rope' }),
            ).text(),
        ).toContain('Rope');
    });

    it('writes the picked item back onto the line', async () => {
        const line = makeNoteItemLine();
        const wrapper = mountRow(line);

        wrapper
            .findComponent({ name: 'ItemPicker' })
            .vm.$emit('update:modelValue', {
                item_id: 'GEAR_Rope',
                item_name: 'Rope',
            });
        await wrapper.vm.$nextTick();

        expect(wrapper.props('line')).toMatchObject({
            item_id: 'GEAR_Rope',
            item_name: 'Rope',
        });
    });

    it('clears the line when the picker is cleared', async () => {
        const wrapper = mountRow(
            makeNoteItemLine({ item_id: 'GEAR_Rope', item_name: 'Rope' }),
        );

        wrapper
            .findComponent({ name: 'ItemPicker' })
            .vm.$emit('update:modelValue', null);
        await wrapper.vm.$nextTick();

        expect(wrapper.props('line')).toMatchObject({
            item_id: null,
            item_name: '',
        });
    });

    it('keeps a row the user only renamed', () => {
        expect(
            mountRow(makeNoteItemLine({ item_name: 'Bandage' })).text(),
        ).toContain('Bandage');
    });
});

describe('quantity', () => {
    it('starts at one', () => {
        expect(
            mountRow().get<HTMLInputElement>('input[aria-label="Quantity"]')
                .element.value,
        ).toBe('1');
    });

    it('reflects the line quantity', () => {
        const wrapper = mountRow(makeNoteItemLine({ quantity: 7 }));

        expect(
            wrapper.get<HTMLInputElement>('input[aria-label="Quantity"]')
                .element.value,
        ).toBe('7');
    });

    it('falls back to one when cleared', async () => {
        const wrapper = mountRow(makeNoteItemLine({ quantity: 4 }));

        wrapper
            .findComponent({ name: 'NumberField' })
            .vm.$emit('update:modelValue', undefined);
        await wrapper.vm.$nextTick();

        expect(wrapper.props('line').quantity).toBe(1);
    });

    it('writes an incremented quantity back to the line', async () => {
        const wrapper = mountRow(makeNoteItemLine({ quantity: 2 }));

        wrapper
            .findComponent({ name: 'NumberField' })
            .vm.$emit('update:modelValue', 5);
        await wrapper.vm.$nextTick();

        expect(wrapper.props('line').quantity).toBe(5);
    });
});

describe('removing', () => {
    it('emits remove from the trash button', async () => {
        const wrapper = mountRow();

        await wrapper.find('button[title="Remove item"]').trigger('click');

        expect(wrapper.emitted('remove')).toHaveLength(1);
    });

    it('does not submit the surrounding form', () => {
        // Project rule: shadcn Button has no default type.
        expect(
            mountRow().find('button[title="Remove item"]').attributes('type'),
        ).toBe('button');
    });
});
