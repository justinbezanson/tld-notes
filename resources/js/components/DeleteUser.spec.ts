import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import DeleteUser from '@/components/DeleteUser.vue';
import { dialogButton, dialogText, submitDialog } from '@/test/dialog';
import {
    formStubAttrs,
    formStubClearErrors,
    formStubEmit,
    formStubReset,
    resetFormStub,
    setFormErrors,
    setProcessing,
} from '@/test/form';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountDeleteUser() {
    return mount(DeleteUser, { attachTo: document.body });
}

async function openDialog(wrapper: ReturnType<typeof mountDeleteUser>) {
    await wrapper.get('[data-test="delete-user-button"]').trigger('click');
    await nextTick();
    await nextTick();
}

function confirmButton() {
    return document.querySelector<HTMLButtonElement>(
        '[data-test="confirm-delete-user-button"]',
    )!;
}

async function typePassword(password: string) {
    const input = document.querySelector<HTMLInputElement>('input#password')!;

    input.value = password;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
}

beforeEach(() => {
    resetFormStub();
});

describe('warning', () => {
    it('names the section', () => {
        expect(mountDeleteUser().text()).toContain('Delete account');
    });

    it('warns that the deletion cannot be undone', () => {
        expect(mountDeleteUser().text()).toContain('this cannot be undone');
    });
});

describe('confirmation', () => {
    it('asks before deleting', async () => {
        const wrapper = mountDeleteUser();

        await openDialog(wrapper);

        expect(dialogText()).toContain(
            'Are you sure you want to delete your account?',
        );
    });

    it('explains what goes with the account', async () => {
        const wrapper = mountDeleteUser();

        await openDialog(wrapper);

        expect(dialogText()).toContain(
            'all of its resources and data will also be permanently deleted',
        );
    });

    it('asks for the password', async () => {
        const wrapper = mountDeleteUser();

        await openDialog(wrapper);

        expect(document.querySelector('input#password')).not.toBeNull();
    });

    it('masks the password', async () => {
        const wrapper = mountDeleteUser();

        await openDialog(wrapper);

        expect(
            document.querySelector<HTMLInputElement>('input#password')!.type,
        ).toBe('password');
    });

    it('deletes nothing while it is only a warning', () => {
        mountDeleteUser();

        expect(formStubAttrs().action).toBeUndefined();
    });
});

describe('request', () => {
    it('targets the profile destroy route', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);

        expect(formStubAttrs().action).toContain('/profile');
    });

    it('keeps the scroll position', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);

        expect(formStubAttrs().options).toEqual({ preserveScroll: true });
    });

    it('clears the form once the account is gone', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);

        expect(formStubAttrs()['reset-on-success']).toBeDefined();
    });

    it('waits while the request is in flight', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);
        setProcessing(true);
        await nextTick();

        expect(confirmButton().disabled).toBe(true);
    });

    it('reports a wrong password', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);
        setFormErrors({ password: 'The provided password is incorrect.' });
        await nextTick();

        expect(dialogText()).toContain('The provided password is incorrect.');
    });

    it('refocuses the password field after a failure', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);
        const focus = vi.spyOn(HTMLInputElement.prototype, 'focus');

        formStubEmit('error');
        await nextTick();

        expect(focus).toHaveBeenCalled();
    });

    it('submits through the form', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);
        await typePassword('secret-password');

        await submitDialog();

        expect(formStubAttrs().action).toContain('/profile');
    });
});

describe('cancelling', () => {
    it('closes the dialog without deleting', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);

        dialogButton('Cancel').dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
        );
        await vi.waitFor(() => {
            expect(
                document.querySelector(
                    '[data-test="confirm-delete-user-button"]',
                ),
            ).toBeNull();
        });
    });

    it('clears the password and any errors', async () => {
        const wrapper = mountDeleteUser();
        await openDialog(wrapper);
        setFormErrors({ password: 'The provided password is incorrect.' });
        await nextTick();

        dialogButton('Cancel').dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
        );
        await nextTick();

        expect(formStubClearErrors()).toHaveBeenCalled();
        expect(formStubReset()).toHaveBeenCalled();
    });
});
