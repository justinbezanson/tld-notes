import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';

function patternId(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('pattern').attributes('id');
}

describe('pattern', () => {
    it('fills the space it covers', () => {
        const wrapper = mount(PlaceholderPattern);

        expect(wrapper.get('svg').classes()).toContain('absolute');
        expect(wrapper.get('rect').attributes('width')).toBe('100%');
    });

    it('paints the rect with its own pattern', () => {
        const wrapper = mount(PlaceholderPattern);

        expect(wrapper.get('rect').attributes('fill')).toBe(
            `url(#${patternId(wrapper)})`,
        );
    });

    it('starts its id with pattern-', () => {
        expect(patternId(mount(PlaceholderPattern))).toMatch(/^pattern-/);
    });
});
