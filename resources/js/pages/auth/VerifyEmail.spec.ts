import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmail from '@/pages/auth/VerifyEmail.vue';
import { formStubAttrs, resetFormStub, setProcessing } from '@/test/form';
import { resetForms } from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountPage(props: Record<string, unknown> = {}) {
    return mount(VerifyEmail, { props, attachTo: document.body });
}

beforeEach(() => {
    resetForms();
    resetFormStub();
});

describe('head', () => {
    it('titles the page', () => {
        mountPage();

        expect(document.title).toBe('Email verification');
    });
});

describe('form', () => {
    it('posts to the verification send route', () => {
        mountPage();

        expect(formStubAttrs()).toMatchObject({
            action: '/email/verification-notification',
            method: 'post',
        });
    });

    it('offers to resend the verification email', () => {
        expect(mountPage().text()).toContain('Resend verification email');
    });

    it('disables the resend button while submitting', () => {
        setProcessing(true);

        expect(
            mountPage().findAll('button').at(0)!.attributes('disabled'),
        ).toBeDefined();
    });
});

describe('logging out', () => {
    it('offers a way to log out', () => {
        const wrapper = mountPage();

        expect(
            wrapper
                .findAll('button')
                .some((button) => button.text().trim() === 'Log out'),
        ).toBe(true);
    });
});

describe('status message', () => {
    it('confirms a new link was sent', () => {
        expect(
            mountPage({ status: 'verification-link-sent' }).text(),
        ).toContain('A new verification link has been sent');
    });

    it('says nothing for any other status', () => {
        expect(mountPage({ status: 'something-else' }).text()).not.toContain(
            'A new verification link has been sent',
        );
    });

    it('says nothing without a status', () => {
        expect(mountPage().text()).not.toContain(
            'A new verification link has been sent',
        );
    });
});
