import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import RunsIndex from '@/pages/Runs/Index.vue';
import {
    dialogButton,
    dialogText,
    submitDialog,
    titledButton,
} from '@/test/dialog';
import { makeRun } from '@/test/factories';
import { createdForms, resetForms, succeedLastRequest } from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

// Runs/Index creates three forms in source order.
const createForm = () => createdForms()[0]!;
const deleteForm = () => createdForms()[1]!;
const editForm = () => createdForms()[2]!;

const runs = [
    makeRun({ id: 3, name: 'Road to 500', run_type: 'PILGRIM' }),
    makeRun({ id: 4, name: 'Second run', run_type: 'VOYAGER' }),
];

type IndexProps = InstanceType<typeof RunsIndex>['$props'];

function mountIndex(props: Partial<IndexProps> = {}) {
    return mount(RunsIndex, {
        props: { runs, ...props },
        attachTo: document.body,
    });
}

async function openCreateDialog() {
    titledButton('Create a new run').click();
    await nextTick();
}

beforeEach(() => resetForms());

describe('page', () => {
    it('greets the dashboard with its heading', () => {
        expect(mountIndex().find('h1').text()).toBe('Save Files');
    });

    it('says so when there are no runs', () => {
        expect(mountIndex({ runs: [] }).text()).toContain('No runs found.');
    });

    it('links each run to its page', () => {
        const links = mountIndex()
            .findAll('a')
            .map((link) => link.text().trim());

        expect(links).toContain('Road to 500');
        expect(links).toContain('Second run');
    });

    it('shows the run type on the card', () => {
        expect(mountIndex().text()).toContain('PILGRIM');
    });

    it('offers an edit and delete action per run', () => {
        mountIndex();

        expect(
            document.querySelectorAll('button[title="Edit run"]'),
        ).toHaveLength(2);
        expect(
            document.querySelectorAll('button[title="Delete run"]'),
        ).toHaveLength(2);
    });
});

describe('creating a run', () => {
    it('opens the dialog from the icon trigger', async () => {
        mountIndex();

        await openCreateDialog();

        expect(dialogText()).toContain('Add New Run');
    });

    it('starts with an empty name', async () => {
        mountIndex();
        await openCreateDialog();

        expect(createForm().name).toBe('');
    });

    it('defaults to a custom run type', async () => {
        mountIndex();
        await openCreateDialog();

        expect(createForm().run_type).toBe('CUSTOM');
    });

    it('posts the run to the store route', async () => {
        mountIndex();
        await openCreateDialog();

        await submitDialog();

        expect(createForm().requests[0]).toMatchObject({
            method: 'post',
            url: '/runs',
        });
    });

    it('closes and clears after a successful create', async () => {
        const wrapper = mountIndex();
        await openCreateDialog();
        createForm().name = 'New run';

        await submitDialog();
        succeedLastRequest(createForm());
        await nextTick();

        expect(wrapper.emitted('update:open')).toBeUndefined();
        expect(createForm().name).toBe('');
    });
});

describe('editing a run', () => {
    async function openEditDialog() {
        mountIndex();
        await nextTick();
        titledButton('Edit run').click();
        await nextTick();
    }

    it('opens with the run already filled in', async () => {
        await openEditDialog();

        expect(editForm().name).toBe('Road to 500');
        expect(editForm().run_type).toBe('PILGRIM');
    });

    it('puts the changes to the run', async () => {
        await openEditDialog();
        editForm().name = 'Renamed';

        await submitDialog();

        expect(editForm().requests[0]).toMatchObject({
            method: 'put',
            url: '/runs/3',
        });
    });

    it('clears stale errors when reopened', async () => {
        await openEditDialog();
        editForm().setError('name', 'The name has already been taken.');

        dialogButton('Cancel').click();
        await nextTick();
        titledButton('Edit run').click();
        await nextTick();

        expect(editForm().errors).toEqual({});
    });

    it('clears the form after a successful update', async () => {
        await openEditDialog();
        editForm().name = 'Renamed';

        await submitDialog();
        succeedLastRequest(editForm());
        await nextTick();

        expect(editForm().name).toBe('');
    });
});

describe('deleting a run', () => {
    async function openDeleteDialog() {
        mountIndex();
        await nextTick();
        titledButton('Delete run').click();
        await nextTick();
    }

    it('asks before deleting', async () => {
        await openDeleteDialog();

        expect(dialogText()).toContain('Delete Run');
        expect(deleteForm().requests).toHaveLength(0);
    });

    it('names the run in the confirmation', async () => {
        await openDeleteDialog();

        expect(dialogText()).toContain(
            'Are you sure you want to delete "Road to 500"?',
        );
    });

    it('deletes the run without leaving the page', async () => {
        await openDeleteDialog();

        await submitDialog();

        expect(deleteForm().requests[0]).toMatchObject({
            method: 'delete',
            url: '/runs/3',
        });
        expect(deleteForm().requests[0]?.options.preserveScroll).toBe(true);
    });

    it('labels the submit button as a delete', async () => {
        await openDeleteDialog();

        expect(dialogButton('Delete')).toBeTruthy();
    });
});
