import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PasskeyVerify from '@/components/PasskeyVerify.vue';

const state = vi.hoisted(() => ({
    isSupported: true,
    isLoading: false,
    error: null as string | null,
    verify: vi.fn(),
    options: null as Record<string, unknown> | null,
}));

vi.mock('@laravel/passkeys/vue', async () => {
    const { ref } = await import('vue');
    const isLoading = ref(false);

    return {
        usePasskeyVerify: (config: Record<string, unknown>) => {
            state.options = config;
            isLoading.value = state.isLoading;

            return {
                verify: state.verify,
                isLoading,
                error: state.error,
                isSupported: state.isSupported,
            };
        },
    };
});

function mountVerify(props: Record<string, unknown> = {}) {
    return mount(PasskeyVerify, { props, attachTo: document.body });
}

function verifyButton(wrapper: ReturnType<typeof mountVerify>) {
    return wrapper.findAll('button').at(0)!;
}

beforeEach(() => {
    state.isSupported = true;
    state.isLoading = false;
    state.error = null;
    state.options = null;
    state.verify.mockClear();
});

describe('support', () => {
    it('renders nothing where passkeys are unsupported', () => {
        state.isSupported = false;

        expect(mountVerify().text()).toBe('');
    });

    it('offers a passkey where they are supported', () => {
        expect(mountVerify().text()).toContain('Sign in with a passkey');
    });
});

describe('labels', () => {
    it('accepts a custom label', () => {
        expect(mountVerify({ label: 'Confirm with passkey' }).text()).toContain(
            'Confirm with passkey',
        );
    });

    it('accepts a custom separator', () => {
        expect(
            mountVerify({ separator: 'Or confirm with password' }).text(),
        ).toContain('Or confirm with password');
    });

    it('uses a default separator', () => {
        expect(mountVerify().text()).toContain('Or continue with email');
    });

    it('swaps to the loading label while authenticating', () => {
        state.isLoading = true;

        expect(mountVerify().text()).toContain('Authenticating...');
    });

    it('uses a custom loading label', () => {
        state.isLoading = true;

        expect(mountVerify({ loadingLabel: 'Confirming...' }).text()).toContain(
            'Confirming...',
        );
    });
});

describe('interaction', () => {
    it('verifies when clicked', async () => {
        const wrapper = mountVerify();

        await verifyButton(wrapper).trigger('click');

        expect(state.verify).toHaveBeenCalledOnce();
    });

    it('disables the button while authenticating', () => {
        state.isLoading = true;

        expect(
            verifyButton(mountVerify()).attributes('disabled'),
        ).toBeDefined();
    });

    it('shows the passkey error', () => {
        state.error = 'That passkey could not be verified.';

        expect(mountVerify().text()).toContain(
            'That passkey could not be verified.',
        );
    });

    it('shows no error when there is none', () => {
        expect(mountVerify().text()).not.toContain('could not be verified');
    });
});

describe('routes', () => {
    it('uses the app default when no routes are given', () => {
        mountVerify();

        expect(state.options).not.toHaveProperty('routes');
    });

    it('passes the given route urls through', () => {
        mountVerify({
            routes: {
                options: { url: '/passkeys/options', method: 'post' },
                submit: { url: '/passkeys/verify', method: 'post' },
            },
        });

        expect(state.options?.routes).toEqual({
            options: '/passkeys/options',
            submit: '/passkeys/verify',
        });
    });
});
