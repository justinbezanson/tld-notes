import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AuthSimpleLayout from '@/layouts/auth/AuthSimpleLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountAuth(props: Record<string, unknown> = {}) {
    return mount(AuthLayout, {
        props: { title: 'Log in', description: 'Welcome back', ...props },
        slots: { default: '<form>form</form>' },
    });
}

describe('auth layout', () => {
    it('uses the simple auth shell', () => {
        expect(mountAuth().findComponent(AuthSimpleLayout).exists()).toBe(true);
    });

    it('shows the title', () => {
        expect(mountAuth().get('h1').text()).toBe('Log in');
    });

    it('shows the description', () => {
        expect(mountAuth().text()).toContain('Welcome back');
    });

    it('renders the form', () => {
        expect(mountAuth().text()).toContain('form');
    });

    it('copes with no title or description', () => {
        const wrapper = mount(AuthLayout);

        expect(wrapper.get('h1').text()).toBe('');
    });
});
