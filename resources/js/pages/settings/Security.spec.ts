import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Security from '@/pages/settings/Security.vue';
import {
    formStubAttrs,
    resetFormStub,
    setFormErrors,
    setProcessing,
} from '@/test/form';
import { resetForms } from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const props = {
    passwordRules: 'The password must be at least 8 characters.',
    canManageTwoFactor: false,
    requiresConfirmation: false,
    twoFactorEnabled: false,
    canManagePasskeys: false,
    passkeys: [],
};

function mountPage(overrides: Record<string, unknown> = {}) {
    return mount(Security, {
        props: { ...props, ...overrides },
        attachTo: document.body,
    });
}

beforeEach(() => {
    resetForms();
    resetFormStub();
});

describe('head', () => {
    it('titles the page', () => {
        mountPage();

        expect(document.title).toBe('Security settings');
    });
});

describe('password form', () => {
    it('spoofs a put to the password update route', () => {
        // Wayfinder's form helper posts with a _method override.
        mountPage();

        expect(formStubAttrs()).toMatchObject({
            action: '/settings/password?_method=PUT',
            method: 'post',
        });
    });

    it('asks for the current password and two new ones', () => {
        const wrapper = mountPage();

        expect(wrapper.find('input[name="current_password"]').exists()).toBe(
            true,
        );
        expect(wrapper.find('input[name="password"]').exists()).toBe(true);
        expect(
            wrapper.find('input[name="password_confirmation"]').exists(),
        ).toBe(true);
    });

    it('masks every password field', () => {
        const wrapper = mountPage();

        for (const name of [
            'current_password',
            'password',
            'password_confirmation',
        ]) {
            expect(
                wrapper.find(`input[name="${name}"]`).attributes('type'),
            ).toBe('password');
        }
    });

    it('keeps the scroll position on submit', () => {
        mountPage();

        expect(formStubAttrs().options).toEqual({ preserveScroll: true });
    });

    it('resets the password fields on error', () => {
        mountPage();

        expect(formStubAttrs()['reset-on-error']).toEqual([
            'password',
            'password_confirmation',
            'current_password',
        ]);
    });

    it('disables the save button while submitting', () => {
        setProcessing(true);

        expect(
            mountPage()
                .find('[data-test="update-password-button"]')
                .attributes('disabled'),
        ).toBeDefined();
    });

    it('shows a current password error', () => {
        setFormErrors({ current_password: 'The password is incorrect.' });

        expect(mountPage().text()).toContain('The password is incorrect.');
    });

    it('shows a password confirmation error', () => {
        setFormErrors({
            password_confirmation: 'The password confirmation does not match.',
        });

        expect(mountPage().text()).toContain(
            'The password confirmation does not match.',
        );
    });
});

describe('two factor section', () => {
    it('stays hidden when the user cannot manage it', () => {
        expect(mountPage().text()).not.toContain('Two-factor authentication');
    });

    it('appears when the user can manage it', () => {
        expect(mountPage({ canManageTwoFactor: true }).text()).toContain(
            'Two-factor authentication',
        );
    });
});

describe('passkeys section', () => {
    it('stays hidden when the user cannot manage passkeys', () => {
        expect(mountPage().text()).not.toContain('Passkeys');
    });

    it('appears when the user can manage passkeys', () => {
        expect(mountPage({ canManagePasskeys: true }).text()).toContain(
            'Passkeys',
        );
    });
});
