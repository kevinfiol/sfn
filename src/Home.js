import { m } from 'umai';
import { TextInput, UserCard } from './components';
import { queryCategories, queryCommonApps, queryFriends } from './api';
import { or } from './query';

export default function Home({ actions, router }) {
  let steamid = '';

  const profiles = queryFriends();
  const apps = queryCommonApps();
  const categories = queryCategories();

  const loading = or(profiles.loading, apps.loading);

  // subscribe to loading store & update global state on changes
  loading.sub(actions.setLoading);

  function onSubmit(ev) {
    ev.preventDefault();
    profiles.mutate({ steamid }, actions.setProfiles);
  }

  function compareLibraries(idString) {
    Promise.all([
      apps.mutate({ steamids: idString }),
      categories.mutate()
    ]).then(([apps, categories]) => {
      actions.setApps(apps, categories);
      router.route('/' + idString);
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

      profiles.error() && m('section',
        m('div.error', 'Unable to retrieve profiles.')
      ),

      apps.error() && m('section',
        m('div.error', 'Unable to retrieve apps.')
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
