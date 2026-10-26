import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import GoalsPanel from '@/components/runs/GoalsPanel.vue';
import { dialogButton, dialogText, submitDialog } from '@/test/dialog';
import { makeTask } from '@/test/factories';
import { createdForms, resetForms, succeedLastRequest } from '@/test/inertia';
import { resetRouter, routerStub } from '@/test/router';

vi.mock('@inertiajs/vue3', async () => {
    const { inertiaMock } = await import('@/test/inertia');

    return inertiaMock();
});

const runId = 11;
const openTask = makeTask({
    id: 1,
    run_id: runId,
    description: 'Find the bunker key',
    created_at: '2026-01-01T00:01:00.000000Z',
});
const completedTask = makeTask({
    id: 2,
    run_id: runId,
    status: true,
    description: 'Repair the radio',
    created_at: '2026-01-01T00:02:00.000000Z',
});

type GoalsPanelProps = InstanceType<typeof GoalsPanel>['$props'];

function mountPanel(overrides: Partial<GoalsPanelProps> = {}) {
    return mount(GoalsPanel, {
        props: {
            runId,
            tasks: [openTask],
            ...overrides,
        },
        attachTo: document.body,
    });
}

function newTaskForm() {
    return createdForms()[0]!;
}

function editTaskForm() {
    return createdForms()[1]!;
}

function deleteTaskForm() {
    return createdForms()[2]!;
}

function taskItems(wrapper: ReturnType<typeof mountPanel>) {
    return wrapper.findAllComponents({ name: 'TaskItem' });
}

function addTaskButton(wrapper: ReturnType<typeof mountPanel>) {
    return wrapper
        .findAll('button')
        .find((button) => button.text().includes('Add Task'))!;
}

async function startAdding(wrapper: ReturnType<typeof mountPanel>) {
    await addTaskButton(wrapper).trigger('click');
    await nextTick();
}

async function pressEscape() {
    window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await nextTick();
}

beforeEach(() => {
    resetForms();
    resetRouter();
});

describe('tasks', () => {
    it('shows the empty state when there are no tasks', () => {
        const wrapper = mountPanel({ tasks: [] });

        expect(wrapper.text()).toContain('There are no tasks to display');
        expect(taskItems(wrapper)).toHaveLength(0);
    });

    it('renders a row per task', () => {
        const wrapper = mountPanel({ tasks: [openTask, completedTask] });

        expect(taskItems(wrapper)).toHaveLength(2);
        expect(wrapper.text()).toContain('Find the bunker key');
        expect(wrapper.text()).toContain('Repair the radio');
    });

    it('sorts incomplete tasks first then oldest first', () => {
        const wrapper = mountPanel({
            tasks: [
                completedTask,
                makeTask({
                    id: 3,
                    run_id: runId,
                    description: 'Newer task',
                    created_at: '2026-01-01T00:03:00.000000Z',
                }),
                openTask,
            ],
        });

        expect(
            taskItems(wrapper).map((item) => item.props('task').description),
        ).toEqual(['Find the bunker key', 'Newer task', 'Repair the radio']);
    });

    it('strikes through completed tasks', () => {
        const wrapper = mountPanel({ tasks: [completedTask] });

        expect(wrapper.find('.line-through').text()).toBe('Repair the radio');
    });

    it('syncs tasks from the prop', async () => {
        const wrapper = mountPanel({ tasks: [openTask] });

        await wrapper.setProps({ tasks: [openTask, completedTask] });
        await nextTick();

        expect(taskItems(wrapper)).toHaveLength(2);
    });
});

describe('adding a task', () => {
    it('starts an inline row and focuses the input', async () => {
        const wrapper = mountPanel({ tasks: [] });

        await startAdding(wrapper);

        expect(taskItems(wrapper)).toHaveLength(1);
        expect(taskItems(wrapper)[0]!.props('editing')).toBe(true);
        expect(addTaskButton(wrapper).attributes('disabled')).toBeDefined();
        expect(document.activeElement).toBe(wrapper.find('input').element);
    });

    it('disables save while the description is blank', async () => {
        const wrapper = mountPanel({ tasks: [] });

        await startAdding(wrapper);

        expect(
            wrapper.find('button[title="Save task"]').attributes('disabled'),
        ).toBeDefined();

        await wrapper.find('input').setValue('Find the bunker key');

        expect(
            wrapper.find('button[title="Save task"]').attributes('disabled'),
        ).toBeUndefined();
    });

    it('posts a new task to the run', async () => {
        const wrapper = mountPanel({ tasks: [] });

        await startAdding(wrapper);
        await wrapper.find('input').setValue('Find the bunker key');
        await wrapper.find('form').trigger('submit');

        expect(newTaskForm().requests[0]).toMatchObject({
            method: 'post',
            url: `/runs/${runId}/tasks`,
        });
    });

    it('removes the draft after a successful save', async () => {
        const wrapper = mountPanel({ tasks: [] });

        await startAdding(wrapper);
        await wrapper.find('input').setValue('Find the bunker key');
        await wrapper.find('form').trigger('submit');
        succeedLastRequest(newTaskForm());
        await nextTick();

        expect(taskItems(wrapper)).toHaveLength(0);
        expect(addTaskButton(wrapper).attributes('disabled')).toBeUndefined();
    });

    it('cancels with Escape', async () => {
        const wrapper = mountPanel({ tasks: [] });

        await startAdding(wrapper);
        await pressEscape();

        expect(taskItems(wrapper)).toHaveLength(0);
        expect(wrapper.text()).toContain('There are no tasks to display');
    });

    it('removes an unsaved task without making a delete request', async () => {
        const wrapper = mountPanel({ tasks: [] });

        await startAdding(wrapper);
        await wrapper.find('button[title="Delete task"]').trigger('click');
        await nextTick();

        expect(taskItems(wrapper)).toHaveLength(0);
        expect(newTaskForm().requests).toHaveLength(0);
        expect(deleteTaskForm().requests).toHaveLength(0);
        expect(routerStub.delete).not.toHaveBeenCalled();
        expect(dialogText()).not.toContain('Delete Task');
        expect(wrapper.text()).toContain('There are no tasks to display');
    });

    it('keeps the draft when the task prop changes', async () => {
        const wrapper = mountPanel({ tasks: [] });

        await startAdding(wrapper);
        await wrapper.find('input').setValue('Draft task');
        await wrapper.setProps({ tasks: [openTask] });
        await nextTick();

        expect(taskItems(wrapper)).toHaveLength(2);
        expect(wrapper.find('input').element.value).toBe('Draft task');
    });
});

