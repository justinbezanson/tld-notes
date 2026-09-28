import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import PasskeyItem from '@/components/PasskeyItem.vue';
import { dialogButton, dialogText } from '@/test/dialog';
import type { Passkey } from '@/types/auth';

const PASSKEY: Passkey = {
    id: 7,
    name: 'Work laptop',
    authenticator: 'iCloud Keychain',
    created_at_diff: '2 days ago',
    last_used_at_diff: '3 hours ago',
};

function mountItem(passkey: Partial<Passkey> = {}) {
    return mount(PasskeyItem, {
        props: { passkey: { ...PASSKEY, ...passkey } },
        attachTo: document.body,
    });
}

async function openConfirm(wrapper: ReturnType<typeof mountItem>) {
    await wrapper.get('button').trigger('click');
    await nextTick();
    await nextTick();
}

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('details', () => {
    it('names the passkey', () => {
        expect(mountItem().text()).toContain('Work laptop');
    });

    it('shows which authenticator holds it', () => {
        expect(mountItem().text()).toContain('iCloud Keychain');
    });

    it('leaves the authenticator out when there is none', () => {
        expect(mountItem({ authenticator: null }).text()).not.toContain(
            'iCloud Keychain',
        );
    });

    it('says when it was added', () => {
        expect(mountItem().text()).toContain('Added 2 days ago');
    });

    it('says when it was last used', () => {
        expect(mountItem().text()).toContain('Last used 3 hours ago');
    });

    it('leaves the last use out for a passkey never used', () => {
        expect(mountItem({ last_used_at_diff: null }).text()).not.toContain(
            'Last used',
        );
    });
});

describe('removing', () => {
    it('asks for confirmation', async () => {
        const wrapper = mountItem();

        await openConfirm(wrapper);

        expect(dialogText()).toContain('Remove passkey');
    });

    it('names the passkey in the confirmation', async () => {
        const wrapper = mountItem();

        await openConfirm(wrapper);

        expect(dialogText()).toContain(
            'Are you sure you want to remove the "Work laptop"',
        );
    });

    it('warns that the passkey stops working', async () => {
        const wrapper = mountItem();

        await openConfirm(wrapper);

        expect(dialogText()).toContain(
            'no longer be able to use it to sign in',
        );
    });

    it('emits the passkey it should remove', async () => {
        const wrapper = mountItem();
        await openConfirm(wrapper);

        dialogButton('Remove passkey').dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
        );
        await nextTick();

        expect(wrapper.emitted('remove')?.[0]?.[0]).toBe(7);
    });

    it('hands back a way to recover from a failure', async () => {
        const wrapper = mountItem();
        await openConfirm(wrapper);

        dialogButton('Remove passkey').dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
        );
        await nextTick();

        const onError = wrapper.emitted('remove')?.[0]?.[1] as () => void;

        expect(typeof onError).toBe('function');
    });

    it('waits while the removal is in flight', async () => {
        const wrapper = mountItem();
        await openConfirm(wrapper);

        dialogButton('Remove passkey').dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
        );
        await nextTick();

        expect(dialogButton('Removing...').disabled).toBe(true);
    });

    it('accepts the removal once the failure callback fires', async () => {
        const wrapper = mountItem();
        await openConfirm(wrapper);

        dialogButton('Remove passkey').dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
        );
        await nextTick();

        const onError = wrapper.emitted('remove')?.[0]?.[1] as () => void;
        onError();
        await nextTick();

        expect(dialogButton('Remove passkey').disabled).toBe(false);
    });

    it('removes nothing when the confirmation is cancelled', async () => {
        const wrapper = mountItem();
        await openConfirm(wrapper);

        dialogButton('Cancel').dispatchEvent(
            new MouseEvent('click', { bubbles: true }),
        );
        await nextTick();

        expect(wrapper.emitted('remove')).toBeUndefined();
    });
});
