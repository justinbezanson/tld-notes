import { vi } from 'vitest';

/**
 * Inertia's useHttp() talks to the server over the fetch client, which no spec
 * boots. Components that call it get this submit spy instead, and a spec decides
 * what each call resolves or rejects with.
 *
 * An undecided request rejects rather than resolving `undefined`: components
 * assign the response straight into reactive state, so a silent resolve would
 * leave them rendering `undefined` once a spec moved on.
 */
export const httpStub = {
    submit: vi.fn(),
};

export function resetHttp(): void {
    httpStub.submit.mockReset();
    httpStub.submit.mockRejectedValue(new Error('No request result queued'));
}

export function resolveSubmit(payload: unknown): void {
    httpStub.submit.mockResolvedValue(payload);
}

export function rejectSubmit(message = 'Request failed'): void {
    httpStub.submit.mockRejectedValue(new Error(message));
}
