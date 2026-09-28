import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FormField from '@/components/FormField.vue';

function mountField(props: Record<string, unknown> = {}) {
    return mount(FormField, {
        props: { id: 'region_id', label: 'Location', ...props },
        slots: { default: '<input id="region_id" />' },
    });
}

describe('FormField', () => {
    it('labels the control', () => {
        expect(mountField().find('label').attributes('for')).toBe('region_id');
    });

    it('renders the label text', () => {
        expect(mountField().text()).toContain('Location');
    });

    it('renders the control it wraps', () => {
        expect(mountField().find('input#region_id').exists()).toBe(true);
    });

    it('hides the error slot when there is no error', () => {
        expect(mountField().find('p').isVisible()).toBe(false);
    });

    it('shows the error message when given', () => {
        expect(
            mountField({ error: 'The location field is required.' })
                .find('p')
                .text(),
        ).toBe('The location field is required.');
    });
});
