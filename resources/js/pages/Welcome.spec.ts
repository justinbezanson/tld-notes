import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Welcome from '@/pages/Welcome.vue';
import { makeUser } from '@/test/factories';
import { pageStub, setPageProps } from '@/test/page';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

function mountWelcome() {
    return mount(Welcome, {
        // The template reads the global Inertia installs, not usePage().
        global: { mocks: { $page: pageStub() } },
        attachTo: document.body,
    });
}

function link(wrapper: ReturnType<typeof mountWelcome>, label: string) {
    return wrapper
        .findAll('a')
        .find((anchor) => anchor.text().trim() === label)!;
}

beforeEach(() => {
    setPageProps({ auth: { user: null } });
});

describe('title', () => {
    it('sets the document title', () => {
        mountWelcome();

        expect(document.title).toBe('Welcome');
    });
});

describe('guests', () => {
    it('offers a way in', () => {
        const wrapper = mountWelcome();

        expect(link(wrapper, 'Log in').attributes('href')).toBe('/login');
    });

    it('offers registration', () => {
        const wrapper = mountWelcome();

        expect(link(wrapper, 'Register').attributes('href')).toBe('/register');
    });

    it('hides the dashboard link', () => {
        expect(mountWelcome().text()).not.toContain('Dashboard');
    });
});

describe('signed in visitors', () => {
    beforeEach(() => {
        setPageProps({ auth: { user: makeUser() } });
    });

    it('offers the dashboard', () => {
        const wrapper = mountWelcome();

        expect(link(wrapper, 'Dashboard').attributes('href')).toBe(
            '/dashboard',
        );
    });

    it('hides the sign in links', () => {
        const wrapper = mountWelcome();

        expect(wrapper.text()).not.toContain('Log in');
        expect(wrapper.text()).not.toContain('Register');
    });
});

describe('marketing copy', () => {
    it('introduces the starter', () => {
        expect(mountWelcome().text()).toContain("Let's get started");
    });

    it('links the documentation', () => {
        const wrapper = mountWelcome();
        const docs = wrapper
            .findAll('a')
            .find((anchor) => anchor.text().includes('Documentation'))!;

        expect(docs.attributes('href')).toBe('https://laravel.com/docs');
    });

    it('offers deployment', () => {
        const wrapper = mountWelcome();

        expect(link(wrapper, 'Deploy now').attributes('href')).toBe(
            'https://cloud.laravel.com',
        );
    });
});
