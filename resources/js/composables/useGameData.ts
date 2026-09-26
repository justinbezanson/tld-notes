import regionsData from '@data/regions.json';

export const GENERAL_ID: string = 'GENERAL';

export type GameOption = {
    id: string;
    name: string;
};

export type GameLocation = GameOption;

export type GameRegion = {
    id: string;
    name: string;
    locations: GameLocation[];
};

export type UseGameDataReturn = {
    regions: GameRegion[];
    regionOptions: GameOption[];
    findRegion: (regionId: string) => GameRegion | undefined;
    regionName: (regionId: string) => string;
    locationName: (regionId: string, locationId: string | null) => string;
    locationOptionsFor: (regionId: string) => GameOption[];
};

const regions = regionsData as GameRegion[];

const regionsById = new Map(regions.map((region) => [region.id, region]));

const regionOptions: GameOption[] = [
    { id: GENERAL_ID, name: 'General (No specific region)' },
    ...regions.map(({ id, name }) => ({ id, name })),
];

function findRegion(regionId: string): GameRegion | undefined {
    return regionsById.get(regionId);
}

function regionName(regionId: string): string {
    return findRegion(regionId)?.name ?? 'Unknown Region';
}

function locationName(regionId: string, locationId: string | null): string {
    if (!locationId || locationId === GENERAL_ID) {
        return 'General';
    }

    const location = findRegion(regionId)?.locations.find(
        (candidate) => candidate.id === locationId,
    );

    return location?.name ?? 'Unknown Location';
}

function locationOptionsFor(regionId: string): GameOption[] {
    return [
        { id: GENERAL_ID, name: 'General' },
        ...(findRegion(regionId)?.locations ?? []),
    ];
}

export function useGameData(): UseGameDataReturn {
    return {
        regions,
        regionOptions,
        findRegion,
        regionName,
        locationName,
        locationOptionsFor,
    };
}
