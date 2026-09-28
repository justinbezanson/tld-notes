import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import ManageTwoFactor from '@/components/ManageTwoFactor.vue';
import { useTwoFactorAuth } from '@/composables/useTwoFactorAuth';
import {
    formStubAttrs,
    formStubEmit,
    resetFormStub,
    setProcessing,
} from '@/test/form';
import { resetHttp, resolveSubmit } from '@/test/http';
import { resetRouter } from '@/test/router';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

/** The modal and recovery codes have their own specs. */
const stubs = {
    TwoFactorRecoveryCodes: defineComponent({
        name: 'TwoFactorRecoveryCodes',
        setup: () => () => h('p', ['Recovery codes']),
    }),
    TwoFactorSetupModal: defineComponent({
        name: 'TwoFactorSetupModal',
        props: {
            isOpen: Boolean,
            requiresConfirmation: Boolean,
            twoFactorEnabled: Boolean,
        },
        emits: ['update:isOpen'],
        setup(props, { emit }) {
            return () =>
                h('button', { onClick: () => emit('update:isOpen', true) }, [
                    `modal ${props.isOpen ? 'open' : 'closed'}`,
                ]);
        },
    }),
};

const auth = useTwoFactorAuth();

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

function mountTwoFactor(props: Partial<Props> = {}) {
    return mount(ManageTwoFactor, {
        props: { canManageTwoFactor: true, ...props },
        global: { stubs },
    });
}

function button(wrapper: ReturnType<typeof mountTwoFactor>, label: string) {
    return wrapper
        .findAll('button')
        .find((candidate) => candidate.text().includes(label))!;
}

beforeEach(() => {
    resetRouter();
    resetHttp();
    resetFormStub();
    auth.clearTwoFactorAuthData();
});

describe('permission', () => {
    it('renders nothing without permission', () => {
        expect(mountTwoFactor({ canManageTwoFactor: false }).text()).toBe('');
    });
});

describe('enabling', () => {
    it('explains what enabling does', () => {
        expect(mountTwoFactor().text()).toContain(
            'you will be prompted for a secure pin',
        );
    });

    it('posts to the enable route', () => {
        mountTwoFactor();

        expect(formStubAttrs().action).toContain(
            '/user/two-factor-authentication',
        );
        expect(formStubAttrs().method).toBe('post');
    });

    it('disables the button while the request is in flight', () => {
        setProcessing(true);

        const wrapper = mountTwoFactor();

        expect(
            button(wrapper, 'Enable 2FA').attributes('disabled'),
        ).toBeDefined();
    });

    it('opens the setup modal once 2FA is enabled', async () => {
        const wrapper = mountTwoFactor();
        formStubEmit('success');
        await nextTick();

        expect(wrapper.text()).toContain('modal open');
    });

    it('resumes a half-finished setup instead of re-enabling', async () => {
        resolveSubmit({ svg: '<svg />', secretKey: 'ABCDEF' });
        const wrapper = mountTwoFactor();
        await auth.fetchSetupData();
        await nextTick();

        expect(wrapper.text()).toContain('Continue setup');
        expect(wrapper.text()).not.toContain('Enable 2FA');
    });

    it('resuming opens the modal', async () => {
        resolveSubmit({ svg: '<svg />', secretKey: 'ABCDEF' });
        const wrapper = mountTwoFactor();
        await auth.fetchSetupData();
        await nextTick();

        await button(wrapper, 'Continue setup').trigger('click');

        expect(wrapper.text()).toContain('modal open');
    });
});

describe('disabling', () => {
    it('explains what 2FA does once enabled', () => {
        const wrapper = mountTwoFactor({ twoFactorEnabled: true });

        expect(wrapper.text()).toContain(
            'You will be prompted for a secure, random pin',
        );
    });

    it('deletes through the same route, spoofed the way forms do', () => {
        mountTwoFactor({ twoFactorEnabled: true });

        expect(formStubAttrs().action).toContain(
            '/user/two-factor-authentication?_method=DELETE',
        );
    });

    it('does not offer the disable form while 2FA is off', () => {
        expect(mountTwoFactor().text()).not.toContain('Disable 2FA');
    });

    it('lists the recovery codes', () => {
        expect(mountTwoFactor({ twoFactorEnabled: true }).text()).toContain(
            'Recovery codes',
        );
    });
});

describe('teardown', () => {
    it('discards the setup data when the section goes away', async () => {
        resolveSubmit({ svg: '<svg />', secretKey: 'ABCDEF' });
        const wrapper = mountTwoFactor();
        await auth.fetchSetupData();

        wrapper.unmount();

        expect(auth.hasSetupData.value).toBe(false);
    });
});
