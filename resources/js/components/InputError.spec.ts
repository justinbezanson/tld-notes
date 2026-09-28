import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InputError from '@/components/InputError.vue';

describe('InputError', () => {
    it('stays hidden without a message', () => {
        expect(mount(InputError).find('p').isVisible()).toBe(false);
    });

    it('stays hidden for an empty string', () => {
        const wrapper = mount(InputError, { props: { message: '' } });

        expect(wrapper.find('p').isVisible()).toBe(false);
    });

    it('shows the message when given', () => {
        const wrapper = mount(InputError, {
            props: { message: 'Required field.' },
        });

        expect(wrapper.find('p').isVisible()).toBe(true);
    });

    it('shows the message text', () => {
        const wrapper = mount(InputError, {
            props: { message: 'Required field.' },
        });

        expect(wrapper.find('p').text()).toBe('Required field.');
    });
});
