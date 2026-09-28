import { BookOpen, FolderGit2 } from '@lucide/vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import NavFooter from '@/components/NavFooter.vue';
import SidebarProvider from '@/components/ui/sidebar/SidebarProvider.vue';
import type { NavItem } from '@/types';

const items: NavItem[] = [
    {
        title: 'GitHub',
        href: 'https://github.com/laravel/vue-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#vue',
        icon: BookOpen,
    },
];

const Host = defineComponent({
    props: {
        items: { type: Array as PropType<NavItem[]>, required: true },
        class: { type: String, default: undefined },
    },
    setup: (props) => () =>
        h(SidebarProvider, null, {
            default: () =>
                h(NavFooter, { items: props.items, class: props.class }),
        }),
});

function mountFooter(props: Record<string, unknown> = {}) {
    return mount(Host, { props: { items, ...props } });
}

function link(wrapper: ReturnType<typeof mountFooter>, title: string) {
    return wrapper
        .findAll('a')
        .find((anchor) => anchor.text().trim() === title)!;
}

describe('NavFooter', () => {
    it('renders every item', () => {
        const text = mountFooter().text();

        expect(text).toContain('GitHub');
        expect(text).toContain('Documentation');
    });

    it('opens items in a new tab', () => {
        expect(link(mountFooter(), 'GitHub').attributes('target')).toBe(
            '_blank',
        );
    });

    it('protects the new tab with noopener', () => {
        expect(link(mountFooter(), 'GitHub').attributes('rel')).toBe(
            'noopener noreferrer',
        );
    });

    it('links to the item href', () => {
        expect(link(mountFooter(), 'Documentation').attributes('href')).toBe(
            'https://laravel.com/docs/starter-kits#vue',
        );
    });

    it('renders the item icon', () => {
        expect(link(mountFooter(), 'GitHub').find('svg').exists()).toBe(true);
    });

    it('keeps the link text readable without the icon', () => {
        // The icon is decorative; the title carries the meaning.
        expect(link(mountFooter(), 'GitHub').text().trim()).toBe('GitHub');
    });

    it('appends the caller class', () => {
        expect(
            mountFooter({ class: 'mt-2' })
                .find('[data-slot="sidebar-group"]')
                .classes(),
        ).toContain('mt-2');
    });
});
