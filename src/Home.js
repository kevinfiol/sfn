import m from 'mithril';
import { TextInput, UserCard } from './components';
import { queryCategories, queryCommonApps, queryFriends } from './api';
import { or } from './query';

export function Home({ attrs: { actions } }) {
    let steamid = '';

    const profiles = queryFriends();
    const apps = queryCommonApps();
    const categories = queryCategories();

    const loading = or(profiles.loading, apps.loading);

    // subscribe to loading store & update global state on changes
    loading.sub(actions.setLoading);

    async function onSubmit(ev) {
        ev.preventDefault();
        await profiles.mutate({ steamid });
        actions.setProfiles(profiles.data());
    }

    async function compareLibraries(idString) {
        await Promise.all([
            apps.mutate({ steamids: idString }),
            categories.mutate()
        ]);

        actions.setApps(apps.data(), categories.data());
        m.route.set('/' + idString); // go to apps route
    }

    return {
        view: ({ attrs: { state } }) => [
            m('section',
                m('form.input-group', { onsubmit: onSubmit },
                    m(TextInput, {
                        placeholder: 'enter steamid',
                        onInput: (v) => steamid = v
                    }),
                    m('button.border.border-left-0', 'submit')
                )
            ),

            profiles.error() && m('section',
                m('div.error', 'Unable to retrieve profiles.')
            ),

            apps.error() && m('section',
                m('div.error', 'Unable to retrieve apps.')
            ),

            profiles.data().user && m('section',
                m('hr'),
                m('h2', 'User'),
                m(UserCard, {
                    profile: profiles.data().user,
                    showHeader: true
                })
            ),

            profiles.data().user && profiles.data().friends.length > 0 && m('section',
                m('hr'),
                m('h2', 'Friends'),
                m('div.grid.columns-200.gap-1',
                    profiles.data().friends.map((friend) =>
                        m(UserCard, {
                            key: friend.steamid,
                            profile: friend,
                            isStaged: state.staged[friend.steamid],
                            onClick: () => {
                                actions.toggleStage(friend);
                            }
                        })
                    )
                )
            ),

            state.stagedCount > 1 &&
                m('div.panel',
                    m('div', (state.stagedCount - 1) + ' friends selected'),
                    m('button', {
                        disabled: apps.loading(),
                        onclick: () => {
                            compareLibraries(state.idString);
                        }
                    }, 'Compare Libraries')
                )
            ,
        ]
    };
}
