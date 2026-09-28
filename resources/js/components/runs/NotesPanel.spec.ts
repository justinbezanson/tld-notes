import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import AddRegionDialog from '@/components/runs/AddRegionDialog.vue';
import NotesPanel from '@/components/runs/NotesPanel.vue';
import { dialogText, submitDialog } from '@/test/dialog';
import { makeNote, makeRegion } from '@/test/factories';
import {
    createdForms,
    failLastRequest,
    lastForm,
    resetForms,
    succeedLastRequest,
} from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const runId = 7;
const shallowRegion = makeRegion({ id: 2, region_id: 'blackrock' });

function mountPanel() {
    return mount(NotesPanel, {
        props: { runId, regions: [], notes: [] },
    });
}

beforeEach(() => {
    resetForms();
});

describe('Add Region button', () => {
    // Regression: the button used to live in Runs/Show.vue and moved into
    // NotesPanel's #trigger slot. AddRegionDialog never forwarded that slot, so
    // FormDialog's DialogTrigger never rendered and the button disappeared.
    it('renders the Add Region button', () => {
        expect(mountPanel().text()).toContain('Add Region');
    });

    it('renders it as a dialog trigger', () => {
        expect(mountPanel().find('[data-slot="dialog-trigger"]').exists()).toBe(
            true,
        );
    });

    it('opens the dialog when clicked', async () => {
        const wrapper = mountPanel();

        await wrapper.find('[data-slot="dialog-trigger"]').trigger('click');
        await nextTick();

        expect(dialogText()).toContain('Add New Region');
    });
});

describe('regions', () => {
    it('shows an empty state with no regions', () => {
        const wrapper = mountPanel();

        expect(wrapper.text()).toContain('No regions yet');
        expect(wrapper.findComponent({ name: 'RegionCard' }).exists()).toBe(
            false,
        );
    });

    it('renders a card per region', () => {
        const wrapper = mount(NotesPanel, {
            props: {
                runId,
                regions: [makeRegion({ id: 1 }), shallowRegion],
                notes: [],
            },
        });

        const cards = wrapper.findAllComponents({ name: 'RegionCard' });

        expect(cards).toHaveLength(2);
        expect(cards.map((card) => card.props('region'))).toEqual([
            makeRegion({ id: 1 }),
            shallowRegion,
        ]);
    });

    it('keeps cards collapsed by default', () => {
        const wrapper = mount(NotesPanel, {
            props: { runId, regions: [makeRegion()], notes: [] },
        });

        expect(
            wrapper.findComponent({ name: 'RegionCard' }).props('open'),
        ).toBe(false);
    });

    it('expands only the toggled card', async () => {
        const other = makeRegion({ id: 3, region_id: 'bleak-inlet' });
        const wrapper = mount(NotesPanel, {
            props: {
                runId,
                regions: [makeRegion({ id: 1 }), other],
                notes: [],
            },
        });

        await wrapper
            .findAllComponents({ name: 'RegionCard' })[0]
            .vm.$emit('toggle', 'GENERAL');
        await nextTick();

        const cards = wrapper.findAllComponents({ name: 'RegionCard' });

        expect(cards.map((card) => card.props('open'))).toEqual([true, false]);
    });

    it('collapses a card on a second toggle', async () => {
        const wrapper = mount(NotesPanel, {
            props: { runId, regions: [makeRegion()], notes: [] },
        });

        await wrapper
            .findComponent({ name: 'RegionCard' })
            .vm.$emit('toggle', 'GENERAL');
        await nextTick();
        await wrapper
            .findComponent({ name: 'RegionCard' })
            .vm.$emit('toggle', 'GENERAL');
        await nextTick();

        expect(
            wrapper.findComponent({ name: 'RegionCard' }).props('open'),
        ).toBe(false);
    });

    it('keeps open cards open when the notes props change', async () => {
        const wrapper = mount(NotesPanel, {
            props: { runId, regions: [makeRegion()], notes: [] },
        });

        await wrapper
            .findComponent({ name: 'RegionCard' })
            .vm.$emit('toggle', 'GENERAL');
        await nextTick();

        await wrapper.setProps({
            notes: [makeNote({ id: 9, region_id: 'GENERAL' })],
        });

        expect(
            wrapper.findComponent({ name: 'RegionCard' }).props('open'),
        ).toBe(true);
    });
});

