import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Goals from '@/pages/Goals.vue';

describe('goals page', () => {
    it('names the page', () => {
        expect(mount(Goals).get('h1').text()).toBe('Goals');
    });

    it('fills the space the layout gives it', () => {
        expect(mount(Goals).get('div').classes()).toContain('flex-1');
    });

    it('is a placeholder for now', () => {
        expect(mount(Goals).text()).toBe('Goals');
    });
});
