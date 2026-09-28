import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppLogo from '@/components/AppLogo.vue';
import { setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

beforeEach(() => {
    setPageProps({ name: 'TLD Notes' });
});

describe('app name', () => {
    it('shows the application name from the page props', () => {
        expect(mount(AppLogo).text()).toContain('TLD Notes');
    });

    it('follows a renamed application', () => {
        setPageProps({ name: 'Trail Log' });

        expect(mount(AppLogo).text()).toContain('Trail Log');
    });
});

describe('icon', () => {
    it('renders the logo mark', () => {
        expect(mount(AppLogo).find('svg').exists()).toBe(true);
    });

    it('keeps the mark square', () => {
        expect(mount(AppLogo).find('svg').classes()).toContain('size-5');
    });
});
