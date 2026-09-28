import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import UpdateNoteDialog from '@/components/runs/UpdateNoteDialog.vue';
import { dialogButton, dialogText, submitDialog } from '@/test/dialog';
import { makeNote, makeNoteItem } from '@/test/factories';
import { createdForms, resetForms, succeedLastRequest } from '@/test/inertia';
import type { FormFake } from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const runId = 3;
const note = makeNote({
    id: 12,
    region_id: 'blackrock',
    location_id: 'blackrock-prison',
    note_text: 'Ladder down',
    items: [
        makeNoteItem({
            id: 1,
            item_id: 'GEAR_Rope',
            item_name: 'Rope',
            quantity: 2,
        }),
    ],
});

// UpdateNoteDialog holds two forms: the note itself, then the delete confirm.
function updateForm(): FormFake<Record<string, unknown>> {
    return createdForms()[0];
}

function deleteForm(): FormFake<Record<string, unknown>> {
    return createdForms()[1];
}

function mountDialog(open = true) {
    return mount(UpdateNoteDialog, {
        props: { runId, note, open },
        attachTo: document.body,
    });
}

beforeEach(() => {
    resetForms();
});

describe('populating', () => {
    it('fills the form on mount, not just when toggled', async () => {
        // The dialog is mounted behind v-if, so the watcher must be immediate.
        mountDialog();
        await nextTick();

        expect(updateForm()).toMatchObject({
            region_id: 'blackrock',
            location_id: 'blackrock-prison',
            note_text: 'Ladder down',
        });
    });

    it('maps stored items onto the request shape', async () => {
        mountDialog();
        await nextTick();

        expect(updateForm().items).toEqual([
            { item_id: 'GEAR_Rope', item_name: 'Rope', quantity: 2 },
        ]);
    });

    it('falls back to the general location for a null location', async () => {
        mount(UpdateNoteDialog, {
            props: {
                runId,
                note: makeNote({ location_id: null, note_text: null }),
                open: true,
            },
            attachTo: document.body,
        });
        await nextTick();

        expect(updateForm()).toMatchObject({
            location_id: 'GENERAL',
            note_text: '',
        });
    });

    it('titles the dialog with the region name', async () => {
        mountDialog();
        await nextTick();

        expect(dialogText()).toContain('Edit Note in Blackrock');
    });

    it('labels the submit button Update', async () => {
        mountDialog();
        await nextTick();

        expect(dialogButton('Update')).toBeTruthy();
    });
});

describe('updating', () => {
    it('puts the note to the run', async () => {
        mountDialog();
        await nextTick();

        await submitDialog();

        const [request] = updateForm().requests;

        expect(request?.method).toBe('put');
        expect(request?.url).toBe(`/runs/${runId}/notes/${note.id}`);
    });

    it('drops blank item rows', async () => {
        mountDialog();
        await nextTick();

        updateForm().items = [
            { item_id: null, item_name: '', quantity: 1 },
            { item_id: 'GEAR_Rope', item_name: 'Rope', quantity: 2 },
        ];

        await submitDialog();

        expect(updateForm().items).toEqual([
            { item_id: 'GEAR_Rope', item_name: 'Rope', quantity: 2 },
        ]);
    });

    it('closes after a successful update', async () => {
        const wrapper = mountDialog();
        await nextTick();

        await submitDialog();
        succeedLastRequest(updateForm());
        await nextTick();

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
    });
});

describe('deleting', () => {
    it('keeps the delete button out of the submit path', async () => {
        // Project rule: a shadcn Button without an explicit type submits the
        // surrounding form, so Delete would update the note.
        mountDialog();
        await nextTick();

        expect(dialogButton('Delete').getAttribute('type')).toBe('button');
    });

    it('confirms before deleting', async () => {
        mountDialog();
        await nextTick();

        dialogButton('Delete').click();
        await nextTick();

        expect(dialogText()).toContain('Delete Note');
        expect(dialogText()).toContain(
            'Are you sure you want to delete the note in Blackrock?',
        );
        expect(updateForm().requests).toHaveLength(0);
    });

    it('deletes the note against the run', async () => {
        mountDialog();
        await nextTick();

        dialogButton('Delete').click();
        await nextTick();

        await submitDialog();

        const [request] = deleteForm().requests;

        expect(request?.method).toBe('delete');
        expect(request?.url).toBe(`/runs/${runId}/notes/${note.id}`);
    });

    it('closes both dialogs after a successful delete', async () => {
        const wrapper = mountDialog();
        await nextTick();

        dialogButton('Delete').click();
        await nextTick();

        await submitDialog();
        succeedLastRequest(deleteForm());
        await nextTick();

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);

        // reka-ui keeps the portal mounted until its exit animation settles.
        await vi.waitFor(() => {
            expect(dialogText()).not.toContain('Delete Note');
        });
    });
});
