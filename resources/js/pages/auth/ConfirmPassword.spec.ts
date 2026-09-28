import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfirmPassword from '@/pages/auth/ConfirmPassword.vue';
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

function mountPage() {
    return mount(ConfirmPassword, { attachTo: document.body });
}

beforeEach(() => {
    resetForms();
    resetFormStub();
});

describe('head', () => {
    it('titles the page', () => {
        mountPage();

        expect(document.title).toBe('Confirm password');
    });
});

describe('form', () => {
    it('posts to the password confirm route', () => {
        mountPage();

        expect(formStubAttrs()).toMatchObject({
            action: '/user/confirm-password',
            method: 'post',
        });
    });

    it('asks for a password', () => {
        expect(mountPage().find('input[name="password"]').exists()).toBe(true);
    });

    it('resets the field on success', () => {
        mountPage();

        expect(formStubAttrs()['reset-on-success']).toBe('');
    });

    it('disables the confirm button while submitting', () => {
        setProcessing(true);

        expect(
            mountPage().findAll('button').at(-1)!.attributes('disabled'),
        ).toBeDefined();
    });

    it('shows a password error', () => {
        setFormErrors({ password: 'The provided password is incorrect.' });

        expect(mountPage().text()).toContain(
            'The provided password is incorrect.',
        );
    });
});

// The passkey button only renders where the browser supports WebAuthn, which
// jsdom does not; PasskeyVerify.spec covers that path.
