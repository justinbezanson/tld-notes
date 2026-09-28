import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import EmptyState from '@/components/EmptyState.vue';

function mountState(props: Record<string, unknown> = {}, slots = {}) {
    return mount(EmptyState, {
        props: { title: 'No notes yet', ...props },
        slots,
    });
}

describe('EmptyState', () => {
    it('renders the title', () => {
        expect(mountState().text()).toContain('No notes yet');
    });

    it('renders the description when given', () => {
        const wrapper = mountState({ description: 'Add your first note.' });

        expect(wrapper.text()).toContain('Add your first note.');
    });

    it('omits the description when there is none', () => {
        const wrapper = mountState();

        expect(wrapper.findAll('p')).toHaveLength(1);
    });

    it('renders the action slot when provided', () => {
        const wrapper = mountState(
            {},
            { default: '<button>Add note</button>' },
        );

        expect(wrapper.text()).toContain('Add note');
    });

    it('omits the action area without the slot', () => {
        const wrapper = mountState();

        expect(wrapper.find('button').exists()).toBe(false);
    });

    it('renders the icon slot when provided', () => {
        const wrapper = mountState({}, { icon: '<span data-test="icon" />' });

        expect(wrapper.find('[data-test="icon"]').exists()).toBe(true);
    });

    it('pads more generously unless compact', () => {
        expect(mountState().classes()).toContain('p-8');
        expect(mountState({ compact: true }).classes()).toContain('py-4');
    });
});
