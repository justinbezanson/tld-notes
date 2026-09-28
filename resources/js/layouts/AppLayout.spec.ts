import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppHeaderLayout from '@/layouts/app/AppHeaderLayout.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import { makeUser } from '@/test/factories';
import { setPageProps } from '@/test/page';
import type { BreadcrumbItem } from '@/types';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Runs', href: '/runs' },
    { title: 'Marathon', href: '/runs/marathon' },
];

beforeEach(() => {
    setPageProps({ name: 'TLD Notes', auth: { user: makeUser() } });
});

describe('app layout', () => {
    it('uses the header shell', () => {
        const wrapper = mount(AppLayout, {
            props: { breadcrumbs },
            global: { stubs: { AppHeader: true, Sonner: true } },
        });

        expect(wrapper.findComponent(AppHeaderLayout).exists()).toBe(true);
    });

    it('passes the breadcrumbs along', () => {
        const wrapper = mount(AppLayout, {
            props: { breadcrumbs },
            global: { stubs: { AppHeader: true, Sonner: true } },
        });

        expect(
            wrapper.getComponent(AppHeaderLayout).props('breadcrumbs'),
        ).toEqual(breadcrumbs);
    });

    it('renders the page', () => {
        const wrapper = mount(AppLayout, {
            slots: { default: '<p>page</p>' },
            global: { stubs: { AppHeader: true, Sonner: true } },
        });

        expect(wrapper.text()).toContain('page');
    });

    it('copes with no breadcrumbs', () => {
        const wrapper = mount(AppLayout, {
            global: { stubs: { AppHeader: true, Sonner: true } },
        });

        expect(
            wrapper.getComponent(AppHeaderLayout).props('breadcrumbs'),
        ).toEqual([]);
    });
});
