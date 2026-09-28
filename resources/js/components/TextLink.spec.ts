import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import TextLink from '@/components/TextLink.vue';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountLink(props: Record<string, unknown> = {}) {
    return mount(TextLink, {
        props: { href: '/privacy', ...props },
        slots: { default: 'Privacy' },
    });
}

describe('link', () => {
    it('renders the slot as the link text', () => {
        expect(mountLink().text()).toBe('Privacy');
    });

    it('points at the given href', () => {
        expect(mountLink().get('a').attributes('href')).toBe('/privacy');
    });

    it('underlines the link', () => {
        expect(mountLink().get('a').classes()).toContain('underline');
    });

    it('passes the tabindex through', () => {
        expect(
            mountLink({ tabindex: -1 }).get('a').attributes('tabindex'),
        ).toBe('-1');
    });

    it('can render as a button', () => {
        const wrapper = mountLink({ as: 'button' });

        expect(wrapper.get('button').attributes('data-href')).toBe('/privacy');
    });

    it('carries the request method for non-GET links', () => {
        expect(mountLink({ method: 'delete' }).props('method')).toBe('delete');
    });

    it('stays an anchor for plain navigation', () => {
        expect(mountLink().find('button').exists()).toBe(false);
    });
});
