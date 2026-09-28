import { nextTick } from 'vue';

/**
 * FormDialog renders its form through a portal, so it lives on document.body
 * rather than inside the wrapper. These helpers drive it from the document.
 */
export function dialogForm(): HTMLFormElement {
    // The last form is the topmost dialog, which matters when a confirm dialog
    // stacks on top of the one that opened it.
    const forms = document.querySelectorAll('form');
    const form = forms.item(forms.length - 1);

    if (!form) {
        throw new Error('No dialog form is open.');
    }

    return form;
}

export function dialogText(): string {
    return document.body.textContent ?? '';
}

export function dialogButton(label: string): HTMLButtonElement {
    return findButton(
        (candidate) => candidate.textContent?.trim() === label,
        label,
    );
}

/** Icon-only buttons are identified by their title, not their text. */
export function titledButton(title: string): HTMLButtonElement {
    return findButton(
        (candidate) => candidate.title === title,
        `titled "${title}"`,
    );
}

function findButton(
    matches: (candidate: HTMLButtonElement) => boolean,
    description: string,
): HTMLButtonElement {
    const button = [...document.querySelectorAll('button')].find(matches);

    if (!button) {
        throw new Error(
            `No dialog button ${description}. Open: ${dialogText()}`,
        );
    }

    return button;
}

export async function submitDialog(): Promise<void> {
    // The portal content is not in the DOM until the mount has flushed.
    await nextTick();

    dialogForm().dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
    );
    await nextTick();
}
