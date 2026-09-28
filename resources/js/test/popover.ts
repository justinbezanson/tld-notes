import { nextTick } from 'vue';

/**
 * Popover content is portaled to document.body, so these helpers reach into the
 * document the way FormDialog helpers do.
 */
export function popover(): HTMLElement {
    const popovers = document.querySelectorAll('[data-slot="popover-content"]');
    const content = popovers.item(popovers.length - 1);

    if (!content) {
        throw new Error('No popover is open.');
    }

    return content as HTMLElement;
}

export function popoverText(): string {
    return popover().textContent ?? '';
}

export function popoverOption(label: string): HTMLButtonElement {
    const option = [...popover().querySelectorAll('button')].find(
        (candidate) => candidate.textContent?.trim() === label,
    );

    if (!option) {
        throw new Error(`No popover option labelled "${label}".`);
    }

    return option;
}

export function popoverInput(placeholder: string): HTMLInputElement {
    const input = popover().querySelector<HTMLInputElement>(
        `input[placeholder="${placeholder}"]`,
    );

    if (!input) {
        throw new Error(`No popover input with placeholder "${placeholder}".`);
    }

    return input;
}

export async function typeInPopover(
    placeholder: string,
    value: string,
): Promise<void> {
    const input = popoverInput(placeholder);

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();
}
