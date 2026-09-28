import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { defineComponent, h, nextTick, reactive } from 'vue';

/**
 * Inertia's <Form> submits through the router, which no spec boots, so the
 * pages that use it get this instead: it renders a real <form> carrying the
 * wayfinder `action`/`method` attributes and hands the slot the `errors` and
 * `processing` a spec sets.
 */
type SlotState = {
    errors: Record<string, string>;
    processing: boolean;
    reset: Mock<() => void>;
    clearErrors: Mock<() => void>;
    hasErrors: boolean;
    wasSuccessful: boolean;
    isDirty: boolean;
    defaults: Record<string, unknown>;
};

const state = reactive<SlotState>({
    errors: {},
    processing: false,
    reset: vi.fn(),
    clearErrors: vi.fn(),
    hasErrors: false,
    wasSuccessful: false,
    isDirty: false,
    defaults: {},
});
const received: Array<Record<string, unknown>> = [];

export const FormStub = defineComponent({
    name: 'Form',
    inheritAttrs: false,
    setup(_, { slots, attrs }) {
        return () => {
            received.push({ ...attrs });

            return h(
                'form',
                { ...attrs, 'data-test': 'inertia-form' },
                slots.default?.(state),
            );
        };
    },
});

export function setFormErrors(errors: Record<string, string>): void {
    state.errors = errors;
}

export function setProcessing(processing: boolean): void {
    state.processing = processing;
}

export function resetFormStub(): void {
    state.errors = {};
    state.processing = false;
    state.hasErrors = false;
    state.wasSuccessful = false;
    state.isDirty = false;
    state.defaults = {};
    state.reset.mockClear();
    state.clearErrors.mockClear();
    received.length = 0;
}

/** The attributes the page's `v-bind="someRoute.form()"` handed to <Form>. */
export function formStubAttrs(): Record<string, unknown> {
    return received.at(-1) ?? {};
}

export function inertiaForm(): HTMLFormElement {
    const form = document.querySelector<HTMLFormElement>(
        'form[data-test="inertia-form"]',
    );

    if (!form) {
        throw new Error('No Inertia form is rendered.');
    }

    return form;
}

/**
 * Calls the rendered form's handler for a request outcome the way Inertia does
 * once the request settles, e.g. `formStubEmit('success')` for `onSuccess`.
 */
export function formStubEmit(event: string, ...args: unknown[]): void {
    const handler =
        received.at(-1)?.[
            `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
        ];

    if (typeof handler !== 'function') {
        throw new Error(`The rendered <Form> has no on${event} handler.`);
    }

    handler(...args);
}

export async function submitInertiaForm(): Promise<void> {
    await nextTick();

    inertiaForm().dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
    );
    await nextTick();
}

/** The slot's clearErrors, so a spec can assert the page cleared stale errors. */
export function formStubClearErrors(): Mock<() => void> {
    return state.clearErrors;
}

/** The slot's reset, so a spec can assert the form was cleared. */
export function formStubReset(): Mock<() => void> {
    return state.reset;
}
