import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PasswordInput from '@/components/PasswordInput.vue';

function mountInput(attrs: Record<string, unknown> = {}) {
    return mount(PasswordInput, {
        attrs: { name: 'password', ...attrs },
        attachTo: document.body,
    });
}

function input(wrapper: ReturnType<typeof mountInput>) {
    return wrapper.find('input');
}

function toggle(wrapper: ReturnType<typeof mountInput>) {
    return wrapper.find('button[aria-label]');
}

describe('PasswordInput', () => {
    it('masks the value by default', () => {
        expect(input(mountInput()).attributes('type')).toBe('password');
    });

    it('passes attributes through to the input', () => {
        const wrapper = mountInput({
            placeholder: 'Password',
            autocomplete: 'current-password',
        });

        expect(input(wrapper).attributes('placeholder')).toBe('Password');
        expect(input(wrapper).attributes('autocomplete')).toBe(
            'current-password',
        );
    });

    it('reveals the value when toggled', async () => {
        const wrapper = mountInput();

        await toggle(wrapper).trigger('click');

        expect(input(wrapper).attributes('type')).toBe('text');
    });

    it('hides the value again when toggled back', async () => {
        const wrapper = mountInput();

        await toggle(wrapper).trigger('click');
        await toggle(wrapper).trigger('click');

        expect(input(wrapper).attributes('type')).toBe('password');
    });

    it('labels the toggle for the current state', async () => {
        const wrapper = mountInput();

        expect(toggle(wrapper).attributes('aria-label')).toBe('Show password');

        await toggle(wrapper).trigger('click');

        expect(toggle(wrapper).attributes('aria-label')).toBe('Hide password');
    });

    it('keeps the toggle out of the tab order', () => {
        expect(toggle(mountInput()).attributes('tabindex')).toBe('-1');
    });

    it('does not submit the surrounding form when toggled', () => {
        expect(toggle(mountInput()).attributes('type')).toBe('button');
    });

    it('merges the caller class onto the input', () => {
        const wrapper = mountInput({ class: 'w-full' });

        expect(input(wrapper).classes()).toContain('pr-10');
        expect(input(wrapper).classes()).toContain('w-full');
    });

    it('exposes a focus method', () => {
        const wrapper = mountInput();

        expect((wrapper.vm as { focus: () => void }).focus).toBeTypeOf(
            'function',
        );
    });
});
