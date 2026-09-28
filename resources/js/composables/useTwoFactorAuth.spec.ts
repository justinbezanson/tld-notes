import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTwoFactorAuth } from '@/composables/useTwoFactorAuth';
import { resetHttp, resolveSubmit, rejectSubmit, httpStub } from '@/test/http';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const auth = useTwoFactorAuth();

beforeEach(() => {
    resetHttp();
    auth.clearTwoFactorAuthData();
});

describe('setup data', () => {
    it('starts with nothing to show', () => {
        expect(auth.hasSetupData.value).toBe(false);
    });

    it('stores the qr code svg', async () => {
        resolveSubmit({ svg: '<svg id="qr" />', url: 'otpauth://totp/app' });

        await auth.fetchQrCode();

        expect(auth.qrCodeSvg.value).toBe('<svg id="qr" />');
    });

    it('stores the manual setup key', async () => {
        resolveSubmit({ secretKey: 'ABCD1234' });

        await auth.fetchSetupKey();

        expect(auth.manualSetupKey.value).toBe('ABCD1234');
    });

    it('has setup data once both are fetched', async () => {
        httpStub.submit
            .mockResolvedValueOnce({
                svg: '<svg />',
                url: 'otpauth://totp/app',
            })
            .mockResolvedValueOnce({ secretKey: 'ABCD1234' });

        await auth.fetchSetupData();

        expect(auth.hasSetupData.value).toBe(true);
    });

    it('clears the setup data', async () => {
        httpStub.submit
            .mockResolvedValueOnce({
                svg: '<svg />',
                url: 'otpauth://totp/app',
            })
            .mockResolvedValueOnce({ secretKey: 'ABCD1234' });
        await auth.fetchSetupData();

        auth.clearSetupData();

        expect(auth.qrCodeSvg.value).toBeNull();
        expect(auth.manualSetupKey.value).toBeNull();
        expect(auth.hasSetupData.value).toBe(false);
    });
});

describe('failures', () => {
    it('reports a failed qr code fetch', async () => {
        rejectSubmit();

        await auth.fetchQrCode();

        expect(auth.errors.value).toEqual(['Failed to fetch QR code']);
        expect(auth.qrCodeSvg.value).toBeNull();
    });

    it('reports a failed setup key fetch', async () => {
        rejectSubmit();

        await auth.fetchSetupKey();

        expect(auth.errors.value).toEqual(['Failed to fetch a setup key']);
        expect(auth.manualSetupKey.value).toBeNull();
    });

    it('leaves no setup data behind when the fetch fails', async () => {
        rejectSubmit();

        await auth.fetchSetupData();

        expect(auth.hasSetupData.value).toBe(false);
    });

    it('clears the errors on request', async () => {
        rejectSubmit();
        await auth.fetchQrCode();

        auth.clearErrors();

        expect(auth.errors.value).toEqual([]);
    });
});

describe('recovery codes', () => {
    it('stores the codes', async () => {
        resolveSubmit(['alpha-code', 'beta-code']);

        await auth.fetchRecoveryCodes();

        expect(auth.recoveryCodesList.value).toEqual([
            'alpha-code',
            'beta-code',
        ]);
    });

    it('reports a failed fetch', async () => {
        rejectSubmit();

        await auth.fetchRecoveryCodes();

        expect(auth.errors.value).toEqual(['Failed to fetch recovery codes']);
        expect(auth.recoveryCodesList.value).toEqual([]);
    });

    it('drops stale errors before fetching', async () => {
        rejectSubmit();
        await auth.fetchQrCode();
        resolveSubmit(['alpha-code']);

        await auth.fetchRecoveryCodes();

        expect(auth.errors.value).toEqual([]);
    });

    it('clears the codes with the rest of the two factor data', async () => {
        resolveSubmit(['alpha-code']);
        await auth.fetchRecoveryCodes();

        auth.clearTwoFactorAuthData();

        expect(auth.recoveryCodesList.value).toEqual([]);
    });
});
