import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import TwoFactorRecoveryCodes from '@/components/TwoFactorRecoveryCodes.vue';
import { useTwoFactorAuth } from '@/composables/useTwoFactorAuth';
import { formStubEmit, resetFormStub } from '@/test/form';
import { httpStub, rejectSubmit, resetHttp, resolveSubmit } from '@/test/http';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const auth = useTwoFactorAuth();

function mountCodes() {
    return mount(TwoFactorRecoveryCodes, { attachTo: document.body });
}

function toggle(wrapper: ReturnType<typeof mountCodes>) {
    return wrapper
        .findAll('button')
        .find((button) => button.text().includes('recovery codes'))!;
}

function codes(wrapper: ReturnType<typeof mountCodes>) {
    return wrapper.findAll('div.font-mono > div').map((row) => row.text());
}

function regenerateButton(wrapper: ReturnType<typeof mountCodes>) {
    return wrapper
        .findAll('button')
        .find((button) => button.text().includes('Regenerate codes'));
}

async function mountWithCodes(payload: string[]) {
    resolveSubmit(payload);

    const wrapper = mountCodes();
    await nextTick();

    return wrapper;
}

async function reveal(payload: string[] = ['alpha-code']) {
    const wrapper = await mountWithCodes(payload);
    await toggle(wrapper).trigger('click');
    await nextTick();

    return wrapper;
}

beforeEach(() => {
    resetHttp();
    resetFormStub();
    auth.clearTwoFactorAuthData();
});

describe('card', () => {
    it('explains what the codes are for', () => {
        expect(mountCodes().text()).toContain('2FA recovery codes');
    });

    it('starts hidden behind a reveal button', () => {
        expect(toggle(mountCodes()).text()).toContain('View recovery codes');
    });
});

describe('fetching', () => {
    it('fetches the codes on mount', async () => {
        resolveSubmit(['alpha-code']);
        mountCodes();
        await nextTick();

        expect(auth.recoveryCodesList.value).toEqual(['alpha-code']);
    });

    it('fetches the codes again when revealed without any loaded', async () => {
        const wrapper = await mountWithCodes([]);
        httpStub.submit.mockClear();
        resolveSubmit(['alpha-code']);

        await toggle(wrapper).trigger('click');
        await nextTick();

        expect(httpStub.submit).toHaveBeenCalled();
        expect(auth.recoveryCodesList.value).toEqual(['alpha-code']);
    });

    it('does not refetch codes it already has', async () => {
        const wrapper = await mountWithCodes(['alpha-code']);
        httpStub.submit.mockClear();

        await toggle(wrapper).trigger('click');
        await nextTick();

        expect(httpStub.submit).not.toHaveBeenCalled();
    });

    it('shows a skeleton while the codes are loading', async () => {
        const wrapper = await mountWithCodes([]);
        await toggle(wrapper).trigger('click');
        await nextTick();

        expect(wrapper.findAll('div.animate-pulse')).toHaveLength(8);
        expect(codes(wrapper)).toEqual(['']);
    });

    it('reports a failed fetch', async () => {
        rejectSubmit();
        const wrapper = mountCodes();

        await vi.waitFor(() => {
            expect(wrapper.text()).toContain('Failed to fetch recovery codes');
        });
    });
});

describe('revealing', () => {
    it('lists the codes once revealed', async () => {
        const wrapper = await reveal(['alpha-code', 'beta-code']);

        expect(codes(wrapper)).toEqual(['alpha-code', 'beta-code']);
    });

    it('swaps the reveal button for a hide button', async () => {
        const wrapper = await reveal();

        expect(toggle(wrapper).text()).toContain('Hide recovery codes');
    });

    it('hides the codes again', async () => {
        const wrapper = await reveal();

        await toggle(wrapper).trigger('click');
        await nextTick();

        expect(toggle(wrapper).text()).toContain('View recovery codes');
    });

    it('scrolls the codes into view when revealed', async () => {
        // jsdom has no layout, so the shared setup stub stands in for scrolling.
        const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');

        await reveal();

        expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
});

describe('regenerating', () => {
    it('only offers regeneration while the codes are visible', async () => {
        const hidden = await mountWithCodes(['alpha-code']);

        expect(regenerateButton(hidden)).toBeUndefined();

        const shown = await reveal();

        expect(regenerateButton(shown)).toBeTruthy();
    });

    it('posts to the recovery codes route', async () => {
        const wrapper = await reveal();
        const form = wrapper.find('form');

        expect(form.attributes('action')).toContain(
            '/user/two-factor-recovery-codes',
        );
        expect(form.attributes('method')).toBe('post');
    });

    it('refetches the codes after regenerating', async () => {
        const wrapper = await reveal();
        httpStub.submit.mockClear();
        resolveSubmit(['fresh-code']);

        formStubEmit('success');
        await nextTick();
        await nextTick();

        expect(httpStub.submit).toHaveBeenCalled();
        expect(codes(wrapper)).toEqual(['fresh-code']);
    });

    it('explains that each code only works once', async () => {
        expect((await reveal()).text()).toContain('can be used once');
    });
});
