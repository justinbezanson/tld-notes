import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import AppearanceTabs from '@/components/AppearanceTabs.vue';
import { useAppearance } from '@/composables/useAppearance';

function mountTabs() {
    return mount(AppearanceTabs);
}

function tab(wrapper: ReturnType<typeof mountTabs>, label: string) {
    return wrapper
        .findAll('button')
        .find((button) => button.text().trim() === label)!;
}

beforeEach(() => {
    localStorage.removeItem('appearance');
});

describe('AppearanceTabs', () => {
    it('offers the three appearance options', () => {
        const labels = mountTabs()
            .findAll('button')
            .map((button) => button.text().trim());

        expect(labels).toEqual(['Light', 'Dark', 'System']);
    });

    it('starts on the system appearance', () => {
        expect(tab(mountTabs(), 'System').classes()).toContain('bg-white');
    });

    it('marks the persisted appearance', () => {
        useAppearance().updateAppearance('dark');

        expect(tab(mountTabs(), 'Dark').classes()).toContain('bg-white');
    });

    it('leaves the other options unmarked', () => {
        useAppearance().updateAppearance('dark');

        expect(tab(mountTabs(), 'Light').classes()).not.toContain('bg-white');
    });

    it('persists the picked appearance', async () => {
        await tab(mountTabs(), 'Light').trigger('click');

        expect(localStorage.getItem('appearance')).toBe('light');
    });

    it('moves the highlight to the picked option', async () => {
        const wrapper = mountTabs();

        await tab(wrapper, 'Dark').trigger('click');

        expect(tab(wrapper, 'Dark').classes()).toContain('bg-white');
        expect(tab(wrapper, 'System').classes()).not.toContain('bg-white');
    });
});
