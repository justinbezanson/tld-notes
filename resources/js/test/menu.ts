import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import type { Component } from 'vue';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Dropdown content needs its MenuRoot and only renders while the menu is open,
 * so this mounts a component inside a menu that is forced open. The content is
 * portaled, so specs reach for it through `menuLink`/`menuItem` or the document.
 */
export async function mountInMenu(
    component: Component,
    props: Record<string, unknown> = {},
): Promise<ReturnType<typeof mount>> {
    const Host = defineComponent({
        setup: () => () =>
            h(
                DropdownMenu,
                { open: true, onUpdateOpen: () => {} },
                {
                    default: () => [
                        h(DropdownMenuTrigger, null, {
                            default: () =>
                                h('button', { type: 'button' }, 'menu'),
                        }),
                        h(DropdownMenuPortal, null, {
                            default: () =>
                                h(DropdownMenuContent, null, {
                                    default: () => h(component, props),
                                }),
                        }),
                    ],
                },
            ),
    });

    const wrapper = mount(Host, { attachTo: document.body });

    // The popper positions itself after the first flush.
    await nextTick();

    return wrapper;
}

/** The portaled menu content, which carries the placement Reka chose. */
export function menuContent(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[role="menu"]');
}

/** Reka opens a dropdown from a plain left click on its trigger. */
export async function clickMenuTrigger(trigger: Element): Promise<void> {
    trigger.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    await nextTick();
    await nextTick();
}

export function menuLink(label: string): HTMLAnchorElement {
    const link = [...document.querySelectorAll('a')].find(
        (anchor) => anchor.textContent?.trim() === label,
    );

    if (!link) {
        throw new Error(`No menu link labelled "${label}".`);
    }

    return link;
}

/** Menu entries can render as an anchor or, with `as="button"`, a button. */
export function menuAction(label: string): HTMLElement {
    const action = [
        ...document.querySelectorAll<HTMLElement>('a, button'),
    ].find((candidate) => candidate.textContent?.trim() === label);

    if (!action) {
        throw new Error(`No menu action labelled "${label}".`);
    }

    return action;
}

export function menuItem(label: string): HTMLElement {
    const item = [
        ...document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    ].find((candidate) => candidate.textContent?.trim() === label);

    if (!item) {
        throw new Error(`No menu item labelled "${label}".`);
    }

    return item;
}
