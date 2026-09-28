import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UserInfo from '@/components/UserInfo.vue';
import { makeUser } from '@/test/factories';

const user = makeUser({ name: 'Ada Lovelace', email: 'ada@example.com' });

function mountInfo(props: Record<string, unknown> = {}) {
    return mount(UserInfo, { props: { user, ...props } });
}

describe('UserInfo', () => {
    it('shows the name', () => {
        expect(mountInfo().text()).toContain('Ada Lovelace');
    });

    it('derives initials from the name', () => {
        expect(mountInfo().text()).toContain('AL');
    });

    it('hides the email by default', () => {
        expect(mountInfo().text()).not.toContain('ada@example.com');
    });

    it('shows the email when asked', () => {
        expect(mountInfo({ showEmail: true }).text()).toContain(
            'ada@example.com',
        );
    });

    it('shows initials when there is no avatar', () => {
        const wrapper = mount(UserInfo, {
            props: { user: makeUser({ name: 'Grace Hopper', avatar: '' }) },
        });

        expect(wrapper.text()).toContain('GH');
        expect(wrapper.find('img').exists()).toBe(false);
    });

    it('renders the avatar image when there is one', () => {
        const wrapper = mount(UserInfo, {
            props: {
                user: makeUser({
                    name: 'Ada Lovelace',
                    avatar: '/avatars/ada.png',
                }),
            },
        });

        expect(wrapper.find('img').attributes('src')).toBe('/avatars/ada.png');
    });
});
