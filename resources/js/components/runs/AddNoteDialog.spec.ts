import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import AddNoteDialog from '@/components/runs/AddNoteDialog.vue';
import { dialogText, submitDialog } from '@/test/dialog';
import { makeRegion } from '@/test/factories';
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
const region = makeRegion({ region_id: 'blackrock' });

function mountDialog(open = false, noteRegion: typeof region | null = region) {
    return mount(AddNoteDialog, {
        props: { runId, region: noteRegion, open },
        attachTo: document.body,
    });
}

beforeEach(() => {
    resetForms();
});

describe('form defaults', () => {
    it('starts on the general location with no items', () => {
        mountDialog();

        expect(lastForm()).toMatchObject({
            location_id: 'GENERAL',
            region_id: '',
            note_text: '',
            items: [],
        });
    });
});

describe('opening', () => {
    it('titles the dialog with the region name', async () => {
        const wrapper = mountDialog(false);

        await wrapper.setProps({ open: true });
        await nextTick();

        expect(dialogText()).toContain('Add Note to Blackrock');
    });

    it('falls back to a generic title without a region', async () => {
        const wrapper = mountDialog(false, null);

        await wrapper.setProps({ open: true });
        await nextTick();

        expect(dialogText()).toContain('Add Note');
    });

    it('seeds the region and resets the rest when opened', async () => {
        const wrapper = mountDialog(false);

        lastForm().note_text = 'leftover text';
        lastForm().items = [{ item_id: null, item_name: '', quantity: 1 }];
        lastForm().errors = { note_text: 'stale error' };

        await wrapper.setProps({ open: true });
        await nextTick();

        expect(lastForm()).toMatchObject({
            region_id: 'blackrock',
            location_id: 'GENERAL',
            note_text: '',
            items: [],
        });
        expect(lastForm().clearErrors).toHaveBeenCalled();
    });

    it('keeps the form untouched while closed', async () => {
        const wrapper = mountDialog(false);

        lastForm().note_text = 'typed while closed';
        await wrapper.setProps({ open: false });
        await nextTick();

        expect(lastForm().note_text).toBe('typed while closed');
    });

    it('does nothing without a region', async () => {
        const wrapper = mountDialog(false, null);

        await wrapper.setProps({ open: true });
        await nextTick();

        expect(lastForm().region_id).toBe('');
    });
});

describe('submitting', () => {
    it('posts the note to the run', async () => {
        mountDialog(true);
        await nextTick();

        await submitDialog();

        const [request] = lastForm().requests;

        expect(request?.method).toBe('post');
        expect(request?.url).toBe(`/runs/${runId}/notes`);
    });

    it('drops the blank item rows the user never filled in', async () => {
        mountDialog(true);
        await nextTick();

        lastForm().items = [
            { item_id: null, item_name: '', quantity: 1 },
            { item_id: 'GEAR_Rope', item_name: 'Rope', quantity: 2 },
            { item_id: null, item_name: '', quantity: 1 },
        ];

        await submitDialog();

        expect(lastForm().items).toEqual([
            { item_id: 'GEAR_Rope', item_name: 'Rope', quantity: 2 },
        ]);
    });

    it('closes and resets after a successful post', async () => {
        const wrapper = mountDialog(true);
        await nextTick();

        await submitDialog();
        succeedLastRequest(lastForm());
        await nextTick();

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
        expect(lastForm().reset).toHaveBeenCalled();
    });

    it('stays open and surfaces server errors', async () => {
        const wrapper = mountDialog(true);
        await nextTick();

        await submitDialog();
        failLastRequest(lastForm(), {
            'items.0.quantity': 'The quantity must be at least 1.',
        });
        await nextTick();

        expect(wrapper.emitted('update:open')).toBeUndefined();
        expect(dialogText()).toContain('The quantity must be at least 1.');
    });

    it('shows the field errors from the last response', async () => {
        mountDialog(true);
        await nextTick();

        failLastRequest(lastForm(), {
            note_text: 'The note text is too long.',
        });
        await nextTick();

        expect(dialogText()).toContain('The note text is too long.');
    });

    it('renders no trigger of its own', () => {
        expect(
            mountDialog().find('[data-slot="dialog-trigger"]').exists(),
        ).toBe(false);
    });
});
