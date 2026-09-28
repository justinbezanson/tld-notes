import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import AddRegionDialog from '@/components/runs/AddRegionDialog.vue';
import { dialogText, submitDialog } from '@/test/dialog';
import {
    failLastRequest,
    lastForm,
    resetForms,
    succeedLastRequest,
} from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const runId = 6;

type DialogProps = InstanceType<typeof AddRegionDialog>['$props'];

function mountDialog(props: Partial<DialogProps> = {}, slots = {}) {
    return mount(AddRegionDialog, {
        props: { runId, open: false, ...props },
        slots,
        attachTo: document.body,
    });
}

function openDialog(slots = {}) {
    const wrapper = mountDialog({ runId, open: false }, slots);
    const trigger = wrapper.find('[data-slot="dialog-trigger"]');

    trigger.element.dispatchEvent(new Event('click', { bubbles: true }));

    return wrapper;
}

beforeEach(() => resetForms());

describe('trigger', () => {
    it('renders the trigger slot when one is given', () => {
        const wrapper = mountDialog(
            { runId, open: false },
            { trigger: '<button>Add Region</button>' },
        );

        expect(wrapper.find('[data-slot="dialog-trigger"]').exists()).toBe(
            true,
        );
        expect(wrapper.text()).toContain('Add Region');
    });

    it('renders no trigger without the slot', () => {
        // An empty as-child trigger would put a focusable ghost on the page.
        expect(
            mountDialog().find('[data-slot="dialog-trigger"]').exists(),
        ).toBe(false);
    });

    it('opens the dialog from the trigger', async () => {
        openDialog({ trigger: '<button>Add Region</button>' });
        await nextTick();

        expect(dialogText()).toContain('Add New Region');
    });
});

describe('form', () => {
    it('starts on the general region', () => {
        mountDialog();

        expect(lastForm().region_id).toBe('GENERAL');
    });

    it('posts the region to the run', async () => {
        mountDialog({ runId, open: true });
        await nextTick();

        await submitDialog();

        expect(lastForm().requests[0]).toMatchObject({
            method: 'post',
            url: `/runs/${runId}/regions`,
        });
    });

    it('closes and clears after a success', async () => {
        const wrapper = mountDialog({ runId, open: true });
        await nextTick();

        await submitDialog();
        succeedLastRequest(lastForm());
        await nextTick();

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
        expect(lastForm().region_id).toBe('GENERAL');
    });

    it('keeps the dialog open when the server rejects the region', async () => {
        const wrapper = mountDialog({ runId, open: true });
        await nextTick();

        await submitDialog();
        failLastRequest(lastForm(), {
            region_id: 'This region is already in the run.',
        });
        await nextTick();

        expect(dialogText()).toContain('This region is already in the run.');
        expect(wrapper.emitted('update:open')).toBeUndefined();
    });
});
