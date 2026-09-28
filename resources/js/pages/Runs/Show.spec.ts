import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import RunShow from '@/pages/Runs/Show.vue';
import { makeNote, makeRegion, makeRun } from '@/test/factories';
import { resetForms } from '@/test/inertia';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const run = makeRun({ id: 3, name: 'Road to 500', run_type: 'PILGRIM' });
const regions = [makeRegion({ id: 1, run_id: 3, region_id: 'blackrock' })];
const notes = [makeNote({ id: 5, run_id: 3, region_id: 'blackrock' })];

function mountShow(props: Record<string, unknown> = {}) {
    return mount(RunShow, {
        props: { run, regions, notes, ...props },
        attachTo: document.body,
    });
}

function tabs(wrapper: ReturnType<typeof mountShow>) {
    return wrapper.findAll('[role="tab"]');
}

function activeTab(wrapper: ReturnType<typeof mountShow>) {
    return wrapper.find('[role="tab"][data-state="active"]').text();
}

beforeEach(() => resetForms());

describe('head', () => {
    it('titles the page after the run', () => {
        mountShow();

        expect(document.title).toBe('Road to 500');
    });
});

describe('header', () => {
    it('shows the run name', () => {
        expect(mountShow().find('h1').text()).toBe('Road to 500');
    });

    it('renders without regions or notes', () => {
        const wrapper = mountShow({ regions: [], notes: [] });

        expect(wrapper.find('h1').text()).toBe('Road to 500');
    });
});

describe('tabs', () => {
    it('offers the notes and goals tabs', () => {
        expect(tabs(mountShow()).map((tab) => tab.text().trim())).toEqual([
            'Regions Notes',
            'Goals & Tasks',
        ]);
    });

    it('opens on the notes tab', () => {
        expect(activeTab(mountShow())).toContain('Regions Notes');
    });

    it('switches to the goals tab', async () => {
        const wrapper = mountShow();

        // reka-ui's TabsTrigger activates on mousedown, not click.
        await tabs(wrapper)
            .find((tab) => tab.text().includes('Goals'))!
            .trigger('mousedown');
        await nextTick();

        expect(activeTab(wrapper)).toContain('Goals & Tasks');
    });
});

describe('notes tab', () => {
    it('hands the notes panel the regions it was given', () => {
        expect(
            mountShow().findComponent({ name: 'NotesPanel' }).props('regions'),
        ).toEqual(regions);
    });

    it('hands the notes panel the notes it was given', () => {
        expect(
            mountShow().findComponent({ name: 'NotesPanel' }).props('notes'),
        ).toEqual(notes);
    });

    it('hands the notes panel the run id', () => {
        expect(
            mountShow().findComponent({ name: 'NotesPanel' }).props('runId'),
        ).toBe(3);
    });

    it('lists the regions of the run', () => {
        expect(mountShow().text()).toContain('Blackrock');
    });
});
