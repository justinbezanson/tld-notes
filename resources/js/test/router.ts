import { vi } from 'vitest';

/**
 * Inertia's `router` only exists once createInertiaApp has run, so components
 * that visit, reload or flush are given these spies instead. Specs assert on
 * them and clear them with `resetRouter()`.
 */
export const routerStub = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
    push: vi.fn(),
    visit: vi.fn(),
    flushAll: vi.fn(),
    on: vi.fn(),
    getSnapshot: vi.fn(() => ({
        component: null,
        props: {},
        url: '/',
        version: null,
    })),
};

export function resetRouter(): void {
    for (const method of Object.values(routerStub)) {
        method.mockClear();
    }
}

/** The handler a component registered for a router event, e.g. 'flash'. */
export function registeredHandler(event: string): (payload: unknown) => void {
    const call = routerStub.on.mock.calls.find(([name]) => name === event);

    if (!call) {
        throw new Error(`No router listener was registered for "${event}".`);
    }

    return call[1] as (payload: unknown) => void;
}
