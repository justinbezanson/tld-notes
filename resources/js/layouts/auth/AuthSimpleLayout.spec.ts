import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AuthSimpleLayout from '@/layouts/auth/AuthSimpleLayout.vue';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountLayout(props: Record<string, unknown> = {}) {
    return mount(AuthSimpleLayout, {
        props: { title: 'Log in', description: 'Welcome back', ...props },
        slots: { default: '<form>form</form>' },
    });
}

describe('heading', () => {
    it('shows the title', () => {
        expect(mountLayout().get('h1').text()).toBe('Log in');
    });

    it('shows the description', () => {
        expect(mountLayout().text()).toContain('Welcome back');
    });
});

describe('branding', () => {
    it('links the logo home', () => {
        const logo = mountLayout().get('svg');

        expect(logo.element.closest('a')?.getAttribute('href')).toBe('/');
    });
});

describe('slot', () => {
    it('renders the form', () => {
        expect(mountLayout().text()).toContain('form');
    });
});
