import { describe, expect, it } from 'vitest';
import { useGameItems } from '@/composables/useGameItems';
import itemsData from '@data/items.json';

const { groups, sections, search } = useGameItems();

const data = itemsData as {
    sections: Array<{
        title: string;
        categories: Array<{
            title: string;
            sub: string | null;
            items: Array<{ id: string; name: string }>;
        }>;
    }>;
};

describe('sections', () => {
    it('exposes the raw sections', () => {
        expect(sections).toEqual(data.sections);
    });
});

describe('groups', () => {
    it('appends the category sub to the title', () => {
        const withSub = data.sections
            .flatMap((section) => section.categories)
            .find((category) => category.sub !== null)!;

        expect(
            groups.some(
                (group) => group.title === `${withSub.title} - ${withSub.sub}`,
            ),
        ).toBe(true);
    });

    it('keeps a bare title when sub is null', () => {
        const withoutSub = data.sections
            .flatMap((section) => section.categories)
            .find((category) => category.sub === null)!;

        expect(groups.some((group) => group.title === withoutSub.title)).toBe(
            true,
        );
    });

    it('lists each item id once across all groups', () => {
        const ids = groups.flatMap((group) =>
            group.items.map((item) => item.id),
        );

        expect(new Set(ids).size).toBe(ids.length);
    });

    it('drops no items overall', () => {
        const expected = data.sections
            .flatMap((section) => section.categories)
            .flatMap((category) => category.items)
            .map((item) => item.id);

        expect(
            groups.flatMap((group) => group.items.map((item) => item.id)),
        ).toHaveLength(new Set(expected).size);
    });
});

describe('search', () => {
    const sample = groups.find((group) => group.items.length > 0)!;

    it('returns every group for a blank query', () => {
        expect(search('   ')).toEqual(groups);
    });

    it('matches an item name case-insensitively', () => {
        const item = sample.items[0];
        const results = search(item.name.toUpperCase());
        const matched = results.flatMap((group) => group.items);

        expect(matched.some((candidate) => candidate.id === item.id)).toBe(
            true,
        );
    });

    it('matches an item id', () => {
        const item = sample.items[0];

        expect(
            search(item.id)
                .flatMap((group) => group.items)
                .some((candidate) => candidate.id === item.id),
        ).toBe(true);
    });

    it('returns every item in a group whose title matches', () => {
        const results = search(sample.title);
        const group = results.find(
            (candidate) => candidate.title === sample.title,
        )!;

        expect(group.items).toHaveLength(sample.items.length);
    });

    it('omits groups with no matches', () => {
        expect(search('zzzzzznotanitem')).toEqual([]);
    });

    it('does not mutate the cached groups', () => {
        const before = groups[0].items.length;

        search(sample.items[0].name);

        expect(groups[0].items).toHaveLength(before);
    });
});
