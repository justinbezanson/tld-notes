export type RunType =
    'CUSTOM' | 'PILGRIM' | 'VOYAGER' | 'STALKER' | 'INTERLOPER' | 'MISERY';

export type Run = {
    id: number;
    user_id: number;
    name: string;
    run_type: RunType;
    created_at: string;
    updated_at: string;
};
