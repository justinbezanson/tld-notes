import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Appearance from '@/pages/settings/Appearance.vue';
import { resetForms } from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountPage() {
    return mount(Appearance, { attachTo: document.body });
}

beforeEach(() => {
    localStorage.removeItem('appearance');
    resetForms();
});

describe('head', () => {
    it('titles the page', () => {
        mountPage();

        expect(document.title).toBe('Appearance settings');
    });
});

describe('page', () => {
    it('describes itself with a heading', () => {
        expect(mountPage().find('h2').text()).toBe('Appearance settings');
    });

    it('carries an accessible page heading', () => {
        expect(mountPage().find('h1').text()).toBe('Appearance settings');
    });

    it('embeds the appearance tabs', () => {
        const wrapper = mountPage();

        expect(
            wrapper.findAll('button').map((button) => button.text().trim()),
        ).toEqual(['Light', 'Dark', 'System']);
    });

    it('persists a picked appearance', async () => {
        const wrapper = mountPage();

        await wrapper.findAll('button').at(1)!.trigger('click');

        expect(localStorage.getItem('appearance')).toBe('dark');
    });
});
