import { mount } from '@vue/test-utils';
import type * as VueUseCore from '@vueuse/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TwoFactorSetupModal from '@/components/TwoFactorSetupModal.vue';
import { useTwoFactorAuth } from '@/composables/useTwoFactorAuth';
import { dialogButton, dialogText } from '@/test/dialog';
import {
    formStubAttrs,
    formStubEmit,
    resetFormStub,
    setFormErrors,
    setProcessing,
} from '@/test/form';
import { httpStub, rejectSubmit, resetHttp, resolveSubmit } from '@/test/http';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const clipboard = vi.hoisted(() => ({
    copy: vi.fn(),
    copied: undefined as { value: boolean } | undefined,
}));

vi.mock('@vueuse/core', async () => {
    const actual = await vi.importActual<typeof VueUseCore>('@vueuse/core');
    const { ref } = await import('vue');

    return {
        ...actual,
        useClipboard: () => {
            const copied = ref(false);
            clipboard.copied = copied;

            return { copy: clipboard.copy, copied };
        },
    };
});

const auth = useTwoFactorAuth();

type Props = {
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
};

function mountModal(props: Partial<Props> = {}) {
    return mount(TwoFactorSetupModal, {
        props: {
            requiresConfirmation: false,
            twoFactorEnabled: false,
            ...props,
        },
        attachTo: document.body,
    });
}

async function openModal(props: Partial<Props> = {}) {
    const wrapper = mountModal(props);

    await wrapper.setProps({ isOpen: true });
    await flushDialog();

    return wrapper;
}

/** Dialog content is portaled, so it lands a tick or two after opening. */
async function flushDialog() {
    await nextTick();
    await vi.waitFor(() => {
        expect(dialogText()).toMatch(
            /[Tt]wo-factor authentication|Verify authentication code/,
        );
    });
    await nextTick();
}

async function click(label: string) {
    dialogButton(label).dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
    );
    await nextTick();
    await nextTick();
}

beforeEach(() => {
    resetHttp();
    resetFormStub();
    auth.clearTwoFactorAuthData();
    clipboard.copy.mockClear();
});

describe('setup step', () => {
    it('asks the user to enable two-factor authentication', async () => {
        await openModal();

        expect(dialogText()).toContain('Enable two-factor authentication');
    });

    it('confirms an already enabled setup instead', async () => {
        await openModal({ twoFactorEnabled: true });

        expect(dialogText()).toContain('Two-factor authentication enabled');
        expect(document.querySelector('button')?.textContent).toContain(
            'Close',
        );
    });

    it('fetches the QR code and setup key when opened', async () => {
        await openWithSetupData();

        expect(httpStub.submit).toHaveBeenCalledTimes(2);
        expect(auth.hasSetupData.value).toBe(true);
    });

    it('keeps loading while the request is in flight', async () => {
        hangRequests();

        await openModal();

        expect(spinners().length).toBeGreaterThan(0);
    });

    it('does not refetch setup data it already has', async () => {
        const wrapper = await openWithSetupData();
        httpStub.submit.mockClear();

        await wrapper.setProps({ isOpen: false });
        await nextTick();
        await wrapper.setProps({ isOpen: true });
        await flushDialog();

        expect(httpStub.submit).not.toHaveBeenCalled();
    });

    it('renders the QR code once it arrives', async () => {
        await openWithSetupData();

        expect(document.body.innerHTML).toContain('<svg data-test="qr"');
        expect(spinners()).toEqual([]);
    });

    it('shows the manual setup key', async () => {
        await openWithSetupData();

        expect(
            (document.querySelector('input[readonly]') as HTMLInputElement)
                .value,
        ).toBe('ABCDEF');
    });

    it('copies the manual setup key', async () => {
        await openWithSetupData();

        copyButton()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();

        expect(clipboard.copy).toHaveBeenCalledWith('ABCDEF');
    });

    it('hides the copy button until the setup key arrives', async () => {
        hangRequests();

        await openModal();

        expect(copyButton()).toBeNull();
    });

    it('reports a failed setup fetch', async () => {
        rejectSubmit();

        await openModal();
        await vi.waitFor(() => {
            expect(dialogText()).toContain('Failed to fetch QR code');
        });
    });

    it('hides the setup data when the fetch failed', async () => {
        rejectSubmit();

        await openModal();
        await vi.waitFor(() => {
            expect(dialogText()).toContain('Failed to fetch QR code');
        });

        expect(copyButton()).toBeNull();
        expect(spinners()).toEqual([]);
    });
});

