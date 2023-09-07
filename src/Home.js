import { m } from 'umai';
import { TextInput, UserCard } from './components';
import { getCategories, getFriends, getCommonApps } from './api';

export default function Home({ actions, router, getCommonApps }) {
  let steamid = '';
  let errorMsg = undefined;

  async function onSubmit(ev) {
    ev.preventDefault();

    actions.setLoading(true);
    const { data, error } = await getFriends(steamid);
    actions.setLoading(false);

    if (error) {
      errorMsg = 'Unable to retrieve profiles. Is your profile private?';
    } else {
      actions.setProfiles(data);
      errorMsg = undefined;
    }
  }

  async function compareLibraries(idString = '') {
    actions.setLoading(true);

    Promise.all([
      getCommonApps({ steamids: idString }),
      getCategories()
    ]).then(([appsRes, categoriesRes]) => {
      if (appsRes.error || categoriesRes.error) {
        errorMsg =  'Unable to retrieve apps. Is one of your friends\' profile private?';
        return;
      }

      errorMsg = undefined;
      actions.setApps(appsRes.data, categoriesRes.data);
      actions.setLoading(false);
    });
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

      errorMsg && m('section',
        m('div.error', errorMsg)
      ),

      state.user && m('section',
        m('hr'),
        m('h2', 'User'),
        m(UserCard, {
          profile: state.user,
          showHeader: true
        })
      ),

      state.user && state.friends.length > 0 && m('section.pb-7',
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
    )
  );
}
