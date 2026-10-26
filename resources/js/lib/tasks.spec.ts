import { describe, expect, it } from 'vitest';
import { isBlankDescription, sortTasks } from '@/lib/tasks';
import { makeTask } from '@/test/factories';

describe('sortTasks', () => {
    it('puts incomplete tasks before completed tasks', () => {
        const tasks = [
            makeTask({ id: 1, status: true }),
            makeTask({ id: 2, status: false }),
        ];

        expect(sortTasks(tasks).map((task) => task.id)).toEqual([2, 1]);
    });

    it('orders tasks of the same status by creation time', () => {
        const tasks = [
            makeTask({ id: 1, created_at: '2026-01-01T00:02:00.000000Z' }),
            makeTask({ id: 2, created_at: '2026-01-01T00:01:00.000000Z' }),
        ];

        expect(sortTasks(tasks).map((task) => task.id)).toEqual([2, 1]);
    });

    it('does not mutate the input array', () => {
        const tasks = [
            makeTask({ id: 1, status: true }),
            makeTask({ id: 2, status: false }),
        ];

        sortTasks(tasks);

        expect(tasks.map((task) => task.id)).toEqual([1, 2]);
    });
});

describe('isBlankDescription', () => {
    it('treats whitespace as blank', () => {
        expect(isBlankDescription('   ')).toBe(true);
    });

    it('treats text as not blank', () => {
        expect(isBlankDescription('Find the key')).toBe(false);
    });
});