describe('editing a task', () => {
    async function startEditing(wrapper: ReturnType<typeof mountPanel>) {
        await wrapper.find('button[title="Edit task"]').trigger('click');
        await nextTick();
    }

    it('shows the description in an input and disables other controls', async () => {
        const wrapper = mountPanel();

        await startEditing(wrapper);

        expect(wrapper.find('input').element.value).toBe('Find the bunker key');
        expect(addTaskButton(wrapper).attributes('disabled')).toBeDefined();
        expect(wrapper.find('[role="checkbox"]').attributes('disabled')).toBe(
            '',
        );
    });

    it('patches the task description', async () => {
        const wrapper = mountPanel();

        await startEditing(wrapper);
        await wrapper.find('input').setValue('Find the bunker code');
        await wrapper.find('form').trigger('submit');

        expect(editTaskForm().requests[0]).toMatchObject({
            method: 'patch',
            url: `/runs/${runId}/tasks/${openTask.id}`,
        });
    });

    it('shows the new description after a successful save', async () => {
        const wrapper = mountPanel();

        await startEditing(wrapper);
        await wrapper.find('input').setValue('Find the bunker code');
        await wrapper.find('form').trigger('submit');
        succeedLastRequest(editTaskForm());
        await nextTick();

        expect(wrapper.text()).toContain('Find the bunker code');
        expect(wrapper.find('button[title="Edit task"]').exists()).toBe(true);
    });

    it('cancels with Escape without saving', async () => {
        const wrapper = mountPanel();

        await startEditing(wrapper);
        await wrapper.find('input').setValue('Unsaved change');
        await pressEscape();

        expect(editTaskForm().requests).toHaveLength(0);
        expect(wrapper.text()).toContain('Find the bunker key');
        expect(wrapper.find('button[title="Edit task"]').exists()).toBe(true);
    });

    it('keeps the unsaved description when the task prop changes', async () => {
        const wrapper = mountPanel();

        await startEditing(wrapper);
        await wrapper.find('input').setValue('Unsaved change');
        await wrapper.setProps({
            tasks: [{ ...openTask, description: 'Server update' }],
        });
        await nextTick();

        expect(wrapper.find('input').element.value).toBe('Unsaved change');
    });

    it('asks before deleting the task', async () => {
        const wrapper = mountPanel();

        await startEditing(wrapper);
        await wrapper.find('button[title="Delete task"]').trigger('click');
        await nextTick();

        expect(dialogText()).toContain('Delete Task');
        expect(dialogText()).toContain(
            'Are you sure you want to delete "Find the bunker key"?',
        );
        expect(deleteTaskForm().requests).toHaveLength(0);
    });

    it('deletes the task after confirmation', async () => {
        const wrapper = mountPanel();

        await startEditing(wrapper);
        await wrapper.find('button[title="Delete task"]').trigger('click');
        await nextTick();

        expect(dialogButton('Delete')).toBeTruthy();

        await submitDialog();

        expect(deleteTaskForm().requests[0]).toMatchObject({
            method: 'delete',
            url: `/runs/${runId}/tasks/${openTask.id}`,
        });
        expect(deleteTaskForm().requests[0]?.options.preserveScroll).toBe(true);

        succeedLastRequest(deleteTaskForm());
        await nextTick();

        expect(taskItems(wrapper)).toHaveLength(0);
    });
});

describe('toggling a task', () => {
    it('optimistically completes the task and patches it', async () => {
        const wrapper = mountPanel();

        wrapper
            .findComponent({ name: 'Checkbox' })
            .vm.$emit('update:modelValue', true);
        await nextTick();

        const call = routerStub.patch.mock.calls.at(0);

        expect(call?.[0]).toBe(`/runs/${runId}/tasks/${openTask.id}`);
        expect(call?.[1]).toEqual({ status: true });
        expect(wrapper.find('.line-through').text()).toBe(
            'Find the bunker key',
        );
    });

    it('reverts the task when the request fails', async () => {
        const wrapper = mountPanel();

        wrapper
            .findComponent({ name: 'Checkbox' })
            .vm.$emit('update:modelValue', true);
        await nextTick();

        const call = routerStub.patch.mock.calls.at(0);

        (call?.[2] as { onError?: () => void }).onError?.();
        await nextTick();

        expect(wrapper.find('.line-through').exists()).toBe(false);
    });
});
