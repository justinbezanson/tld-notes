import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    createForm,
    createdForms,
    failLastRequest,
    lastForm,
    resetForms,
    succeedLastRequest,
} from '@/test/inertia';

interface Fields extends Record<string, unknown> {
    title: string;
    quantity: number;
}

function makeFields(overrides: Partial<Fields> = {}) {
    return createForm<Fields>({ title: '', quantity: 1, ...overrides });
}

beforeEach(() => resetForms());

describe('registration', () => {
    it('records every form the component creates', () => {
        makeFields();
        makeFields();

        expect(createdForms()).toHaveLength(2);
    });

    it('exposes the last form', () => {
        const first = makeFields({ title: 'First' });
        const second = makeFields({ title: 'Second' });

        expect(lastForm()).toBe(second);
        expect(createdForms()[0]).toBe(first);
    });

    it('throws when nothing was created', () => {
        expect(() => lastForm()).toThrow(/No useForm call/);
    });

    it('does not share field state between forms', () => {
        const first = makeFields();
        makeFields();

        first.title = 'Rope';

        expect(createdForms()[1]!.title).toBe('');
    });
});

describe('requests', () => {
    it('records the method and url of a submit', async () => {
        const form = makeFields();

        await form.post('/runs/3/notes');

        expect(form.requests[0]).toMatchObject({
            method: 'post',
            url: '/runs/3/notes',
        });
    });

    it('records the options handed to the submit', () => {
        const form = makeFields();
        const onSuccess = () => {};

        form.delete('/runs/3/notes/1', { preserveScroll: true, onSuccess });

        expect(form.requests[0]?.options.preserveScroll).toBe(true);
        expect(form.requests[0]?.options.onSuccess).toBe(onSuccess);
    });

    it('keeps every request in order', async () => {
        const form = makeFields();

        await form.post('/notes');
        await form.put('/notes/1');

        expect(form.requests.map((request) => request.method)).toEqual([
            'post',
            'put',
        ]);
    });

    it('runs the onSuccess the component passed', () => {
        const form = makeFields();
        const onSuccess = vi.fn();

        form.post('/notes', { onSuccess });
        succeedLastRequest(form);

        expect(onSuccess).toHaveBeenCalledOnce();
    });

    it('runs the onError with the server errors', () => {
        const form = makeFields();
        const onError = vi.fn();

        form.post('/notes', { onError });
        failLastRequest(form, { title: 'The title field is required.' });

        expect(onError).toHaveBeenCalledWith({
            title: 'The title field is required.',
        });
        expect(form.errors.title).toBe('The title field is required.');
    });
});

describe('reset', () => {
    it('restores the defaults the form was created with', () => {
        const form = makeFields({ title: 'Cargo' });

        form.title = 'Rope';
        form.reset();

        expect(form.title).toBe('Cargo');
    });

    it('leaves untouched fields alone when given a field list', () => {
        const form = makeFields({ title: 'Cargo' });

        form.title = 'Rope';
        form.quantity = 5;
        form.reset('title');

        expect(form.title).toBe('Cargo');
        expect(form.quantity).toBe(5);
    });

    it('clears errors on resetAndClearErrors', () => {
        const form = makeFields();

        form.setError('title', 'Required.');
        form.resetAndClearErrors();

        expect(form.errors).toEqual({});
    });

    it('sets a single error', () => {
        const form = makeFields();

        form.setError('title', 'Required.');

        expect(form.errors).toEqual({ title: 'Required.' });
    });

    it('clears the named errors and keeps the rest', () => {
        const form = makeFields();

        form.setError('title', 'Required.');
        form.setError('quantity', 'Too many.');
        form.clearErrors('title');

        expect(form.errors).toEqual({ quantity: 'Too many.' });
    });

    it('clears every error when called with no fields', () => {
        const form = makeFields();

        form.setError('title', 'Required.');
        form.setError('quantity', 'Too many.');
        form.clearErrors();

        expect(form.errors).toEqual({});
    });

    it('ignores clearing a field that has no error', () => {
        const form = makeFields();

        form.setError('title', 'Required.');
        form.clearErrors('quantity');

        expect(form.errors).toEqual({ title: 'Required.' });
    });
});
