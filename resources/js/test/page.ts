import { reactive } from 'vue';

/**
 * Inertia's usePage() reads the page the router built, which no spec boots.
 * This stand-in hands components the shared props a spec sets, so `auth.user`
 * and friends resolve the way the real middleware would provide them.
 */
export type PageStubProps = {
    auth?: {
        user: Record<string, unknown> | null;
    };
    flash?: {
        title?: string;
        message?: string;
    };
    [key: string]: unknown;
};

const page = reactive<{ props: PageStubProps; url: string }>({
    props: {},
    url: '/',
});

export function pageProps(): PageStubProps {
    return page.props;
}

export function setPageProps(props: PageStubProps): void {
    page.props = props;
}

export function resetPage(): void {
    page.props = {};
    page.url = '/';
}

/** The URL the router is on, which `useCurrentUrl` compares navigation against. */
export function setPageUrl(url: string): void {
    page.url = url;
}

/** Passed to the `usePage` mock so a spec can read what a component looked up. */
export function pageStub(): { props: PageStubProps; url: string } {
    return page;
}
