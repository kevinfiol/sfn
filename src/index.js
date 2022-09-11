import m from 'mithril';
import { State, Actions } from './state';
import { TextInput, Spinner, Card, Panel } from './components';
import { getProfiles } from './api';

function App({ attrs: { actions } }) {
    let steamid = '';

    return {
        view: ({ attrs: { state } }) => m('div',
            m('section',
                m('form', {
                    onsubmit: async (ev) => {
                        ev.preventDefault();
                        actions.setProfiles({});
                        actions.setLoading(true);

                        const [profiles, error] = await getProfiles(steamid);
                        if (error) actions.setError(error);
                        else actions.setProfiles(profiles);
                        console.log(profiles);
                        console.log(state);

                        actions.setLoading(false);
                        m.redraw();
                    }
                },
                    m(TextInput, {
                        placeholder: 'enter steamid',
                        onInput: (v) => steamid = v
                    })
                )
            ),

            state.loading &&
                m(Spinner)
            ,

            m('section',
                state.error &&
                    m('div.error', state.error)
                ,

                state.user && [
                    m('h2', 'User'),
                    m(Card, { profile: state.user, showHeader: true })
                ],
            ),

            m('section',
                state.friends && state.friends.length > 0 && [
                    m('h2', 'Friends'),
                    m('div.grid.grid-columns.gap-1',
                        state.friends.map((friend) =>
                            m(Card, {
                                key: friend.steamid,
                                profile: friend,
                                isStaged: state.staged.includes(friend.steamid),
                                onClick: () => {
                                    actions.toggleStage(friend.steamid)
                                }
                            })
                        )
                    )
                ]
            ),

            state.staged.length > 1 &&
                m(Panel, { stagedCount: state.staged.length - 1 })
            ,
        )
    };
}

m.mount(document.getElementById('app'), () => {
    const state = State();
    const actions = Actions(state);

    return {
        view: () => m(App, { state, actions })
    };
});