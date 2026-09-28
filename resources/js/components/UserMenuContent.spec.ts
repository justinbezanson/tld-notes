import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { makeUser } from '@/test/factories';
import { resetForms } from '@/test/inertia';
import { menuAction, menuLink, mountInMenu } from '@/test/menu';
import { resetRouter, routerStub } from '@/test/router';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const user = makeUser({ name: 'Ada Lovelace', email: 'ada@example.com' });

function mountMenu() {
    return mountInMenu(UserMenuContent, { user });
}

beforeEach(() => {
    resetForms();
    resetRouter();
});

describe('identity', () => {
    it('names the signed in user', async () => {
        await mountMenu();

        expect(document.body.textContent).toContain('Ada Lovelace');
    });

    it('shows the email address', async () => {
        await mountMenu();

        expect(document.body.textContent).toContain('ada@example.com');
    });
});

describe('settings', () => {
    it('links to the profile settings', async () => {
        await mountMenu();

        expect(menuLink('Settings').getAttribute('href')).toBe(
            '/settings/profile',
        );
    });
});

describe('logging out', () => {
    it('posts to the logout route', async () => {
        await mountMenu();

        // `as="button"` keeps the visit working without a full page load.
        expect(menuAction('Log out').tagName).toBe('BUTTON');
        expect(menuAction('Log out').getAttribute('data-href')).toBe('/logout');
    });

    it('flushes the client side caches when clicked', async () => {
        await mountMenu();

        menuAction('Log out').click();
        await nextTick();

        expect(routerStub.flushAll).toHaveBeenCalledOnce();
    });
});
