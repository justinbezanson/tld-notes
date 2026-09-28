import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { setPageUrl } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountSettings() {
    return mount(SettingsLayout, { slots: { default: '<p>panel</p>' } });
}

function navLink(wrapper: ReturnType<typeof mountSettings>, label: string) {
    return wrapper.findAll('a').find((link) => link.text().trim() === label)!;
}

beforeEach(() => {
    setPageUrl('/settings/profile');
});

describe('heading', () => {
    it('names the settings section', () => {
        expect(mountSettings().text()).toContain('Settings');
    });

    it('explains the section', () => {
        expect(mountSettings().text()).toContain(
            'Manage your profile and account settings',
        );
    });
});

describe('navigation', () => {
    it('labels the navigation for screen readers', () => {
        expect(
            mountSettings().find('nav[aria-label="Settings"]').exists(),
        ).toBe(true);
    });

    it('links to the profile page', () => {
        expect(navLink(mountSettings(), 'Profile').attributes('href')).toBe(
            '/settings/profile',
        );
    });

    it('links to the security page', () => {
        expect(navLink(mountSettings(), 'Security').attributes('href')).toBe(
            '/settings/security',
        );
    });

    it('links to the appearance page', () => {
        expect(navLink(mountSettings(), 'Appearance').attributes('href')).toBe(
            '/settings/appearance',
        );
    });

    it('highlights the page you are on', () => {
        const wrapper = mountSettings();

        expect(navLink(wrapper, 'Profile').classes()).toContain('bg-muted');
    });

    it('leaves the other pages alone', () => {
        const wrapper = mountSettings();

        expect(navLink(wrapper, 'Security').classes()).not.toContain(
            'bg-muted',
        );
    });

    it('highlights a nested settings page', () => {
        setPageUrl('/settings/security/passkeys');

        const wrapper = mountSettings();

        expect(navLink(wrapper, 'Security').classes()).toContain('bg-muted');
    });
});

describe('panel', () => {
    it('renders the page inside the settings column', () => {
        const wrapper = mountSettings();

        expect(wrapper.get('section').text()).toContain('panel');
    });
});