describe('leaving the setup step', () => {
    it('closes without confirmation when no code is required', async () => {
        const wrapper = await openWithSetupData();

        await click('Continue');

        expect(wrapper.emitted('update:isOpen')).toEqual([[false]]);
    });

    it('clears the setup data it no longer needs', async () => {
        await openWithSetupData();

        await click('Continue');

        expect(auth.hasSetupData.value).toBe(false);
    });

    it('asks for the code when one is required', async () => {
        await openWithSetupData({ requiresConfirmation: true });

        await click('Continue');

        expect(dialogText()).toContain('Verify authentication code');
    });

    it('keeps the modal open while the code is verified', async () => {
        const wrapper = await openWithSetupData({ requiresConfirmation: true });

        await click('Continue');

        expect(wrapper.emitted('update:isOpen')).toBeUndefined();
    });
});

describe('verification step', () => {
    async function openVerification() {
        const wrapper = await openWithSetupData({ requiresConfirmation: true });
        await click('Continue');

        return wrapper;
    }

    it('posts the code to the confirm route', async () => {
        await openVerification();

        expect(formStubAttrs().action).toContain(
            '/user/confirmed-two-factor-authentication',
        );
    });

    it('keeps the confirm button disabled until six digits are entered', async () => {
        await openVerification();

        expect(dialogButton('Confirm').disabled).toBe(true);
    });

    it('enables the confirm button once the code is complete', async () => {
        await openVerification();

        await enterCode('123456');

        expect(dialogButton('Confirm').disabled).toBe(false);
    });

    it('submits the code that was entered', async () => {
        await openVerification();
        await enterCode('123456');

        expect(
            (document.querySelector('input[name="code"]') as HTMLInputElement)
                .value,
        ).toBe('123456');
    });

    it('disables the inputs while the request is in flight', async () => {
        await openVerification();
        await enterCode('123456');
        setProcessing(true);
        await nextTick();

        expect(dialogButton('Confirm').disabled).toBe(true);
    });

    it('shows the code error returned by the server', async () => {
        await openVerification();
        setFormErrors({
            code: 'The provided two factor authentication code was invalid.',
        });
        await nextTick();

        expect(dialogText()).toContain(
            'The provided two factor authentication code was invalid.',
        );
    });

    it('clears the code when the request finishes', async () => {
        await openVerification();
        await enterCode('123456');

        formStubEmit('finish');
        await nextTick();
        await nextTick();

        expect(dialogButton('Confirm').disabled).toBe(true);
    });

    it('closes once the code is accepted', async () => {
        const wrapper = await openVerification();

        formStubEmit('success');
        await nextTick();

        expect(wrapper.emitted('update:isOpen')).toEqual([[false]]);
    });

    it('returns to the setup step on back', async () => {
        await openVerification();

        await click('Back');

        expect(dialogText()).toContain('Enable two-factor authentication');
    });

    it('disables back while the request is in flight', async () => {
        await openVerification();
        setProcessing(true);
        await nextTick();

        expect(dialogButton('Back').disabled).toBe(true);
    });
});

describe('resetting', () => {
    it('returns to the setup step when reopened', async () => {
        const wrapper = await openWithSetupData({ requiresConfirmation: true });
        await click('Continue');

        await wrapper.setProps({ isOpen: false });
        await nextTick();
        await wrapper.setProps({ isOpen: true });
        await nextTick();

        expect(dialogText()).toContain('Enable two-factor authentication');
    });

    it('discards the setup data once an enabled factor is confirmed', async () => {
        const wrapper = await openWithSetupData({ twoFactorEnabled: true });

        await click('Close');

        expect(wrapper.emitted('update:isOpen')).toEqual([[false]]);
        expect(auth.hasSetupData.value).toBe(false);
    });

    it('clears stale errors when reopened', async () => {
        rejectSubmit();
        const wrapper = await openModal();
        await vi.waitFor(() => {
            expect(auth.errors.value).not.toEqual([]);
        });

        resolveSubmit({ svg: '<svg data-test="qr" />', secretKey: 'ABCDEF' });
        await wrapper.setProps({ isOpen: false });
        await nextTick();
        await wrapper.setProps({ isOpen: true });
        await nextTick();
        await nextTick();

        expect(auth.errors.value).toEqual([]);
    });
});

async function openWithSetupData(props: Partial<Props> = {}) {
    resolveSubmit({
        svg: '<svg data-test="qr" />',
        secretKey: 'ABCDEF',
    });

    const wrapper = await openModal(props);
    await nextTick();
    await nextTick();

    return wrapper;
}

async function enterCode(code: string) {
    const input = document.querySelector<HTMLInputElement>('input#otp')!;

    input.value = code;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
    await nextTick();
}

/** Leaves requests in flight, so the loading state can be observed. */
function hangRequests(): void {
    httpStub.submit.mockImplementation(() => new Promise(() => {}));
}

function spinners() {
    return [...document.querySelectorAll('[aria-label="Loading"]')];
}

/** The icon-only button beside the manual setup key. */
function copyButton() {
    return (
        [...document.querySelectorAll('button')].find(
            (button) => button.textContent?.trim() === '',
        ) ?? null
    );
}
