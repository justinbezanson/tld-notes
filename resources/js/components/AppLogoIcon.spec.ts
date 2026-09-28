import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppLogoIcon from '@/components/AppLogoIcon.vue';

describe('icon', () => {
    it('renders an svg', () => {
        expect(mount(AppLogoIcon).element.tagName.toLowerCase()).toBe('svg');
    });

    it('scales with the viewBox it declares', () => {
        expect(mount(AppLogoIcon).attributes('viewBox')).toBe('0 0 40 42');
    });

    it('applies the className prop', () => {
        const wrapper = mount(AppLogoIcon, { props: { className: 'size-5' } });

        expect(wrapper.classes()).toContain('size-5');
    });

    it('applies attributes that were passed through', () => {
        const wrapper = mount(AppLogoIcon, {
            attrs: { 'aria-hidden': 'true' },
        });

        expect(wrapper.attributes('aria-hidden')).toBe('true');
    });

    it('draws a filled path', () => {
        expect(mount(AppLogoIcon).find('path').attributes('fill')).toBe(
            'currentColor',
        );
    });
});
