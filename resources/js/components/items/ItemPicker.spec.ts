import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import ItemPicker from '@/components/items/ItemPicker.vue';
import type { ItemSelection } from '@/components/items/ItemPicker.vue';
import { useGameItems } from '@/composables/useGameItems';
import {
    popoverInput,
    popoverOption,
    popoverText,
    typeInPopover,
} from '@/test/popover';

const { groups } = useGameItems();
const group = groups.find((candidate) => candidate.items.length > 0)!;
const sample = group.items[0];

function mountPicker(selected: ItemSelection | null = null) {
    return mount(ItemPicker, {
        props: { modelValue: selected },
        attachTo: document.body,
    });
}

async function openPopover(wrapper: ReturnType<typeof mountPicker>) {
    await wrapper.find('button[role="combobox"]').trigger('click');
    await nextTick();
}

function isExpanded(wrapper: ReturnType<typeof mountPicker>) {
    return wrapper.find('button[role="combobox"]').attributes('aria-expanded');
}

describe('trigger', () => {
    it('shows the placeholder with no selection', () => {
        expect(mountPicker().text()).toContain('Select an item');
    });

    it('shows the selected item name', () => {
        expect(
            mountPicker({ item_id: sample.id, item_name: sample.name }).text(),
        ).toContain(sample.name);
    });

    it('still shows the placeholder when only an id was picked', () => {
        // hasSelection keys off the name, so a nameless pick reads as empty.
        expect(
            mountPicker({ item_id: sample.id, item_name: '' }).text(),
        ).toContain('Select an item');
    });

    it('marks itself expanded while the popover is open', async () => {
        const wrapper = mountPicker();

        await openPopover(wrapper);

        expect(isExpanded(wrapper)).toBe('true');
    });
});

describe('options', () => {
    it('lists the group headings when the search is empty', async () => {
        await openPopover(mountPicker());

        expect(popoverText()).toContain(group.title);
    });

    it('filters by the search term', async () => {
        await openPopover(mountPicker());

        await typeInPopover('Search items...', sample.name.toUpperCase());

        expect(popoverText()).toContain(sample.name);
    });

    it('says so when nothing matches', async () => {
        await openPopover(mountPicker());

        await typeInPopover('Search items...', 'zzzznotanitem');

        expect(popoverText()).toContain('No items match "zzzznotanitem".');
    });
});

describe('selecting', () => {
    it('emits the picked item and closes', async () => {
        const wrapper = mountPicker();

        await openPopover(wrapper);
        popoverOption(sample.name).click();
        await nextTick();

        expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
            { item_id: sample.id, item_name: sample.name },
        ]);
        expect(isExpanded(wrapper)).toBe('false');
    });

    it('ticks the selected option', async () => {
        await openPopover(
            mountPicker({ item_id: sample.id, item_name: sample.name }),
        );

        expect(popoverOption(sample.name).querySelector('svg')).not.toBeNull();
    });

    it('clears the search when reopened', async () => {
        const wrapper = mountPicker();

        await openPopover(wrapper);
        await typeInPopover('Search items...', 'rope');

        await wrapper.find('button[role="combobox"]').trigger('click');
        await nextTick();
        await openPopover(wrapper);

        expect(popoverInput('Search items...').value).toBe('');
    });
});
