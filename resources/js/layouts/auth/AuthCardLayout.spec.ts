import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AuthCardLayout from '@/layouts/auth/AuthCardLayout.vue';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountLayout(props: Record<string, unknown> = {}) {
    return mount(AuthCardLayout, {
        props: {
            title: 'Create account',
            description: 'Get started',
            ...props,
        },
        slots: { default: '<form>form</form>' },
    });
}

describe('card', () => {
    it('shows the title in the card', () => {
        const wrapper = mountLayout();

        expect(wrapper.get('[data-slot="card-title"]').text()).toBe(
            'Create account',
        );
    });

    it('shows the description in the card', () => {
        const wrapper = mountLayout();

        expect(wrapper.get('[data-slot="card-description"]').text()).toBe(
            'Get started',
        );
    });

    it('renders the form inside the card', () => {
        const wrapper = mountLayout();

        expect(wrapper.get('[data-slot="card-content"]').text()).toContain(
            'form',
        );
    });
});

describe('branding', () => {
    it('links the logo home', () => {
        const logo = mountLayout().get('svg');

        expect(logo.element.closest('a')?.getAttribute('href')).toBe('/');
    });

    it('rounds the card off', () => {
        expect(mountLayout().get('[data-slot="card"]').classes()).toContain(
            'rounded-xl',
        );
    });
});
