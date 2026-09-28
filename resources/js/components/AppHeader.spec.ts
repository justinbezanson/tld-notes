import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppHeader from '@/components/AppHeader.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { makeUser } from '@/test/factories';
import { clickMenuTrigger } from '@/test/menu';
import { setPageProps, setPageUrl } from '@/test/page';
import type { BreadcrumbItem } from '@/types';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

type Props = InstanceType<typeof AppHeader>['$props'];

function mountHeader(props: Props = {}) {
    return mount(AppHeader, { props, attachTo: document.body });
}

function avatarTrigger() {
    const avatar = document.querySelector<HTMLElement>('[data-slot="avatar"]');

    if (!avatar) {
        throw new Error('The header has no avatar.');
    }

    return avatar.closest('button')!;
}

beforeEach(() => {
    setPageUrl('/dashboard');
    setPageProps({ auth: { user: makeUser({ name: 'Ada Lovelace' }) } });
});

describe('branding', () => {
    it('links the logo to the dashboard', () => {
        const wrapper = mountHeader();
        const logo = wrapper.get('img[alt="Logo"]');

        expect(logo.attributes('src')).toBe('/images/tld.png');
        expect(logo.element.closest('a')?.getAttribute('href')).toBe(
            '/dashboard',
        );
    });
});

describe('navigation', () => {
    it('links to the dashboard', () => {
        expect(mountHeader().text()).toContain('Save Files');
    });

    it('marks the current page', () => {
        setPageUrl('/dashboard');

        const wrapper = mountHeader();
        const navLink = wrapper
            .findAll('a')
            .find((link) => link.text().includes('Save Files'))!;

        expect(navLink.classes()).toContain('text-neutral-900');
    });

    it('leaves other pages unmarked', () => {
        setPageUrl('/settings/profile');

        const wrapper = mountHeader();
        const navLink = wrapper
            .findAll('a')
            .find((link) => link.text().includes('Save Files'))!;

        expect(navLink.classes()).not.toContain('text-neutral-900');
    });

    it('offers the menu on small screens', () => {
        expect(mountHeader().find('[data-slot="sheet-trigger"]').exists()).toBe(
            true,
        );
    });
});

describe('user', () => {
    it('shows the initials of the signed in user', () => {
        expect(mountHeader().text()).toContain('AL');
    });

    it('follows a different user', () => {
        setPageProps({ auth: { user: makeUser({ name: 'Grace Hopper' }) } });

        expect(mountHeader().text()).toContain('GH');
    });

    it('shows the avatar image when there is one', () => {
        setPageProps({
            auth: { user: makeUser({ avatar: 'https://example.com/a.png' }) },
        });

        const wrapper = mountHeader();

        expect(
            wrapper.get('[data-slot="avatar-image"]').attributes('src'),
        ).toBe('https://example.com/a.png');
    });

    it('falls back to the initials without an avatar image', () => {
        const wrapper = mountHeader();

        expect(wrapper.find('[data-slot="avatar-image"]').exists()).toBe(false);
        expect(wrapper.text()).toContain('AL');
    });

    it('opens the user menu', async () => {
        const wrapper = mountHeader();

        await clickMenuTrigger(avatarTrigger());

        expect(wrapper.findComponent(UserMenuContent).exists()).toBe(true);
    });
});

describe('breadcrumbs', () => {
    it('leaves the row out for a single crumb', () => {
        const wrapper = mountHeader({
            breadcrumbs: [{ title: 'Runs', href: '/runs' }],
        });

        expect(wrapper.findComponent(Breadcrumbs).exists()).toBe(false);
    });

    it('shows the row for a nested page', () => {
        const wrapper = mountHeader({
            breadcrumbs: [
                { title: 'Runs', href: '/runs' },
                { title: 'Marathon', href: '/runs/marathon' },
            ],
        });

        expect(wrapper.findComponent(Breadcrumbs).exists()).toBe(true);
    });

    it('passes the crumbs along', () => {
        const breadcrumbs: BreadcrumbItem[] = [
            { title: 'Runs', href: '/runs' },
            { title: 'Marathon', href: '/runs/marathon' },
        ];
        const wrapper = mountHeader({ breadcrumbs });

        expect(wrapper.getComponent(Breadcrumbs).props('breadcrumbs')).toEqual(
            breadcrumbs,
        );
    });
});
