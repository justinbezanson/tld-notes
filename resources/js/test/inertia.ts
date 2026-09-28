import type * as InertiaVue3 from '@inertiajs/vue3';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { defineComponent, h, reactive } from 'vue';

export type RequestOptions = {
    preserveScroll?: boolean;
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
};

export type RequestCall = {
    method: 'post' | 'put' | 'patch' | 'delete' | 'get';
    url: string;
    options: RequestOptions;
};

type SubmitMock = Mock<
    (url: string, options?: RequestOptions) => Promise<void>
>;
type FieldsMock = Mock<(...fields: string[]) => void>;
type SetErrorMock = Mock<(field: string, value: string) => void>;
type ClearErrorsMock = Mock<(...fields: string[]) => void>;

export type FormFake<T extends Record<string, unknown>> = T & {
    errors: Record<string, string>;
    processing: boolean;
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    isDirty: boolean;
    hasErrors: boolean;
    requests: RequestCall[];
    post: SubmitMock;
    put: SubmitMock;
    patch: SubmitMock;
    delete: SubmitMock;
    get: SubmitMock;
    reset: FieldsMock;
    resetAndClearErrors: FieldsMock;
    setError: SetErrorMock;
    clearErrors: ClearErrorsMock;
};

// Every useForm() call made while a spec is mounted, in call order.
const forms: Array<FormFake<Record<string, unknown>>> = [];
const layoutPropsCalls: Array<Record<string, unknown>> = [];

/**
 * Stand-in for Inertia's useForm, which needs a router and a page to do
 * anything. Specs mock `@inertiajs/vue3` with this and assert against
 * `createdForms()`; each submit is recorded on `form.requests` so a test can
 * drive the `onSuccess` callback the component handed to Inertia.
 */
export function createForm<T extends Record<string, unknown>>(
    initial: T,
): FormFake<T> {
    const requests: RequestCall[] = [];
    const defaults = structuredClone(initial);

    const submit =
        (method: RequestCall['method']) =>
        (url: string, options: RequestOptions = {}) => {
            requests.push({ method, url, options });

            return Promise.resolve();
        };

    const form = reactive({
        ...initial,
        errors: {},
        processing: false,
        wasSuccessful: false,
        recentlySuccessful: false,
        isDirty: false,
        hasErrors: false,
        requests,
        post: vi.fn(submit('post')),
        put: vi.fn(submit('put')),
        patch: vi.fn(submit('patch')),
        delete: vi.fn(submit('delete')),
        get: vi.fn(submit('get')),
        reset: vi.fn((...fields: string[]) => {
            resetFields(form, defaults, fields);
        }),
        resetAndClearErrors: vi.fn((...fields: string[]) => {
            resetFields(form, defaults, fields);
            form.errors = {};
        }),
        setError: vi.fn((field: string, value: string) => {
            form.errors[field] = value;
        }),
        clearErrors: vi.fn((...fields: string[]) => {
            if (fields.length === 0) {
                form.errors = {};

                return;
            }

            for (const field of fields) {
                delete form.errors[field];
            }
        }),
    }) as unknown as FormFake<T>;

    forms.push(form as unknown as FormFake<Record<string, unknown>>);

    return form;
}

/** Mirrors Inertia: reset() puts fields back to the values the form was made with. */
function resetFields(
    form: FormFake<Record<string, unknown>>,
    defaults: Record<string, unknown>,
    fields: string[],
): void {
    for (const [key, value] of Object.entries(defaults)) {
        if (fields.length === 0 || fields.includes(key)) {
            form[key] = structuredClone(value);
        }
    }
}

export function createdForms(): Array<FormFake<Record<string, unknown>>> {
    return forms;
}
export function lastForm(): FormFake<Record<string, unknown>> {
    const form = forms.at(-1);

    if (!form) {
        throw new Error('No useForm call was made. Mount a component first.');
    }

    return form;
}

export function resetForms(): void {
    forms.length = 0;
}

/** Runs the onSuccess the component handed to Inertia for the last submit. */
export function succeedLastRequest(
    form: FormFake<Record<string, unknown>>,
): void {
    form.requests.at(-1)?.options.onSuccess?.();
}

/** Populates form errors the way Inertia does, then runs the component's onError. */
export function failLastRequest(
    form: FormFake<Record<string, unknown>>,
    errors: Record<string, string>,
): void {
    form.errors = errors;
    form.requests.at(-1)?.options.onError?.(errors);
}

/** <Head> needs the router createInertiaApp installs, which specs never boot. */
export const HeadStub = defineComponent({
    name: 'Head',
    props: { title: { type: String, required: false } },
    setup: (props) => () => h('title', props.title),
});

/**
 * Factory for `vi.mock('@inertiajs/vue3', () => inertiaMock())`: the real
 * module with a useForm that records requests and a <Head> that renders a
 * plain <title>, so pages mount without an Inertia app around them.
 */
export async function inertiaMock(): Promise<Record<string, unknown>> {
    const actual = await vi.importActual<typeof InertiaVue3>('@inertiajs/vue3');
    const { FormStub } = await import('@/test/form');
    const { LinkStub } = await import('@/test/link');
    const { pageStub } = await import('@/test/page');
    const { routerStub } = await import('@/test/router');
    const { httpStub } = await import('@/test/http');

    return {
        ...actual,
        Head: HeadStub,
        Form: FormStub,
        Link: LinkStub,
        useForm: createForm,
        usePage: pageStub,
        router: routerStub,
        useHttp: () => httpStub,
        setLayoutProps: vi.fn((props: Record<string, unknown>) => {
            layoutPropsCalls.push(props);
        }),
    };
}

/** What pages handed to setLayoutProps, newest last. */
export function layoutProps(): Array<Record<string, unknown>> {
    return layoutPropsCalls;
}

export function resetLayoutProps(): void {
    layoutPropsCalls.length = 0;
}
