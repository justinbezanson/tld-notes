import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import AppLogo from '@/components/AppLogo.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import { SidebarProvider } from '@/components/ui/sidebar';
import { makeUser } from '@/test/factories';
import { setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

/** The layout owns the provider, so the sidebar is mounted inside one. */
const Host = defineComponent({
    props: { open: { type: Boolean, default: true } },
    setup: (props) => () =>
        h(
            SidebarProvider,
            { open: props.open },
            {
                default: () =>
                    h(AppSidebar, null, {
                        default: () => h('p', 'page content'),
                    }),
            },
        ),
});

function mountSidebar(props: { open?: boolean } = {}) {
    return mount(Host, { props });
}

function logoLink(wrapper: ReturnType<typeof mountSidebar>) {
    return wrapper.getComponent(AppLogo).element.closest('a')!;
}

beforeEach(() => {
    setPageProps({ name: 'TLD Notes', auth: { user: makeUser() } });
});

describe('brand', () => {
    it('shows the application name', () => {
        expect(mountSidebar().text()).toContain('TLD Notes');
    });

    it('links the logo to the dashboard', () => {
        expect(logoLink(mountSidebar()).getAttribute('href')).toBe(
            '/dashboard',
        );
    });
});

describe('navigation', () => {
    it('lists the main navigation', () => {
        const wrapper = mountSidebar();

        expect(wrapper.getComponent(NavMain).props('items')).toEqual([
            expect.objectContaining({ title: 'Dashboard' }),
        ]);
    });

    it('lists the footer links', () => {
        const wrapper = mountSidebar();

        expect(wrapper.getComponent(NavFooter).props('items')).toEqual([
            expect.objectContaining({ title: 'Repository' }),
            expect.objectContaining({ title: 'Documentation' }),
        ]);
    });

    it('opens footer links elsewhere', () => {
        const links = mountSidebar()
            .findAll('a')
            .filter((link) => link.attributes('target') === '_blank');

        expect(links).toHaveLength(2);
        expect(links[0]?.attributes('href')).toContain('github.com');
    });

    it('shows the user menu in the footer', () => {
        expect(mountSidebar().findComponent(NavUser).exists()).toBe(true);
    });
});

describe('slot', () => {
    it('renders the page next to the sidebar', () => {
        expect(mountSidebar().text()).toContain('page content');
    });

    it('insets the sidebar into the page', () => {
        const sidebar = mountSidebar().get('[data-slot="sidebar"]');

        expect(sidebar.attributes('data-variant')).toBe('inset');
    });

    it('collapses to icons rather than off-canvas', () => {
        const sidebar = mountSidebar({ open: false }).get(
            '[data-slot="sidebar"]',
        );

        expect(sidebar.attributes('data-collapsible')).toBe('icon');
    });
});
