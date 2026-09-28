import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TwoFactorChallenge from '@/pages/auth/TwoFactorChallenge.vue';
import {
    formStubAttrs,
    formStubClearErrors,
    resetFormStub,
    setFormErrors,
    setProcessing,
} from '@/test/form';
import { layoutProps, resetForms, resetLayoutProps } from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountPage() {
    return mount(TwoFactorChallenge, { attachTo: document.body });
}

function toggleButton(wrapper: ReturnType<typeof mountPage>) {
    return wrapper.findAll('button[type="button"]').at(-1)!;
}

beforeEach(() => {
    resetForms();
    resetFormStub();
    resetLayoutProps();
});

describe('head', () => {
    it('titles the page', () => {
        mountPage();

        expect(document.title).toBe('Two-factor authentication');
    });
});

describe('authentication code mode', () => {
    it('posts to the two factor login route', () => {
        mountPage();

        expect(formStubAttrs()).toMatchObject({
            action: '/two-factor-challenge',
            method: 'post',
        });
    });

    it('describes itself to the layout', () => {
        mountPage();

        expect(layoutProps().at(-1)).toMatchObject({
            title: 'Authentication code',
        });
    });

    it('carries the code in a hidden field', () => {
        expect(
            mountPage().find('input[type="hidden"][name="code"]').exists(),
        ).toBe(true);
    });

    it('offers a way to use a recovery code instead', () => {
        expect(mountPage().text()).toContain('login using a recovery code');
    });

    it('shows a code error', () => {
        setFormErrors({ code: 'The provided code is invalid.' });

        expect(mountPage().text()).toContain('The provided code is invalid.');
    });

    it('disables the button while submitting', () => {
        setProcessing(true);

        expect(
            mountPage().find('button[type="submit"]').attributes('disabled'),
        ).toBeDefined();
    });
});

describe('recovery code mode', () => {
    async function switchToRecoveryMode() {
        const wrapper = mountPage();

        await toggleButton(wrapper).trigger('click');

        return wrapper;
    }

    it('asks for a recovery code', async () => {
        const wrapper = await switchToRecoveryMode();

        expect(wrapper.find('input[name="recovery_code"]').exists()).toBe(true);
    });

    it('hides the authentication code field', async () => {
        const wrapper = await switchToRecoveryMode();

        expect(wrapper.find('input[name="code"]').exists()).toBe(false);
    });

    it('describes itself to the layout', async () => {
        await switchToRecoveryMode();

        expect(layoutProps().at(-1)).toMatchObject({ title: 'Recovery code' });
    });

    it('shows a recovery code error', async () => {
        const wrapper = mountPage();

        setFormErrors({ code: 'The provided code is invalid.' });
        await toggleButton(wrapper).trigger('click');

        expect(wrapper.text()).not.toContain('The provided code is invalid.');
    });

    it('clears errors when switching mode', async () => {
        setFormErrors({ code: 'The provided code is invalid.' });

        const wrapper = mountPage();
        await toggleButton(wrapper).trigger('click');

        expect(formStubClearErrors()).toHaveBeenCalled();
    });

    it('switches back to the authentication code', async () => {
        const wrapper = await switchToRecoveryMode();

        await toggleButton(wrapper).trigger('click');

        expect(wrapper.find('input[name="code"]').exists()).toBe(true);
    });
});
