import { House, Map } from '@lucide/vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import NavMain from '@/components/NavMain.vue';
import SidebarProvider from '@/components/ui/sidebar/SidebarProvider.vue';
import type { NavItem } from '@/types';

const items: NavItem[] = [
    { title: 'Runs', href: '/runs', icon: House },
    { title: 'Settings', href: '/settings/profile', icon: Map },
];

const { currentUrl } = vi.hoisted(() => ({ currentUrl: { value: '/runs' } }));

vi.mock('@/composables/useCurrentUrl', () => ({
    useCurrentUrl: () => ({
        isCurrentUrl: (href: string) => currentUrl.value === href,
    }),
}));

// SidebarMenuButton reads the sidebar context, so the nav is always mounted in one.
const Host = defineComponent({
    props: { items: { type: Array as PropType<NavItem[]>, required: true } },
    setup: (props) => () =>
        h(SidebarProvider, null, {
            default: () => h(NavMain, { items: props.items }),
        }),
});

function mountNav(navItems: NavItem[] = items) {
    return mount(Host, {
        props: { items: navItems },
        global: {
            stubs: { Link: { template: '<a><slot /></a>' } },
        },
    });
}

function activeText(wrapper: ReturnType<typeof mountNav>) {
    return wrapper.find('[data-active="true"]').text();
}

describe('NavMain', () => {
    beforeEach(() => {
        currentUrl.value = '/runs';
    });

    it('labels the group', () => {
        expect(mountNav().text()).toContain('Platform');
    });

    it('renders every item', () => {
        const text = mountNav().text();

        expect(text).toContain('Runs');
        expect(text).toContain('Settings');
    });

    it('renders the item icon', () => {
        expect(mountNav().findComponent(House).exists()).toBe(true);
    });

    it('marks the current url', () => {
        expect(activeText(mountNav())).toContain('Runs');
    });

    it('leaves other items unmarked', () => {
        expect(activeText(mountNav())).not.toContain('Settings');
    });

    it('follows the current url when it changes', () => {
        currentUrl.value = '/settings/profile';

        expect(activeText(mountNav())).toContain('Settings');
    });

    it('marks nothing for an unrelated url', () => {
        currentUrl.value = '/somewhere-else';

        expect(mountNav().find('[data-active="true"]').exists()).toBe(false);
    });

    it('renders a single item', () => {
        expect(mountNav([items[0]!]).text()).not.toContain('Settings');
    });
});
