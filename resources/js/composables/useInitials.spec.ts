import { describe, expect, it } from 'vitest';
import { getInitials, useInitials } from '@/composables/useInitials';

describe('getInitials', () => {
    it('returns nothing without a name', () => {
        expect(getInitials()).toBe('');
        expect(getInitials('')).toBe('');
    });

    it('returns nothing for whitespace only', () => {
        expect(getInitials('   ')).toBe('');
    });

    it('uses the first letter of a single name', () => {
        expect(getInitials('ada')).toBe('A');
    });

    it('uses the first and last name', () => {
        expect(getInitials('Ada Lovelace')).toBe('AL');
    });

    it('skips the middle names', () => {
        expect(getInitials('Ada King Lovelace')).toBe('AL');
    });

    it('ignores the casing of the input', () => {
        expect(getInitials('aDA lOVELACE')).toBe('AL');
    });

    it('collapses extra whitespace', () => {
        expect(getInitials('  Ada   Lovelace  ')).toBe('AL');
    });

    it('handles a name with only an initial', () => {
        expect(getInitials('A')).toBe('A');
    });

    it('handles non-latin names', () => {
        expect(getInitials('Émile Zola')).toBe('ÉZ');
    });
});

describe('useInitials', () => {
    it('exposes the helper', () => {
        expect(useInitials().getInitials('Grace Hopper')).toBe('GH');
    });
});
