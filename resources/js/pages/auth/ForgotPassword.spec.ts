import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPassword from '@/pages/auth/ForgotPassword.vue';
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

function mountPage(props: Record<string, unknown> = {}) {
    return mount(ForgotPassword, { props, attachTo: document.body });
}

beforeEach(() => {
    resetForms();
    resetFormStub();
});

describe('head', () => {
    it('titles the page', () => {
        mountPage();

        expect(document.title).toBe('Forgot password');
    });
});

describe('form', () => {
    it('posts to the password email route', () => {
        mountPage();

        expect(formStubAttrs()).toMatchObject({
            action: '/forgot-password',
            method: 'post',
        });
    });

    it('asks for an email address', () => {
        expect(mountPage().find('input[name="email"]').exists()).toBe(true);
    });

    it('disables the button while submitting', () => {
        setProcessing(true);

        expect(
            mountPage()
                .find('[data-test="email-password-reset-link-button"]')
                .attributes('disabled'),
        ).toBeDefined();
    });

    it('shows an email error', () => {
        setFormErrors({ email: 'The email field is required.' });

        expect(mountPage().text()).toContain('The email field is required.');
    });
});

describe('links', () => {
    it('offers a way back to log in', () => {
        mountPage();

        const link = [...document.querySelectorAll('a')].find(
            (anchor) => anchor.textContent?.trim() === 'log in',
        );

        expect(link?.getAttribute('href')).toBe('/login');
    });
});

describe('status message', () => {
    it('confirms a reset link was sent', () => {
        expect(
            mountPage({
                status: 'We have emailed your password reset link.',
            }).text(),
        ).toContain('We have emailed your password reset link.');
    });

    it('shows nothing without a status', () => {
        expect(mountPage().text()).not.toContain('reset link.');
    });
});
