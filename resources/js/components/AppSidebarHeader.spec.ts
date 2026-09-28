import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AppSidebarHeader from '@/components/AppSidebarHeader.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem } from '@/types';

function mountHeader(breadcrumbs: BreadcrumbItem[] = []) {
    return mount(AppSidebarHeader, {
        props: { breadcrumbs },
        global: {
            stubs: { SidebarTrigger: { template: '<button>toggle</button>' } },
        },
    });
}

describe('header', () => {
    it('always offers the sidebar toggle', () => {
        const wrapper = mountHeader();

        expect(wrapper.findComponent(SidebarTrigger).exists()).toBe(true);
    });

    it('leaves the breadcrumbs out when there are none', () => {
        const wrapper = mountHeader();

        expect(wrapper.findComponent(Breadcrumbs).exists()).toBe(false);
    });

    it('shows the breadcrumbs it was given', () => {
        const wrapper = mountHeader([
            { title: 'Runs', href: '/runs' },
            { title: 'Marathon', href: '/runs/marathon' },
        ]);

        expect(wrapper.findComponent(Breadcrumbs).exists()).toBe(true);
    });

    it('passes the breadcrumbs along', () => {
        const breadcrumbs: BreadcrumbItem[] = [
            { title: 'Runs', href: '/runs' },
            { title: 'Marathon', href: '/runs/marathon' },
        ];
        const wrapper = mountHeader(breadcrumbs);

        expect(wrapper.getComponent(Breadcrumbs).props('breadcrumbs')).toEqual(
            breadcrumbs,
        );
    });
});
