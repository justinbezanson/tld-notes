import { defineComponent, h } from 'vue';

/**
 * Inertia's <Link> navigates through the router, which no spec boots. This
 * renders the same markup (an anchor, or a button when `as="button"`) so specs
 * can assert hrefs and clicks without a router behind them.
 */
function hrefTo(href: unknown): string {
    if (typeof href === 'string') {
        return href;
    }

    if (href && typeof href === 'object' && 'url' in href) {
        return String((href as { url: unknown }).url);
    }

    return '';
}

export const LinkStub = defineComponent({
    name: 'Link',
    inheritAttrs: false,
    props: {
        href: { type: [String, Object], required: false },
        as: { type: String, required: false },
        method: { type: String, required: false },
        tabindex: { type: [String, Number], required: false },
    },
    setup(props, { slots, attrs }) {
        return () => {
            const href = hrefTo(props.href);
            // Declared props would otherwise be dropped, so they are rendered
            // the way Inertia hands them to the element.
            const passthrough = { tabindex: props.tabindex };

            if (props.as === 'button') {
                return h(
                    'button',
                    {
                        type: 'button',
                        'data-href': href,
                        ...passthrough,
                        ...attrs,
                    },
                    slots.default?.(),
                );
            }

            return h(
                'a',
                { href, ...passthrough, ...attrs },
                slots.default?.(),
            );
        };
    },
});
