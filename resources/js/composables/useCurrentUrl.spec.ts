import { describe, expect, it, vi } from 'vitest';
import { isReadonly } from 'vue';

vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({ url: '/runs/1' }),
}));

const { useCurrentUrl } = await import('@/composables/useCurrentUrl');

const { currentUrl, isCurrentUrl, isCurrentOrParentUrl, whenCurrentUrl } =
    useCurrentUrl();

describe('currentUrl', () => {
    it('reduces the page url to its pathname', () => {
        expect(currentUrl.value).toBe('/runs/1');
    });

    it('is readonly', () => {
        expect(isReadonly(currentUrl)).toBe(true);
    });
});

describe('isCurrentUrl', () => {
    it('matches the exact path', () => {
        expect(isCurrentUrl('/runs/1')).toBe(true);
    });

    it('rejects a different path', () => {
        expect(isCurrentUrl('/dashboard')).toBe(false);
    });

    it('does not treat a child path as current by default', () => {
        expect(isCurrentUrl('/runs/1/notes')).toBe(false);
    });

    it('honours an explicit currentUrl override', () => {
        expect(isCurrentUrl('/dashboard', '/dashboard')).toBe(true);
        expect(isCurrentUrl('/runs/1', '/dashboard')).toBe(false);
    });

    it('compares only the pathname of an absolute url', () => {
        expect(isCurrentUrl('https://example.com/runs/1')).toBe(true);
    });

    it('rejects an absolute url on another host with the same path', () => {
        expect(isCurrentUrl('https://elsewhere.test/runs/1', '/runs/1')).toBe(
            true,
        );
    });

    it('rejects an unparseable absolute url instead of throwing', () => {
        expect(isCurrentUrl('http://')).toBe(false);
    });

    it('treats a url object the same as its string form', () => {
        expect(isCurrentUrl({ url: '/runs/1', method: 'get' })).toBe(true);
    });
});

describe('isCurrentOrParentUrl', () => {
    // It answers "is the current url this url, or a child of it", which is what
    // the settings sidebar needs to highlight /settings while on /settings/profile.
    it('matches the current path', () => {
        expect(isCurrentOrParentUrl('/runs/1')).toBe(true);
    });

    it('matches an ancestor of the current path', () => {
        expect(isCurrentOrParentUrl('/runs')).toBe(true);
    });

    it('rejects a descendant of the current path', () => {
        expect(isCurrentOrParentUrl('/runs/1/notes')).toBe(false);
    });

    it('rejects an unrelated path', () => {
        expect(isCurrentOrParentUrl('/dashboard')).toBe(false);
    });

    it('does not match a sibling with a shared string prefix', () => {
        expect(isCurrentOrParentUrl('/runs/10')).toBe(false);
    });

    it('honours an explicit currentUrl override', () => {
        expect(isCurrentOrParentUrl('/dashboard', '/dashboard/profile')).toBe(
            true,
        );
    });
});

describe('whenCurrentUrl', () => {
    it('returns the true value when current', () => {
        expect(whenCurrentUrl('/runs/1', 'active', 'inactive')).toBe('active');
    });

    it('returns the false value when not current', () => {
        expect(whenCurrentUrl('/dashboard', 'active', 'inactive')).toBe(
            'inactive',
        );
    });

    it('defaults the false value to null', () => {
        expect(whenCurrentUrl('/dashboard', 'active')).toBeNull();
    });
});
