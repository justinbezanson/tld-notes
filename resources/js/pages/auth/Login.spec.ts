import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '@/pages/auth/Login.vue';
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

type LoginProps = InstanceType<typeof Login>['$props'];

function mountLogin(props: Partial<LoginProps> = {}) {
    return mount(Login, {
        props: { canResetPassword: true, ...props },
        attachTo: document.body,
    });
}

function linkTo(text: string) {
    return [...document.querySelectorAll('a')].find(
        (anchor) => anchor.textContent?.trim() === text,
    );
}

beforeEach(() => {
    resetForms();
    resetFormStub();
});

describe('head', () => {
    it('titles the page', () => {
        mountLogin();

        expect(document.title).toBe('Log in');
    });
});

describe('form', () => {
    it('posts to the login route', () => {
        mountLogin();

        expect(formStubAttrs()).toMatchObject({
            action: '/login',
            method: 'post',
        });
    });

    it('asks for an email and a password', () => {
        const wrapper = mountLogin();

        expect(wrapper.find('input[name="email"]').exists()).toBe(true);
        expect(wrapper.find('input[name="password"]').exists()).toBe(true);
    });

    it('masks the password', () => {
        expect(
            mountLogin().find('input[name="password"]').attributes('type'),
        ).toBe('password');
    });

    it('offers a remember me checkbox', () => {
        expect(mountLogin().find('input[name="remember"]').exists()).toBe(true);
    });

    it('resets the password on success', () => {
        mountLogin();

        expect(formStubAttrs()['reset-on-success']).toEqual(['password']);
    });

    it('disables the button while submitting', () => {
        setProcessing(true);

        expect(
            mountLogin()
                .find('[data-test="login-button"]')
                .attributes('disabled'),
        ).toBeDefined();
    });
});

describe('validation errors', () => {
    it('shows an email error', () => {
        setFormErrors({ email: 'These credentials do not match our records.' });

        expect(mountLogin().text()).toContain(
            'These credentials do not match our records.',
        );
    });

    it('shows a password error', () => {
        setFormErrors({ password: 'The password field is required.' });

        expect(mountLogin().text()).toContain(
            'The password field is required.',
        );
    });
});

describe('links', () => {
    it('offers a password reset when allowed', () => {
        mountLogin();

        expect(linkTo('Forgot your password?')?.getAttribute('href')).toBe(
            '/forgot-password',
        );
    });

    it('hides the reset link when not allowed', () => {
        mountLogin({ canResetPassword: false });

        expect(linkTo('Forgot your password?')).toBeUndefined();
    });

    it('offers registration', () => {
        mountLogin();

        expect(linkTo('Sign up')?.getAttribute('href')).toBe('/register');
    });
});

describe('status message', () => {
    it('shows the status it was given', () => {
        expect(
            mountLogin({ status: 'Your session has expired.' }).text(),
        ).toContain('Your session has expired.');
    });

    it('shows nothing without a status', () => {
        expect(mountLogin().text()).not.toContain('session has expired');
    });
});
