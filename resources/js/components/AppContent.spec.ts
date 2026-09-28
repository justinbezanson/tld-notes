import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import AppContent from '@/components/AppContent.vue';

const SidebarInset = (await import('@/components/ui/sidebar')).SidebarInset;
void vi;

describe('sidebar variant', () => {
    it('renders inside the sidebar inset', () => {
        const wrapper = mount(AppContent, {
            slots: { default: '<p>content</p>' },
        });

        expect(wrapper.findComponent(SidebarInset).exists()).toBe(true);
    });

    it('renders the slot', () => {
        const wrapper = mount(AppContent, {
            slots: { default: '<p>content</p>' },
        });

        expect(wrapper.text()).toContain('content');
    });

    it('passes the class through', () => {
        const wrapper = mount(AppContent, {
            attrs: { class: 'p-8' },
            slots: { default: '<p>content</p>' },
        });

        expect(wrapper.findComponent(SidebarInset).classes()).toContain('p-8');
    });
});

describe('header variant', () => {
    it('renders a plain main instead of the sidebar inset', () => {
        const wrapper = mount(AppContent, {
            props: { variant: 'header' },
            slots: { default: '<p>content</p>' },
        });

        expect(wrapper.find('main').exists()).toBe(true);
        expect(wrapper.findComponent(SidebarInset).exists()).toBe(false);
    });

    it('constrains the width of the header layout', () => {
        const wrapper = mount(AppContent, {
            props: { variant: 'header' },
            slots: { default: '<p>content</p>' },
        });

        expect(wrapper.get('main').classes()).toContain('max-w-7xl');
    });

    it('still renders the slot', () => {
        const wrapper = mount(AppContent, {
            props: { variant: 'header' },
            slots: { default: '<p>content</p>' },
        });

        expect(wrapper.text()).toContain('content');
    });
});
