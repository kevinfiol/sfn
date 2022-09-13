import m from 'mithril';
import { TextInput, Spinner, Card } from './components';
import { getFriends, getCommonApps } from './api';

export function Home({ attrs: { actions } }) {
    let steamid = '';

    async function onSubmit(ev) {
        ev.preventDefault();
        actions.setProfiles({});
        actions.setLoading(true);

        const [profiles, error] = await getFriends(steamid);
        if (error) actions.setError(error);
        else actions.setProfiles(profiles);

        actions.setLoading(false);
        m.redraw();
    }

    async function compareLibraries(idString) {
        actions.setLoading(true);

        const [common, error] = await getCommonApps(idString);
        if (error) actions.setError(error);
        else actions.setApps(common);

        actions.setLoading(false);
        // go to apps route
        m.route.set('/' + idString);
        m.redraw();
    }

    return {
        view: ({ attrs: { state } }) => m('div',
            m('section',
                m('form', { onsubmit: onSubmit },
                    m(TextInput, {
                        placeholder: 'enter steamid',
                        onInput: (v) => steamid = v
                    })
                )
            ),

            state.loading &&
                m(Spinner)
            ,

            state.error && m('section',
                m('div.error', state.error)
            ),

            state.user && m('section',
                m('hr'),
                m('h2', 'User'),
                m(Card, { profile: state.user, showHeader: true })
            ),

            state.friends && state.friends.length > 0 && m('section',
                m('hr'),
                m('h2', 'Friends'),
                m('div.grid.columns-200.gap-1',
                    state.friends.map((friend) =>
                        m(Card, {
                            key: friend.steamid,
                            profile: friend,
                            isStaged: state.staged[friend.steamid],
                            onClick: () => {
                                actions.toggleStage(friend)
                            }
                        })
                    )
                )
            ),

            state.stagedCount > 1 &&
                m('div.panel',
                    m('div', (state.stagedCount - 1) + ' friends selected'),
                    m('button', {
                        disabled: state.loading,
                        onclick: () => {
                            compareLibraries(state.idString)
                        }
                    }, 'Compare Libraries')
                )
            ,
        )
    };
}