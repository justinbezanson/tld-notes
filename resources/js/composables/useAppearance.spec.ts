import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { initializeTheme, useAppearance } from '@/composables/useAppearance';
import type { Appearance } from '@/types';

type Harness = ReturnType<typeof useAppearance>;

function mountHarness() {
    let composable!: Harness;

    mount(
        defineComponent({
            setup() {
                composable = useAppearance();

                return () => h('div');
            },
        }),
    );

    return composable;
}

function stubDarkScheme(prefersDark: boolean) {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: prefersDark,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

beforeEach(() => {
    localStorage.clear();
    // The appearance ref is module scoped, so put it back before each test.
    useAppearance().updateAppearance('system');
    document.documentElement.classList.remove('dark');

    for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0].trim();

        if (name === 'appearance') {
            document.cookie = `${name}=;path=/;max-age=0`;
        }
    }
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('resolvedAppearance', () => {
    it('defaults to light when the system does not prefer dark', async () => {
        stubDarkScheme(false);

        const { resolvedAppearance } = mountHarness();
        await nextTick();

        expect(resolvedAppearance.value).toBe('light');
    });

    it('resolves system to dark when the system prefers dark', async () => {
        stubDarkScheme(true);

        const { resolvedAppearance } = mountHarness();
        await nextTick();

        expect(resolvedAppearance.value).toBe('dark');
    });

    it('resolves an explicit choice over the system preference', async () => {
        stubDarkScheme(true);

        const { appearance, resolvedAppearance } = mountHarness();
        appearance.value = 'light';
        await nextTick();

        expect(resolvedAppearance.value).toBe('light');
    });

    it('picks up a stored appearance on mount', async () => {
        stubDarkScheme(false);
        localStorage.setItem('appearance', 'dark');

        const { appearance, resolvedAppearance } = mountHarness();
        await nextTick();

        expect(appearance.value).toBe('dark');
        expect(resolvedAppearance.value).toBe('dark');
    });
});

describe('updateAppearance', () => {
    it('persists to localStorage and a cookie', () => {
        stubDarkScheme(false);

        const { updateAppearance } = mountHarness();
        updateAppearance('dark');

        expect(localStorage.getItem('appearance')).toBe('dark');
        expect(document.cookie).toContain('appearance=dark');
    });

    it('toggles the dark class on the document element', () => {
        stubDarkScheme(false);

        const { updateAppearance } = mountHarness();
        updateAppearance('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);

        updateAppearance('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('follows the system preference when set back to system', () => {
        stubDarkScheme(true);

        const { updateAppearance } = mountHarness();
        updateAppearance('system');

        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('accepts every appearance value', () => {
        stubDarkScheme(false);

        const { updateAppearance } = mountHarness();

        for (const value of ['light', 'dark', 'system'] as Appearance[]) {
            updateAppearance(value);

            expect(localStorage.getItem('appearance')).toBe(value);
        }
    });
});

describe('initializeTheme', () => {
    it('applies the stored appearance', () => {
        stubDarkScheme(false);
        localStorage.setItem('appearance', 'dark');

        initializeTheme();

        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('falls back to the system preference', () => {
        stubDarkScheme(true);

        initializeTheme();

        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('listens for system theme changes', () => {
        stubDarkScheme(false);
        const addEventListener = vi.fn();
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener,
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        initializeTheme();

        expect(addEventListener).toHaveBeenCalledWith(
            'change',
            expect.any(Function),
        );
    });
});
