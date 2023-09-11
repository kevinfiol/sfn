import { m, redraw } from 'umai';
import { UserCard, AppCard, TextInput, CheckBox } from './components.js';
import { getProfiles, getCategories, getCommonApps } from './api.js';

const MULTIPLAYER_CATEGORIES = [1, 9, 20, 27, 36, 38];

async function fetchPageData(steamids = '', stagedProfiles = {}) {
  let error = undefined;
  let data = {
    profiles: [],
    categories: [],
    apps: []
  };

  const profileList = Object.values(stagedProfiles);
  const profileData = profileList.length > 0
    ? { data: profileList }
    : undefined;

  try {
    const [profiles, categories, apps] = await Promise.all([
      profileData || getProfiles(steamids),
      getCategories(),
      getCommonApps(steamids)
    ]);

    const error = profiles.error || categories.error || apps.error;
    if (error) throw error;

    data = {
      profiles: profiles.data,
      categories: categories.data,
      apps: apps.data
    };
  } catch (e) {
    console.error('Error fetching Apps page data: ', e);
    error = e instanceof Error ? 'Unable to retrieve profile data' : e;
  }

  return { data, error };
}

export default function Apps({ state, actions, steamids }) {
  // on page change
  window.scroll(0, 0);

  let textInput = '';
  let checkedCategories = [];
  let filtered = [];
  let isExclusive = false;

  let profiles = [];
  let categories = [];
  let apps = [];

  actions.setLoading(true);
  fetchPageData(steamids, state.staged)
    .then(({ data, error }) => {
      if (error) {
        actions.setError(error);
      } else {
        profiles = data.profiles;
        categories = data.categories;
        filtered = apps = data.apps;
      }

      actions.setLoading(false);
      redraw();
    });

  function categoryFilter(app) {
    if (!checkedCategories.length) return true;

    let include = isExclusive;

    for (const cat of checkedCategories) {
      if (!isExclusive) {
        if (app.categoryMap[cat]) return true;
      } else {
        include = include && app.categoryMap[cat];
      }
    }

    return include;
  }

  function textFilter(app) {
    const input = textInput.trim();
    if (!input) return true;
    return app.name.toLowerCase().indexOf(input.toLowerCase()) > -1;
  }

  function applyFilter(apps, filter) {
    filtered = apps.filter(filter);
  }

  return () => (
    m('div',
      state.error &&
        m('div.error', state.error)
      ,

      !state.loading && !state.error && [
        m('section',
          m('hr'),
          m('h2', 'Profiles'),
          m('div.grid.columns-200.gap-1',
            profiles.map((profile) =>
              m(UserCard, {
                profile,
                showHeader: true
              })
            )
          )
        ),

        m('section',
          m('hr'),
          m('h2', 'Categories'),
          m('div.subsection.gap-1.flex',
            m('button', {
              onclick: () => {
                checkedCategories = [...MULTIPLAYER_CATEGORIES];
                applyFilter(apps, categoryFilter);
              }
            }, 'Check Multiplayer Categories'),

            m('button', {
              onclick: () => {
                checkedCategories = [];
                applyFilter(apps, categoryFilter);
              }
            }, 'Uncheck All'),

            m(CheckBox, {
              name: 'Exclusively Filter',
              value: 'exclusive',
              checked: isExclusive,
              onChange: (checked) => {
                isExclusive = checked;
                applyFilter(apps, categoryFilter);
              }
            })
          ),
          m('div.grid.columns-250.gap-1',
            categories.map(([value, name]) =>
              m(CheckBox, {
                name,
                value,
                checked: checkedCategories.includes(value),
                onChange: (checked) => {
                  if (checked) {
                    checkedCategories.push(value);
                  } else {
                    const idx = checkedCategories.indexOf(value);
                    if (~idx) checkedCategories.splice(idx, 1);
                  }

                  applyFilter(apps, categoryFilter);
                }
              })
            )
          )
        ),

        m('section',
          m('hr'),
          m('h2', `Apps (${filtered.length})`),
          m(TextInput, {
            placeholder: 'filter by name',
            value: textInput,
            onInput: (v) => {
              textInput = v;
              applyFilter(apps, textFilter);
            }
          }),

          m('div.grid.columns-200-fill.gap-1', {
            style: 'padding: 1rem 0;'
          },
            filtered.map((app) =>
              m(AppCard, { ...app })
            ),
          ),

          !filtered.length &&
            m('blockquote', {
              style: 'margin-bottom: 25rem; font-size: 1.25em;'
            }, 'No Apps Found.')
          ,
        )
      ]
    )
  );
}
