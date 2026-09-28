import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Heading from '@/components/Heading.vue';

describe('Heading', () => {
    it('renders the title', () => {
        const wrapper = mount(Heading, { props: { title: 'Profile' } });

        expect(wrapper.find('h2').text()).toBe('Profile');
    });

    it('renders the description when given', () => {
        const wrapper = mount(Heading, {
            props: { title: 'Profile', description: 'Update your details.' },
        });

        expect(wrapper.text()).toContain('Update your details.');
    });

    it('omits the description paragraph when there is none', () => {
        const wrapper = mount(Heading, { props: { title: 'Profile' } });

        expect(wrapper.find('p').exists()).toBe(false);
    });

    it('drops the bottom margin for the small variant', () => {
        const wrapper = mount(Heading, {
            props: { title: 'Profile', variant: 'small' },
        });

        expect(wrapper.find('header').classes()).not.toContain('mb-8');
    });

    it('keeps the default margin for the default variant', () => {
        const wrapper = mount(Heading, { props: { title: 'Profile' } });

        expect(wrapper.find('header').classes()).toContain('mb-8');
    });
});
