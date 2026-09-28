import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import FormDialog from '@/components/FormDialog.vue';
import { dialogButton, dialogText, submitDialog } from '@/test/dialog';

function mountDialog(props: Record<string, unknown> = {}, slots = {}) {
    return mount(FormDialog, {
        props: { title: 'Edit Note', open: true, ...props },
        slots,
        attachTo: document.body,
    });
}

describe('header', () => {
    it('shows the title', async () => {
        mountDialog();
        await nextTick();

        expect(dialogText()).toContain('Edit Note');
    });

    it('shows the description when given', async () => {
        mountDialog({ description: 'Update what you are carrying.' });
        await nextTick();

        expect(dialogText()).toContain('Update what you are carrying.');
    });

    it('omits the description when there is none', async () => {
        mountDialog();
        await nextTick();

        expect(
            document.querySelector('[id^="reka-dialog-description"]'),
        ).toBeNull();
    });
});

describe('trigger', () => {
    it('renders the trigger slot when given', () => {
        const wrapper = mountDialog(
            {},
            { trigger: '<button>Open it</button>' },
        );

        expect(wrapper.find('[data-slot="dialog-trigger"]').exists()).toBe(
            true,
        );
    });

    it('renders no trigger without the slot', () => {
        // An empty as-child trigger would leave a focusable ghost in the page.
        expect(
            mountDialog().find('[data-slot="dialog-trigger"]').exists(),
        ).toBe(false);
    });
});

describe('body', () => {
    it('renders the default slot', async () => {
        mountDialog({}, { default: '<p>Body content</p>' });
        await nextTick();

        expect(dialogText()).toContain('Body content');
    });

    it('renders the actions slot in the footer', async () => {
        mountDialog({}, { actions: '<button type="button">Delete</button>' });
        await nextTick();

        expect(dialogButton('Delete')).toBeTruthy();
    });
});

describe('submitting', () => {
    it('emits submit from the form', async () => {
        const wrapper = mountDialog();
        await nextTick();

        await submitDialog();

        expect(wrapper.emitted('submit')).toHaveLength(1);
    });

    it('uses the default submit label', async () => {
        mountDialog();
        await nextTick();

        expect(dialogButton('Save')).toBeTruthy();
    });

    it('honours a custom submit label', async () => {
        mountDialog({ submitLabel: 'Update' });
        await nextTick();

        expect(dialogButton('Update')).toBeTruthy();
    });

    it('shows the processing label and disables the button while submitting', async () => {
        mountDialog({
            processing: true,
            processingLabel: 'Deleting...',
        });
        await nextTick();

        expect(dialogButton('Deleting...').hasAttribute('disabled')).toBe(true);
    });

    it('keeps the default label before submitting', async () => {
        mountDialog({ processing: true });
        await nextTick();

        expect(dialogButton('Saving...')).toBeTruthy();
    });

    it('only emits submit once per submission', async () => {
        const wrapper = mountDialog();
        await nextTick();

        await submitDialog();
        await submitDialog();

        expect(wrapper.emitted('submit')).toHaveLength(2);
    });
});

describe('cancel', () => {
    it('asks the dialog to close', async () => {
        const wrapper = mountDialog();
        await nextTick();

        dialogButton('Cancel').click();
        await nextTick();

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
    });

    it('does not submit the form', async () => {
        const wrapper = mountDialog();
        await nextTick();

        dialogButton('Cancel').click();
        await nextTick();

        expect(wrapper.emitted('submit')).toBeUndefined();
    });
});