describe('notes', () => {
    it('hands each card only the notes for its own region', () => {
        const general = makeNote({ id: 1, region_id: 'GENERAL' });
        const shelves = makeNote({ id: 2, region_id: 'blackrock' });
        const wrapper = mount(NotesPanel, {
            props: {
                runId,
                regions: [makeRegion({ id: 1 }), shallowRegion],
                notes: [general, shelves],
            },
        });

        const cards = wrapper.findAllComponents({ name: 'RegionCard' });

        expect(cards[0].props('notes')).toEqual([general]);
        expect(cards[1].props('notes')).toEqual([shelves]);
    });

    it('passes the run id down', () => {
        const wrapper = mount(NotesPanel, {
            props: { runId, regions: [makeRegion()], notes: [] },
        });

        expect(
            wrapper.findComponent({ name: 'RegionCard' }).props('runId'),
        ).toBe(runId);
    });
});

describe('adding a note', () => {
    it('opens the note dialog for the region that asked', async () => {
        const wrapper = mount(NotesPanel, {
            props: { runId, regions: [shallowRegion], notes: [] },
        });

        await wrapper
            .findComponent({ name: 'RegionCard' })
            .vm.$emit('addNote', shallowRegion);
        await nextTick();

        const dialog = wrapper.findComponent({ name: 'AddNoteDialog' });

        expect(dialog.props('open')).toBe(true);
        expect(dialog.props('region')).toEqual(shallowRegion);
    });

    it('names the region in the dialog title', async () => {
        const wrapper = mount(NotesPanel, {
            props: { runId, regions: [shallowRegion], notes: [] },
        });

        await wrapper
            .findComponent({ name: 'RegionCard' })
            .vm.$emit('addNote', shallowRegion);
        await nextTick();

        expect(dialogText()).toContain('Add Note to Blackrock');
    });
});

describe('AddRegionDialog', () => {
    it('renders no trigger of its own when the parent passes none', () => {
        const wrapper = mount(AddRegionDialog, {
            props: { runId, open: false },
        });

        expect(wrapper.find('[data-slot="dialog-trigger"]').exists()).toBe(
            false,
        );
    });

    it('renders a trigger when the parent passes one', () => {
        const wrapper = mount(AddRegionDialog, {
            props: { runId, open: false },
            slots: { trigger: '<button type="button">Add Region</button>' },
        });

        expect(wrapper.find('[data-slot="dialog-trigger"]').text()).toBe(
            'Add Region',
        );
    });

    it('defaults the region to the general sentinel', () => {
        mount(AddRegionDialog, { props: { runId, open: false } });

        expect(lastForm().region_id).toBe('GENERAL');
    });

    it('posts the chosen region', async () => {
        mount(AddRegionDialog, {
            props: { runId, open: true },
            attachTo: document.body,
        });

        createdForms()[0].region_id = 'bleak-inlet';
        await submitDialog();

        const [request] = lastForm().requests;

        expect(request?.method).toBe('post');
        expect(request?.url).toBe(`/runs/${runId}/regions`);
        expect(lastForm().region_id).toBe('bleak-inlet');
    });

    it('closes and resets after a successful post', async () => {
        const wrapper = mount(AddRegionDialog, {
            props: { runId, open: true },
            attachTo: document.body,
        });

        await submitDialog();
        succeedLastRequest(lastForm());
        await nextTick();

        expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
        expect(lastForm().region_id).toBe('GENERAL');
    });

    it('stays open when the post fails', async () => {
        const wrapper = mount(AddRegionDialog, {
            props: { runId, open: true },
            attachTo: document.body,
        });

        await submitDialog();
        failLastRequest(lastForm(), {
            region_id: 'That region is already added.',
        });
        await nextTick();

        expect(wrapper.emitted('update:open')).toBeUndefined();
        expect(dialogText()).toContain('That region is already added.');
    });
});
