import { describe, expect, it } from 'vitest';
import { GENERAL_ID, useGameData } from '@/composables/useGameData';
import regionsData from '@data/regions.json';

const { locationName, locationOptionsFor, regionName, regionOptions } =
    useGameData();

describe('regionOptions', () => {
    it('puts the general option first', () => {
        expect(regionOptions[0]).toEqual({
            id: GENERAL_ID,
            name: 'General (No specific region)',
        });
    });

    it('lists every region from the game data after it', () => {
        const data = regionsData as Array<{ id: string; name: string }>;

        expect(regionOptions).toHaveLength(data.length + 1);
        expect(regionOptions.slice(1)).toEqual(
            data.map(({ id, name }) => ({ id, name })),
        );
    });
});

describe('regionName', () => {
    it('resolves a known region', () => {
        expect(regionName(regionsData[0].id)).toBe(regionsData[0].name);
    });

    it('falls back for an unknown region', () => {
        expect(regionName('NOPE')).toBe('Unknown Region');
    });

    it('does not resolve the general sentinel to a region name', () => {
        expect(regionName(GENERAL_ID)).toBe('Unknown Region');
    });
});

describe('locationName', () => {
    const region = regionsData.find((candidate) =>
        candidate.locations.some((location) => location.id !== GENERAL_ID),
    )!;
    const location = region.locations.find(
        (candidate) => candidate.id !== GENERAL_ID,
    )!;

    it('resolves a known location', () => {
        expect(locationName(region.id, location.id)).toBe(location.name);
    });

    it('resolves a null location to General', () => {
        expect(locationName(region.id, null)).toBe('General');
    });

    it('resolves the general sentinel to General', () => {
        expect(locationName(region.id, GENERAL_ID)).toBe('General');
    });

    it('falls back for an unknown location', () => {
        expect(locationName(region.id, 'NOPE')).toBe('Unknown Location');
    });

    it('falls back for an unknown region', () => {
        expect(locationName('NOPE', location.id)).toBe('Unknown Location');
    });
});

describe('locationOptionsFor', () => {
    it('puts General first, then the region locations', () => {
        const region = regionsData.find(
            (candidate) => candidate.locations.length > 0,
        )!;

        expect(locationOptionsFor(region.id)[0]).toEqual({
            id: GENERAL_ID,
            name: 'General',
        });
        expect(locationOptionsFor(region.id)).toHaveLength(
            region.locations.length + 1,
        );
    });

    it('returns just General for an unknown region', () => {
        expect(locationOptionsFor('NOPE')).toEqual([
            { id: GENERAL_ID, name: 'General' },
        ]);
    });
});
