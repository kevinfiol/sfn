import { m } from 'closures';
import { UserCard, AppCard, TextInput, CheckBox } from './components';
import { queryProfiles, queryCommonApps, queryCategories } from './api';
import { or } from './query';

const MULTIPLAYER_CATEGORIES = [1, 9, 20, 27, 36, 38];

export default function Apps({ state, actions, steamids }) {
    // on page change
    window.scroll(0, 0);

    let textInput = '';
    let checkedCategories = [];
    let filtered = [];
    let isExclusive = false;

    const profiles = queryProfiles(Object.values(state.staged), steamids);
    const categories = queryCategories(state.categories);
    const apps = queryCommonApps(state.apps, steamids);

    // initialize filtered to initial apps data
    apps.once((data) => filtered = data);

    const loading = or(profiles.loading, categories.loading, apps.loading);
    const error = or(profiles.error, categories.error, apps.error);

    // subscribe to loading store & update global state on changes
    loading.sub(actions.setLoading);

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

    return () => [
        !loading() && error() &&
            m('div.error', 'Unable to retrieve common apps.')
        ,

        !loading() && !error() && [
            m('section',
                m('hr'),
                m('h2', 'Profiles'),
                m('div.grid.columns-200.gap-1',
                    profiles.data().map((profile) =>
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
                            applyFilter(apps.data(), categoryFilter);
                        }
                    }, 'Check Multiplayer Categories'),

                    m('button', {
                        onclick: () => {
                            checkedCategories = [];
                            applyFilter(apps.data(), categoryFilter);
                        }
                    }, 'Uncheck All'),

                    m(CheckBox, {
                        name: 'Exclusively Filter',
                        value: 'exclusive',
                        checked: isExclusive,
                        onChange: (checked) => {
                            isExclusive = checked;
                            applyFilter(apps.data(), categoryFilter);
                        }
                    })
                ),
                m('div.grid.columns-250.gap-1',
                    categories.data().map(([value, name]) =>
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

                                applyFilter(apps.data(), categoryFilter);
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
                        applyFilter(apps.data(), textFilter);
                    }
                }),

                m('div.grid.columns-200-fill.gap-1', {
                    style: 'padding: 1rem 0;'
                },
                    filtered.map((app) =>
                        m(AppCard, {
                            key: app.steam_appid,
                            ...app
                        })
                    ),
                ),

                !filtered.length &&
                    m('blockquote', {
                        style: 'margin-bottom: 25rem; font-size: 1.25em;'
                    }, 'No Apps Found.')
                ,
            )
        ]
    ];
}