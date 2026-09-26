import itemsData from '@data/items.json';

export type GameItem = {
    id: string;
    name: string;
};

export type GameItemCategory = {
    title: string;
    sub: string | null;
    items: GameItem[];
};

export type GameItemSection = {
    title: string;
    categories: GameItemCategory[];
};

export type GameItemGroup = {
    title: string;
    items: GameItem[];
};

export type UseGameItemsReturn = {
    sections: GameItemSection[];
    groups: GameItemGroup[];
    search: (query: string) => GameItemGroup[];
};

const sections = (itemsData as { sections: GameItemSection[] }).sections;

const groups: GameItemGroup[] = [];
const groupsByTitle = new Map<string, GameItemGroup>();
const seenItemIds = new Set<string>();

for (const section of sections) {
    for (const category of section.categories) {
        const title = category.sub
            ? `${category.title} - ${category.sub}`
            : category.title;

        for (const item of category.items) {
            if (seenItemIds.has(item.id)) {
                continue;
            }

            seenItemIds.add(item.id);

            let group = groupsByTitle.get(title);

            if (!group) {
                group = { title, items: [] };
                groupsByTitle.set(title, group);
                groups.push(group);
            }

            group.items.push(item);
        }
    }
}

function matches(item: GameItem, term: string): boolean {
    return (
        item.name.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term)
    );
}

function search(query: string): GameItemGroup[] {
    const term = query.trim().toLowerCase();

    if (term === '') {
        return groups;
    }

    const results: GameItemGroup[] = [];

    for (const group of groups) {
        const items = group.title.toLowerCase().includes(term)
            ? group.items
            : group.items.filter((item) => matches(item, term));

        if (items.length > 0) {
            results.push({ title: group.title, items });
        }
    }

    return results;
}

export function useGameItems(): UseGameItemsReturn {
    return { sections, groups, search };
}
