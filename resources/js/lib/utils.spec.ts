import { describe, expect, it } from 'vitest';
import { cn, toUrl } from '@/lib/utils';

describe('cn', () => {
    it('joins class names', () => {
        expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
    });

    it('drops falsy values', () => {
        expect(cn('px-2', undefined, null, false, '')).toBe('px-2');
    });

    it('lets a later utility win a conflict', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
    });

    it('keeps unrelated utilities', () => {
        expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('accepts arrays and objects', () => {
        expect(cn(['px-2', 'py-1'], { 'text-red-600': true })).toBe(
            'px-2 py-1 text-red-600',
        );
    });
});

describe('toUrl', () => {
    it('passes a string through', () => {
        expect(toUrl('/runs')).toBe('/runs');
    });

    it('unwraps a wayfinder url object', () => {
        expect(toUrl({ url: '/runs', method: 'get' })).toBe('/runs');
    });

    it('returns nothing for a missing href', () => {
        expect(toUrl(undefined)).toBeUndefined();
    });
});
