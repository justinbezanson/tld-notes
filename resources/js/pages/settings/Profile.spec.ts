import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Profile from '@/pages/settings/Profile.vue';
import {
    formStubAttrs,
    resetFormStub,
    setFormErrors,
    setProcessing,
} from '@/test/form';
import { resetForms } from '@/test/inertia';
import { resetPage, setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const user = {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    email_verified_at: '2026-01-01T00:00:00.000000Z',
};

function mountPage() {
    return mount(Profile, { attachTo: document.body });
}

beforeEach(() => {
    resetForms();
    resetFormStub();
    resetPage();
    setPageProps({ auth: { user } });
});

describe('head', () => {
    it('titles the page', () => {
        mountPage();

        expect(document.title).toBe('Profile settings');
    });
});

describe('form', () => {
    it('spoofs a patch to the profile update route', () => {
        // Wayfinder's form helper posts with a _method override.
        mountPage();

        expect(formStubAttrs()).toMatchObject({
            action: '/settings/profile?_method=PATCH',
            method: 'post',
        });
    });

    it('fills the name in from the signed in user', () => {
        const input = mountPage().find<HTMLInputElement>('input[name="name"]');

        expect(input.element.value).toBe('Ada Lovelace');
    });

    it('fills the email in from the signed in user', () => {
        const input = mountPage().find<HTMLInputElement>('input[name="email"]');

        expect(input.element.value).toBe('ada@example.com');
    });

    it('disables the save button while submitting', () => {
        setProcessing(true);

        expect(
            mountPage()
                .find('[data-test="update-profile-button"]')
                .attributes('disabled'),
        ).toBeDefined();
    });

    it('shows a name error', () => {
        setFormErrors({ name: 'The name field is required.' });

        expect(mountPage().text()).toContain('The name field is required.');
    });

    it('shows an email error', () => {
        setFormErrors({ email: 'The email has already been taken.' });

        expect(mountPage().text()).toContain(
            'The email has already been taken.',
        );
    });
});

describe('email verification notice', () => {
    it('stays quiet for a verified address', () => {
        setPageProps({ auth: { user }, mustVerifyEmail: true });

        expect(mountPage().text()).not.toContain('unverified');
    });

    it('warns about an unverified address', () => {
        setPageProps({
            auth: { user: { ...user, email_verified_at: null } },
            mustVerifyEmail: true,
        });

        expect(mountPage().text()).toContain(
            'Your email address is unverified.',
        );
    });

    it('confirms a resend when the server says so', () => {
        setPageProps({
            auth: { user: { ...user, email_verified_at: null } },
            mustVerifyEmail: true,
            status: 'verification-link-sent',
        });

        expect(mountPage().text()).toContain(
            'A new verification link has been sent to your email address.',
        );
    });

    it('stays quiet when the app does not require verification', () => {
        setPageProps({
            auth: { user: { ...user, email_verified_at: null } },
            mustVerifyEmail: false,
        });

        expect(mountPage().text()).not.toContain('unverified');
    });
});

describe('danger zone', () => {
    it('offers account deletion', () => {
        expect(mountPage().text()).toContain('Delete account');
    });

    it('warns that deletion cannot be undone', () => {
        expect(mountPage().text()).toContain('this cannot be undone');
    });
});
