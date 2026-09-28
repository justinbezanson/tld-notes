import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import ManagePasskeys from '@/components/ManagePasskeys.vue';
import { resetRouter, routerStub } from '@/test/router';
import type { Passkey } from '@/types/auth';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const PASSKEYS: Passkey[] = [
    {
        id: 7,
        name: 'Work laptop',
        authenticator: 'iCloud Keychain',
        created_at_diff: '2 days ago',
        last_used_at_diff: '3 hours ago',
    },
    {
        id: 9,
        name: 'Phone',
        authenticator: null,
        created_at_diff: '1 month ago',
        last_used_at_diff: null,
    },
];

/** The children only need to raise the events ManagePasskeys wires up. */
const PasskeyItemStub = defineComponent({
    name: 'PasskeyItem',
    props: { passkey: { type: Object, required: true } },
    emits: ['remove'],
    setup(props, { emit }) {
        return () =>
            h(
                'button',
                { onClick: () => emit('remove', props.passkey.id, onError) },
                [props.passkey.name],
            );
    },
});

const PasskeyRegisterStub = defineComponent({
    name: 'PasskeyRegister',
    emits: ['success'],
    setup(_, { emit }) {
        return () =>
            h('button', { onClick: () => emit('success') }, ['Add passkey']);
    },
});

let onError: () => void;

function mountPasskeys(props: Record<string, unknown> = {}) {
    return mount(ManagePasskeys, {
        props: { canManagePasskeys: true, passkeys: PASSKEYS, ...props },
        global: {
            stubs: {
                PasskeyItem: PasskeyItemStub,
                PasskeyRegister: PasskeyRegisterStub,
            },
        },
    });
}

beforeEach(() => {
    resetRouter();
    onError = vi.fn();
});

describe('permission', () => {
    it('renders nothing without permission, passkeys or not', () => {
        const wrapper = mountPasskeys({ canManagePasskeys: false });

        expect(wrapper.text()).toBe('');
    });
});

describe('list', () => {
    it('lists every passkey', () => {
        const wrapper = mountPasskeys();

        expect(wrapper.text()).toContain('Work laptop');
        expect(wrapper.text()).toContain('Phone');
    });

    it('explains how to add the first passkey', () => {
        const wrapper = mountPasskeys({ passkeys: [] });

        expect(wrapper.text()).toContain('No passkeys yet');
        expect(wrapper.text()).toContain(
            'Add a passkey to sign in without a password',
        );
    });

    it('omits the empty state when passkeys exist', () => {
        expect(mountPasskeys().text()).not.toContain('No passkeys yet');
    });

    it('offers the register form', () => {
        expect(mountPasskeys().text()).toContain('Add passkey');
    });
});

describe('removing', () => {
    async function remove(
        wrapper: ReturnType<typeof mountPasskeys>,
        name: string,
    ) {
        const item = wrapper
            .findAll('button')
            .find((button) => button.text() === name)!;

        await item.trigger('click');
        await nextTick();
    }

    it('deletes the passkey that was asked for', async () => {
        const wrapper = mountPasskeys();

        await remove(wrapper, 'Phone');

        expect(routerStub.delete).toHaveBeenCalledWith(
            '/user/passkeys/9',
            expect.anything(),
        );
    });

    it('keeps the scroll position while deleting', async () => {
        const wrapper = mountPasskeys();

        await remove(wrapper, 'Phone');

        expect(routerStub.delete).toHaveBeenCalledWith(
            '/user/passkeys/9',
            expect.objectContaining({ preserveScroll: true }),
        );
    });

    it('surfaces a failure back to the item', async () => {
        const wrapper = mountPasskeys();

        await remove(wrapper, 'Phone');

        const onDeleteError = routerStub.delete.mock.calls.at(0)?.[1]
            ?.onError as () => void;
        onDeleteError();

        expect(onError).toHaveBeenCalled();
    });
});

describe('registering', () => {
    it('reloads the page so the new passkey shows up', async () => {
        const wrapper = mountPasskeys();

        await wrapper
            .findAll('button')
            .find((button) => button.text() === 'Add passkey')!
            .trigger('click');
        await nextTick();

        expect(routerStub.reload).toHaveBeenCalled();
    });

    it('deletes nothing', async () => {
        const wrapper = mountPasskeys();

        await wrapper
            .findAll('button')
            .find((button) => button.text() === 'Add passkey')!
            .trigger('click');
        await nextTick();

        expect(routerStub.delete).not.toHaveBeenCalled();
    });
});
