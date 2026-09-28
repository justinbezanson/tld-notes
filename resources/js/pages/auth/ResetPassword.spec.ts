import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPassword from '@/pages/auth/ResetPassword.vue';
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
    token: 'reset-token',
    email: 'ada@example.com',
    passwordRules: 'The password must be at least 8 characters.',
};

function mountPage(overrides: Record<string, unknown> = {}) {
    return mount(ResetPassword, {
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

        expect(document.title).toBe('Reset password');
    });
});

describe('form', () => {
    it('posts to the password update route', () => {
        mountPage();

        expect(formStubAttrs()).toMatchObject({
            action: '/reset-password',
            method: 'post',
        });
    });

    it('sends the token and email with the submission', () => {
        mountPage();

        const transform = formStubAttrs().transform as (
            data: Record<string, string>,
        ) => Record<string, string>;

        expect(transform({ password: 'secret-password' })).toEqual({
            password: 'secret-password',
            token: 'reset-token',
            email: 'ada@example.com',
        });
    });

    it('shows the email the link was sent to', () => {
        expect(
            mountPage().get<HTMLInputElement>('input[name="email"]').element
                .value,
        ).toBe('ada@example.com');
    });

    it('does not let the email be edited', () => {
        expect(
            mountPage().find('input[name="email"]').attributes('readonly'),
        ).toBeDefined();
    });

    it('asks for both password fields', () => {
        const wrapper = mountPage();

        expect(wrapper.find('input[name="password"]').exists()).toBe(true);
        expect(
            wrapper.find('input[name="password_confirmation"]').exists(),
        ).toBe(true);
    });

    it('resets both password fields on success', () => {
        mountPage();

        expect(formStubAttrs()['reset-on-success']).toEqual([
            'password',
            'password_confirmation',
        ]);
    });

    it('disables the button while submitting', () => {
        setProcessing(true);

        expect(
            mountPage()
                .find('[data-test="reset-password-button"]')
                .attributes('disabled'),
        ).toBeDefined();
    });
});

describe('validation errors', () => {
    it('shows a password error', () => {
        setFormErrors({ password: 'The password field is required.' });

        expect(mountPage().text()).toContain('The password field is required.');
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
