import type { Task } from '@/types';

export type TaskRow = Task & {
    isNew?: boolean;
};

export function sortTasks<T extends TaskRow>(tasks: T[]): T[] {
    return [...tasks].sort((a, b) => {
        if (a.status !== b.status) {
            return a.status ? 1 : -1;
        }

        const createdAt = a.created_at.localeCompare(b.created_at);

        return createdAt !== 0 ? createdAt : a.id - b.id;
    });
}

export function isBlankDescription(description: string): boolean {
    return description.trim() === '';
}
