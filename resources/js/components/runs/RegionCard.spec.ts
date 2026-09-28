import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RegionCard from '@/components/runs/RegionCard.vue';
import { makeNote, makeRegion } from '@/test/factories';

const runId = 5;
const region = makeRegion({ region_id: 'blackrock' });

function mountCard(overrides: Record<string, unknown> = {}) {
    return mount(RegionCard, {
        props: {
            runId,
            region,
            notes: [],
            open: true,
            ...overrides,
        },
    });
}

describe('heading', () => {
    it('shows the region name resolved from the game data', () => {
        expect(mountCard().text()).toContain('Blackrock');
    });

    it('falls back for an unknown region id', () => {
        expect(
            mountCard({ region: makeRegion({ region_id: 'nowhere' }) }).text(),
        ).toContain('Unknown Region');
    });
});

describe('collapsing', () => {
    it('asks the parent to toggle this region', async () => {
        const wrapper = mountCard();

        await wrapper.find('.sr-only').trigger('click');

        expect(wrapper.emitted('toggle')).toEqual([['blackrock']]);
    });

    it('hides the body while closed', () => {
        expect(
            mountCard({ open: false })
                .findComponent({ name: 'NoteList' })
                .exists(),
        ).toBe(false);
    });

    it('shows the body while open', () => {
        expect(mountCard().findComponent({ name: 'NoteList' }).exists()).toBe(
            true,
        );
    });

    it('does not keep its own open state', async () => {
        const wrapper = mountCard();

        await wrapper.find('.sr-only').trigger('click');

        // The parent owns `open`, so a click must not collapse the card itself.
        expect(wrapper.findComponent({ name: 'NoteList' }).exists()).toBe(true);
    });
});

describe('notes', () => {
    it('passes the run and region ids to the list', () => {
        const list = mountCard().findComponent({ name: 'NoteList' });

        expect(list.props('runId')).toBe(runId);
        expect(list.props('regionId')).toBe('blackrock');
    });

    it('renders the notes it was given', () => {
        const notes = [
            makeNote({ id: 1, location_id: 'blackrock-prison' }),
            makeNote({ id: 2 }),
        ];

        expect(mountCard({ notes }).text()).toContain('Blackrock Prison');
    });
});

describe('adding a note', () => {
    it('asks the parent to open the note dialog for this region', async () => {
        const wrapper = mountCard();
        const button = wrapper
            .findAll('button')
            .find((candidate) => candidate.text().includes('Add Note'))!;

        await button.trigger('click');

        expect(wrapper.emitted('addNote')).toEqual([[region]]);
    });
});
