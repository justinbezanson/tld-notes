import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import NavUser from '@/components/NavUser.vue';
import {
    SidebarMenu,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import UserInfo from '@/components/UserInfo.vue';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { makeUser } from '@/test/factories';
import { clickMenuTrigger, menuContent } from '@/test/menu';
import { setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

/** NavUser lives inside the sidebar menu, which the sidebar provides. */
const Host = defineComponent({
    props: { open: { type: Boolean, default: true } },
    setup: (props) => () =>
        h(
            SidebarProvider,
            { open: props.open },
            {
                // The layout's header owns the trigger that opens the mobile sheet.
                default: () => [
                    h(SidebarTrigger),
                    h(SidebarMenu, null, { default: () => h(NavUser) }),
                ],
            },
        ),
});

function mountNavUser() {
    return mount(Host, { attachTo: document.body });
}

/** useSidebar() reads this query to decide it is on a small screen. */
function setMobileViewport() {
    vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
            ({
                matches: query.includes('max-width'),
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }) as unknown as MediaQueryList,
    );
}

function trigger() {
    return document.querySelector<HTMLElement>(
        '[data-test="sidebar-menu-button"]',
    )!;
}

beforeEach(() => {
    setPageProps({ auth: { user: makeUser({ name: 'Ada Lovelace' }) } });
});

describe('summary', () => {
    it('shows the signed in user', () => {
        expect(mountNavUser().getComponent(UserInfo).props('user')).toEqual(
            expect.objectContaining({ name: 'Ada Lovelace' }),
        );
    });

    it('follows a different user', () => {
        setPageProps({ auth: { user: makeUser({ name: 'Grace Hopper' }) } });

        expect(mountNavUser().text()).toContain('Grace Hopper');
    });

    it('is a menu trigger', () => {
        mountNavUser();

        expect(trigger().getAttribute('data-state')).toBe('closed');
    });
});

describe('menu', () => {
    it('opens the user menu', async () => {
        const wrapper = mountNavUser();

        await clickMenuTrigger(trigger());

        expect(wrapper.findComponent(UserMenuContent).exists()).toBe(true);
    });

    it('shows the menu below an expanded sidebar', async () => {
        mountNavUser();

        await clickMenuTrigger(trigger());

        expect(menuContent()?.getAttribute('data-side')).toBe('bottom');
    });

    it('shows the menu beside a collapsed sidebar', async () => {
        mount(Host, { props: { open: false }, attachTo: document.body });

        await clickMenuTrigger(trigger());

        expect(menuContent()?.getAttribute('data-side')).toBe('left');
    });

    it('shows the menu below the sidebar on mobile', async () => {
        setMobileViewport();
        mountNavUser();

        // On a small screen the sidebar lives in a sheet, which is closed first.
        await clickMenuTrigger(
            document.querySelector<HTMLElement>(
                '[data-slot="sidebar-trigger"]',
            )!,
        );
        await clickMenuTrigger(trigger());

        expect(menuContent()?.getAttribute('data-side')).toBe('bottom');
    });
});
