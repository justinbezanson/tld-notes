import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppHeader from '@/components/AppHeader.vue';
import AppHeaderLayout from '@/layouts/app/AppHeaderLayout.vue';
import { makeUser } from '@/test/factories';
import { setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const breadcrumbs = [{ title: 'Runs' }, { title: 'Marathon' }];

function mountLayout(props: Record<string, unknown> = {}) {
    return mount(AppHeaderLayout, {
        props,
        slots: { default: '<p>page</p>' },
        global: { stubs: { AppHeader: true, Sonner: true } },
    });
}

beforeEach(() => {
    setPageProps({ name: 'TLD Notes', auth: { user: makeUser() } });
});

describe('shell', () => {
    it('uses the header shell', () => {
        const wrapper = mountLayout();

        expect(wrapper.get('div').classes()).toContain('min-h-screen');
    });

    it('puts the header above the page', () => {
        const wrapper = mountLayout();

        expect(wrapper.findComponent(AppHeader).exists()).toBe(true);
    });

    it('hands the header its breadcrumbs', () => {
        const wrapper = mountLayout({ breadcrumbs });

        expect(wrapper.getComponent(AppHeader).props('breadcrumbs')).toEqual(
            breadcrumbs,
        );
    });

    it('renders the page', () => {
        expect(mountLayout().text()).toContain('page');
    });

    it('mounts the toaster for flash messages', () => {
        const wrapper = mount(AppHeaderLayout, {
            global: { stubs: { AppHeader: true, Sonner: false } },
        });

        expect(wrapper.find('[data-sonner-toaster]').exists()).toBe(true);
    });
});
