import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthSplitLayout from '@/layouts/auth/AuthSplitLayout.vue';
import { setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountLayout(props: Record<string, unknown> = {}) {
    return mount(AuthSplitLayout, {
        props: { title: 'Log in', description: 'Welcome back', ...props },
        slots: { default: '<form>form</form>' },
    });
}

beforeEach(() => {
    setPageProps({ name: 'TLD Notes' });
});

describe('branding', () => {
    it('names the application', () => {
        expect(mountLayout().text()).toContain('TLD Notes');
    });

    it('links the logo home', () => {
        const wrapper = mountLayout();

        expect(
            wrapper.get('svg').element.closest('a')?.getAttribute('href'),
        ).toBe('/');
    });
});

describe('heading', () => {
    it('shows the title', () => {
        expect(mountLayout().get('h1').text()).toBe('Log in');
    });

    it('shows the description', () => {
        expect(mountLayout().text()).toContain('Welcome back');
    });

    it('leaves the title out when there is none', () => {
        expect(mountLayout({ title: '' }).find('h1').exists()).toBe(false);
    });

    it('leaves the description out when there is none', () => {
        const wrapper = mountLayout({ description: '' });

        expect(wrapper.find('p').exists()).toBe(false);
    });
});

describe('slot', () => {
    it('renders the form', () => {
        expect(mountLayout().text()).toContain('form');
    });
});
