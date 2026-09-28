import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import type { BreadcrumbItem } from '@/types';

const crumbs: BreadcrumbItem[] = [
    { title: 'Runs', href: '/runs' },
    { title: 'Blackrock', href: '/runs/blackrock' },
    { title: 'Notes', href: '/runs/blackrock/notes' },
];

function mountCrumbs(items: BreadcrumbItem[] = crumbs) {
    return mount(Breadcrumbs, { props: { breadcrumbs: items } });
}

describe('Breadcrumbs', () => {
    it('renders every crumb title', () => {
        const text = mountCrumbs().text();

        expect(text).toContain('Runs');
        expect(text).toContain('Blackrock');
        expect(text).toContain('Notes');
    });

    it('links the crumbs that have an href', () => {
        const links = mountCrumbs()
            .findAll('a')
            .map((link) => link.attributes('href'));

        expect(links).toEqual(['/runs', '/runs/blackrock']);
    });

    it('renders the last crumb as plain text', () => {
        const wrapper = mountCrumbs();

        expect(wrapper.text()).toContain('Notes');
        expect(wrapper.findAll('a').map((link) => link.text())).not.toContain(
            'Notes',
        );
    });

    it('separates crumbs with a separator', () => {
        // One separator fewer than the crumb count: nothing trails the last crumb.
        expect(
            mountCrumbs().findAll('[data-slot="breadcrumb-separator"]'),
        ).toHaveLength(2);
    });

    it('renders a lone crumb without a link or separator', () => {
        const wrapper = mountCrumbs([{ title: 'Notes', href: '/notes' }]);

        expect(wrapper.find('a').exists()).toBe(false);
        expect(
            wrapper.findAll('[data-slot="breadcrumb-separator"]'),
        ).toHaveLength(0);
    });
});
