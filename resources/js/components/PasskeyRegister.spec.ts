import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import PasskeyRegister from '@/components/PasskeyRegister.vue';

const state = vi.hoisted(() => ({
    isSupported: true,
    isLoading: false,
    error: null as string | null,
    register: vi.fn(),
    onSuccess: undefined as (() => void) | undefined,
}));

vi.mock('@laravel/passkeys/vue', async () => {
    const { ref } = await import('vue');
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    return {
        usePasskeyRegister: (config: { onSuccess: () => void }) => {
            state.onSuccess = config.onSuccess;
            isLoading.value = state.isLoading;
            error.value = state.error;

            return {
                register: state.register,
                isLoading,
                error,
                isSupported: state.isSupported,
            };
        },
    };
});

const CHROME_ON_MAC =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const EDGE_ON_WINDOWS =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
const FIREFOX_ON_IPHONE =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15';

function mountRegister() {
    return mount(PasskeyRegister);
}

function button(wrapper: ReturnType<typeof mountRegister>, label: string) {
    return wrapper
        .findAll('button')
        .find((candidate) => candidate.text().includes(label))!;
}

function setUserAgent(userAgent: string) {
    Object.defineProperty(window.navigator, 'userAgent', {
        value: userAgent,
        configurable: true,
    });
}

async function setName(
    wrapper: ReturnType<typeof mountRegister>,
    name: string,
) {
    await nameInput(wrapper).setValue(name);
}

function nameInput(wrapper: ReturnType<typeof mountRegister>) {
    return wrapper.get<HTMLInputElement>('#passkey-name');
}

async function openForm() {
    const wrapper = mountRegister();
    await button(wrapper, 'Add passkey').trigger('click');
    await nextTick();

    return wrapper;
}

beforeEach(() => {
    state.isSupported = true;
    state.isLoading = false;
    state.error = null;
    state.register.mockClear();
    state.onSuccess = undefined;
    setUserAgent(CHROME_ON_MAC);
});

describe('support', () => {
    it('explains that passkeys are unavailable where unsupported', () => {
        state.isSupported = false;

        expect(mountRegister().text()).toContain(
            'Passkeys are not supported in this browser.',
        );
    });

    it('offers to add a passkey where they are supported', () => {
        expect(mountRegister().text()).toContain('Add passkey');
    });
});

describe('default name', () => {
    it('guesses the browser and operating system', async () => {
        setUserAgent(CHROME_ON_MAC);
        const wrapper = await openForm();

        expect(nameInput(wrapper).element.value).toBe('Chrome on Mac');
    });

    it('prefers Edge over Chrome', async () => {
        setUserAgent(EDGE_ON_WINDOWS);
        const wrapper = await openForm();

        expect(nameInput(wrapper).element.value).toBe('Edge on Windows');
    });

    it('recognises mobile browsers', async () => {
        setUserAgent(FIREFOX_ON_IPHONE);
        const wrapper = await openForm();

        expect(nameInput(wrapper).element.value).toBe('Firefox on iPhone');
    });

    it('leaves the name empty for an unrecognised client', async () => {
        setUserAgent('SomeUnknownClient/1.0');
        const wrapper = await openForm();

        expect(nameInput(wrapper).element.value).toBe('');
    });
});

describe('naming', () => {
    it('explains what the name is for', async () => {
        expect((await openForm()).text()).toContain(
            'A name helps you identify this passkey later.',
        );
    });

    it('keeps the submit disabled until the name is filled in', async () => {
        const wrapper = await openForm();
        await setName(wrapper, '   ');
        await nextTick();

        expect(
            button(wrapper, 'Register passkey').attributes('disabled'),
        ).toBeDefined();
    });

    it('enables the submit once the name is filled in', async () => {
        const wrapper = await openForm();
        await setName(wrapper, 'Work laptop');
        await nextTick();

        expect(
            button(wrapper, 'Register passkey').attributes('disabled'),
        ).toBeUndefined();
    });
});

describe('registering', () => {
    it('registers the entered name', async () => {
        const wrapper = await openForm();
        await setName(wrapper, 'Work laptop');

        await wrapper.find('form').trigger('submit');

        expect(state.register).toHaveBeenCalledWith('Work laptop');
    });

    it('ignores a submission without a name', async () => {
        const wrapper = await openForm();
        await setName(wrapper, '  ');

        await wrapper.find('form').trigger('submit');

        expect(state.register).not.toHaveBeenCalled();
    });

    it('disables the form while registering', async () => {
        state.isLoading = true;
        const wrapper = await openForm();

        expect(
            button(wrapper, 'Registering...').attributes('disabled'),
        ).toBeDefined();
    });

    it('reports a failed registration', async () => {
        state.error = 'Passkeys are not supported on this device.';
        const wrapper = await openForm();

        expect(wrapper.text()).toContain(
            'Passkeys are not supported on this device.',
        );
    });
});

describe('succeeding', () => {
    it('emits success so the list can refresh', async () => {
        const wrapper = await openForm();
        await setName(wrapper, 'Work laptop');
        await wrapper.find('form').trigger('submit');

        state.onSuccess?.();
        await nextTick();

        expect(wrapper.emitted('success')).toHaveLength(1);
    });

    it('closes the form', async () => {
        const wrapper = await openForm();

        state.onSuccess?.();
        await nextTick();

        expect(wrapper.text()).toContain('Add passkey');
    });

    it('forgets the entered name', async () => {
        const wrapper = await openForm();
        await setName(wrapper, 'Work laptop');

        state.onSuccess?.();
        await nextTick();
        await button(wrapper, 'Add passkey').trigger('click');
        await nextTick();

        expect(nameInput(wrapper).element.value).toBe('');
    });
});

describe('cancelling', () => {
    it('hides the form again', async () => {
        const wrapper = await openForm();

        await button(wrapper, 'Cancel').trigger('click');
        await nextTick();

        expect(wrapper.text()).toContain('Add passkey');
    });

    it('forgets the entered name', async () => {
        const wrapper = await openForm();
        await setName(wrapper, 'Work laptop');

        await button(wrapper, 'Cancel').trigger('click');
        await button(wrapper, 'Add passkey').trigger('click');
        await nextTick();

        expect(nameInput(wrapper).element.value).toBe('');
    });

    it('registers nothing', async () => {
        const wrapper = await openForm();
        await setName(wrapper, 'Work laptop');

        await button(wrapper, 'Cancel').trigger('click');

        expect(state.register).not.toHaveBeenCalled();
    });
});
