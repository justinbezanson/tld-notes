import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from '@/pages/auth/Register.vue';
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

const passwordRules = 'The password must be at least 8 characters.';

type RegisterProps = InstanceType<typeof Register>['$props'];

function mountRegister(props: Partial<RegisterProps> = {}) {
    return mount(Register, {
        props: { passwordRules, ...props },
        attachTo: document.body,
    });
}

beforeEach(() => {
    resetForms();
    resetFormStub();
});

describe('head', () => {
    it('titles the page', () => {
        mountRegister();

        expect(document.title).toBe('Register');
    });
});

describe('form', () => {
    it('posts to the register route', () => {
        mountRegister();

        expect(formStubAttrs()).toMatchObject({
            action: '/register',
            method: 'post',
        });
    });

    it('asks for a name, email and two password fields', () => {
        const wrapper = mountRegister();

        expect(wrapper.find('input[name="name"]').exists()).toBe(true);
        expect(wrapper.find('input[name="email"]').exists()).toBe(true);
        expect(wrapper.find('input[name="password"]').exists()).toBe(true);
        expect(
            wrapper.find('input[name="password_confirmation"]').exists(),
        ).toBe(true);
    });

    it('autofocuses the name field', () => {
        expect(
            mountRegister().find('input[name="name"]').attributes('autofocus'),
        ).toBeDefined();
    });

    it('resets both password fields on success', () => {
        mountRegister();

        expect(formStubAttrs()['reset-on-success']).toEqual([
            'password',
            'password_confirmation',
        ]);
    });

    it('disables the button while submitting', () => {
        setProcessing(true);

        expect(
            mountRegister()
                .find('[data-test="register-user-button"]')
                .attributes('disabled'),
        ).toBeDefined();
    });
});

describe('validation errors', () => {
    it('shows an email error', () => {
        setFormErrors({ email: 'The email has already been taken.' });

        expect(mountRegister().text()).toContain(
            'The email has already been taken.',
        );
    });

    it('shows a password confirmation error', () => {
        setFormErrors({
            password_confirmation: 'The password confirmation does not match.',
        });

        expect(mountRegister().text()).toContain(
            'The password confirmation does not match.',
        );
    });
});

describe('links', () => {
    it('offers a way back to the login page', () => {
        mountRegister();

        const link = [...document.querySelectorAll('a')].find(
            (anchor) => anchor.textContent?.trim() === 'Log in',
        );

        expect(link?.getAttribute('href')).toBe('/login');
    });
});
