import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AlertError from '@/components/AlertError.vue';

describe('AlertError', () => {
    it('uses the default title', () => {
        const wrapper = mount(AlertError, {
            props: { errors: ['Something broke.'] },
        });

        expect(wrapper.text()).toContain('Something went wrong.');
    });

    it('accepts a custom title', () => {
        const wrapper = mount(AlertError, {
            props: { errors: ['Boom.'], title: 'Could not save.' },
        });

        expect(wrapper.text()).toContain('Could not save.');
    });

    it('lists every error', () => {
        const wrapper = mount(AlertError, {
            props: { errors: ['First problem.', 'Second problem.'] },
        });

        expect(wrapper.findAll('li')).toHaveLength(2);
    });

    it('de-duplicates repeated errors', () => {
        const wrapper = mount(AlertError, {
            props: { errors: ['Same problem.', 'Same problem.'] },
        });

        expect(wrapper.findAll('li')).toHaveLength(1);
    });

    it('renders no list items without errors', () => {
        const wrapper = mount(AlertError, { props: { errors: [] } });

        expect(wrapper.findAll('li')).toHaveLength(0);
    });
});
