import type * as InertiaVue3 from '@inertiajs/vue3';
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, vi } from 'vitest';

// Unmounting also tears down portaled Dialog/Popover content.
enableAutoUnmount(afterEach);

// Inertia's <Head> reads the router that createInertiaApp installs, which no spec
// boots, and a real <title> is enough to assert against. Specs that need to drive
// useForm mock this module themselves through `inertiaMock()`.
vi.mock('@inertiajs/vue3', async () => {
    const { HeadStub } = await import('@/test/inertia');

    const actual = await vi.importActual<typeof InertiaVue3>('@inertiajs/vue3');

    return { ...actual, Head: HeadStub };
});

// jsdom implements none of these, and reka-ui primitives (Select, Popover,
// Dialog) reach for them while mounting.
class ResizeObserverStub implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

globalThis.ResizeObserver ??= ResizeObserverStub;

globalThis.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
})) as unknown as typeof globalThis.matchMedia;

for (const method of [
    'hasPointerCapture',
    'setPointerCapture',
    'releasePointerCapture',
    'scrollIntoView',
] as const) {
    if (!(method in Element.prototype)) {
        Element.prototype[method] = vi.fn();
    }
}
