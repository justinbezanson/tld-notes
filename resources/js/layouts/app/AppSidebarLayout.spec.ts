import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppSidebar from '@/components/AppSidebar.vue';
import AppSidebarHeader from '@/components/AppSidebarHeader.vue';
import AppSidebarLayout from '@/layouts/app/AppSidebarLayout.vue';
import { makeUser } from '@/test/factories';
import { setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const breadcrumbs = [{ title: 'Runs' }, { title: 'Marathon' }];

function mountLayout(props: Record<string, unknown> = {}) {
    return mount(AppSidebarLayout, {
        props,
        slots: { default: '<p>page</p>' },
        global: {
            stubs: {
                AppSidebar: true,
                AppSidebarHeader: true,
                Sonner: true,
            },
        },
    });
}

beforeEach(() => {
    setPageProps({ name: 'TLD Notes', auth: { user: makeUser() } });
});

describe('shell', () => {
    it('uses the sidebar shell', () => {
        const wrapper = mountLayout();

        expect(wrapper.find('[data-slot="sidebar-wrapper"]').exists()).toBe(
            true,
        );
    });

    it('renders the sidebar', () => {
        expect(mountLayout().findComponent(AppSidebar).exists()).toBe(true);
    });

    it('renders the sidebar header', () => {
        expect(mountLayout().findComponent(AppSidebarHeader).exists()).toBe(
            true,
        );
    });

    it('hands the header its breadcrumbs', () => {
        const wrapper = mountLayout({ breadcrumbs });

        expect(
            wrapper.getComponent(AppSidebarHeader).props('breadcrumbs'),
        ).toEqual(breadcrumbs);
    });

    it('renders the page', () => {
        expect(mountLayout().text()).toContain('page');
    });

    it('keeps the page from scrolling sideways', () => {
        const wrapper = mountLayout();
        const inset = wrapper.get('[data-slot="sidebar-inset"]');

        expect(inset.classes()).toContain('overflow-x-clip');
    });
});
