import { m } from 'umai';
import { TextInput, UserCard } from './components.js';
import { getFriends } from './api.js';

export default function Home({ actions, router }) {
  let steamid = '';

  async function onSubmit(ev) {
    ev.preventDefault();

    actions.setLoading(true);
    const { data, error } = await getFriends(steamid);
    actions.setLoading(false);

    if (error) {
      actions.setError('Unable to retrieve profiles. Is your profile private?');
    } else {
      actions.setProfiles(data);
      errorMsg = undefined;
    }
  }

  async function compareLibraries(idString = '') {
    router.route('/' + idString);
  }

  return ({ state }) => (
    m('div',
      m('section',
        m('form.input-group', { onsubmit: onSubmit },
          m(TextInput, {
            value: steamid,
            placeholder: 'enter steamid',
            onInput: (v) => steamid = v
          }),
          m('button.border.border-left-0', 'submit')
        )
      ),

      state.error &&
        m('section',
          m('div.error', state.error)
        )
      ,

      state.user &&
        m('section',
          m('hr'),
          m('h2', 'User'),
          m(UserCard, {
            profile: state.user,
            showHeader: true
          })
        )
      ,

      state.user && state.friends.length > 0 &&
        m('section.pb-7',
          m('hr'),
          m('h2', 'Friends'),
          m('div.grid.columns-200.gap-1',
            state.friends.map((friend) =>
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
        )
      ,

      state.stagedCount > 1 &&
        m('div.panel',
          m('div', (state.stagedCount - 1) + ' friends selected'),
          m('button', {
            onclick: () => {
              compareLibraries(state.idString);
            }
          }, 'Compare Libraries')
        )
      ,
    )
  );
}
