import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import AppShell from '@/components/AppShell.vue';
import { Sidebar } from '@/components/ui/sidebar';
import { setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

type Props = { variant?: 'sidebar' | 'header' };

function mountShell(props: Props = {}) {
    // A Sidebar needs the provider AppShell only renders for its own variant.
    const slot =
        (props.variant ?? 'sidebar') === 'sidebar'
            ? { default: () => h(Sidebar, () => 'content') }
            : { default: '<p>content</p>' };

    return mount(AppShell, { props, slots: slot });
}

function sidebarState(wrapper: ReturnType<typeof mountShell>) {
    return wrapper.get('[data-slot="sidebar"]').attributes('data-state');
}

beforeEach(() => {
    setPageProps({ sidebarOpen: true });
});

describe('sidebar variant', () => {
    it('wraps the page in the sidebar wrapper', () => {
        expect(
            mountShell().find('[data-slot="sidebar-wrapper"]').exists(),
        ).toBe(true);
    });

    it('renders the slot', () => {
        expect(mountShell().text()).toContain('content');
    });

    it('starts with the sidebar open when the page says so', () => {
        setPageProps({ sidebarOpen: true });

        expect(sidebarState(mountShell())).toBe('expanded');
    });

    it('starts with the sidebar collapsed when the page says so', () => {
        setPageProps({ sidebarOpen: false });

        expect(sidebarState(mountShell())).toBe('collapsed');
    });
});

describe('header variant', () => {
    it('renders a plain column without the sidebar', () => {
        const wrapper = mountShell({ variant: 'header' });

        expect(wrapper.get('div').classes()).toContain('min-h-screen');
        expect(wrapper.find('[data-slot="sidebar-wrapper"]').exists()).toBe(
            false,
        );
    });

    it('renders the slot', () => {
        expect(mountShell({ variant: 'header' }).text()).toContain('content');
    });
});
