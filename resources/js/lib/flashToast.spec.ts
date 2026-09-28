import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeFlashToast } from '@/lib/flashToast';
import { resetRouter, registeredHandler, routerStub } from '@/test/router';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const { toast } = vi.hoisted(() => ({
    toast: Object.assign(vi.fn(), {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    }),
}));

vi.mock('vue-sonner', () => ({ toast }));

function flashEvent(toastPayload: unknown) {
    return new CustomEvent('flash', {
        detail: { flash: { toast: toastPayload } },
    });
}

beforeEach(() => {
    resetRouter();
    toast.success.mockClear();
    toast.error.mockClear();
    toast.info.mockClear();
    toast.warning.mockClear();
});

describe('listener', () => {
    it('listens for flash events', () => {
        initializeFlashToast();

        expect(routerStub.on).toHaveBeenCalledWith(
            'flash',
            expect.any(Function),
        );
    });
});

describe('toasts', () => {
    it('shows a success toast', () => {
        initializeFlashToast();

        registeredHandler('flash')(
            flashEvent({ type: 'success', message: 'Saved.' }),
        );

        expect(toast.success).toHaveBeenCalledWith('Saved.');
    });

    it('shows an error toast', () => {
        initializeFlashToast();

        registeredHandler('flash')(
            flashEvent({ type: 'error', message: 'Broke.' }),
        );

        expect(toast.error).toHaveBeenCalledWith('Broke.');
    });

    it('ignores a flash without a toast', () => {
        initializeFlashToast();

        registeredHandler('flash')(
            new CustomEvent('flash', { detail: { flash: {} } }),
        );

        expect(toast.success).not.toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
    });

    it('ignores a flash without any detail', () => {
        initializeFlashToast();

        registeredHandler('flash')(new CustomEvent('flash'));

        expect(toast.success).not.toHaveBeenCalled();
    });
});
