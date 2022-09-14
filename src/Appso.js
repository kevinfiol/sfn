import m from 'mithril';
import { TextInput, Spinner, Card } from './components';
import { getCommonApps, getProfiles } from './api';

const MULTIPLAYER_CATEGORIES = [1, 9, 20, 27, 36, 38];

export function Apps({ attrs: { actions } }) {
    let textInput = '';
    let profiles = [];
    let categories = [];
    let filtered = [];

    let checkedCategories = [];

    function categoryFilter(app) {
        if (!checkedCategories.length) return true;

        for (const cat of checkedCategories) {
            if (app.categoryMap[cat]) return true;
        }

        return false;
    }

    function textFilter(app) {
        let input = textInput.trim();
        if (!input) return true;
        return app.name.toLowerCase().indexOf(input.toLowerCase()) > -1;
    }

    function applyFilter(apps, filter) {
        filtered = apps.filter(filter);
    }

    return {
        oninit: async ({ attrs: { state, steamids } }) => {
            window.scroll(0, 0);

            if (state.staged) {
                profiles = Object.values(state.staged);
            }

            if (state.categoryMap) {
                categories = Object.entries(state.categoryMap);
            }

            if (state.appCount && state.apps.length) {
                filtered = [...state.apps];
                return;
            }

            // else need to retrieve apps && profiles
            actions.setLoading(true);

            const [appsRes, profilesRes] = await Promise.all([
                getCommonApps(steamids),
                getProfiles(steamids)
            ]);

            let resErr;
            if (resErr = (appsRes[1] || profilesRes[1])) {
                actions.setError(resErr);
            } else {
                const common = appsRes[0];
                actions.setApps(common);

                profiles = profilesRes[0];
                categories = Object.entries(common.categories);
                filtered = [...common.apps];
            }

            actions.setLoading(false);
        },

        view: ({ attrs: { state } }) => m('div',
            state.loading &&
                m(Spinner)
            ,

            state.error && m('section',
                m('div.error', state.error)
            ),

            profiles.length > 0 && m('section',
                m('hr'),
                m('h2', 'Profiles'),
                m('div.grid.columns-200.gap-1',
                    profiles.map((profile) =>
                        m(Card, {
                            profile,
                            showHeader: true
                        })
                    )
                )
            ),

            categories.length > 0 && m('section',
                m('hr'),
                m('h2', 'Categories'),
                m('div.subsection.flex.gap-1',
                    m('button', {
                        onclick: () => {
                            checkedCategories = MULTIPLAYER_CATEGORIES;
                            applyFilter(state.apps, categoryFilter);
                        }
                    }, 'Check Multiplayer Categories'),

                    m('button', {
                        onclick: () => {
                            checkedCategories = [];
                            applyFilter(state.apps, categoryFilter);
                        }
                    }, 'Uncheck All')
                ),
                m('div.grid.columns-250.gap-1',
                    categories.map(([value, name]) => m('div.category', {
                        className: checkedCategories.includes(Number(value)) ? '-selected' : ''
                    },
                        m('label', { for: name },
                            name,
                            m('input', {
                                type: 'checkbox',
                                id: name,
                                value,
                                checked: checkedCategories.includes(Number(value)),
                                onchange: ({ target }) => {
                                    value = Number(value);
                                    if (target.checked) checkedCategories.push(value);
                                    else checkedCategories = checkedCategories.filter(c => c != value);
                                    applyFilter(state.apps, categoryFilter);
                                }
                            })
                        )
                    ))
                )
            ),

            !state.loading && !state.error && m('section',
                m('hr'),
                m('h2', `Apps (${filtered.length})`),
                m(TextInput, {
                    placeholder: 'filter by name',
                    onInput: (v) => {
                        textInput = v;
                        applyFilter(state.apps, textFilter);
                    }
                }),

                m('div.grid.columns-200-fill.gap-1', {
                    style: { padding: '1rem 0' }
                },
                    filtered.map(a =>
                        m('div.card', { key: a.id },
                            m('div',
                                m('a.-neutral', { href: `https://store.steampowered.com/app/${a.steam_appid}` },
                                    m('img.border', {
                                        loading: 'lazy',
                                        src: a.header_image
                                    })
                                ),

                                m('span', a.name),

                                m('small.block',
                                    // makes a string like `windows / linux / mac`
                                    Object.entries(a.platforms).reduce((a, c) => {
                                        if (c[1]) a += a ? ' / ' + c[0] : c[0];
                                        return a;
                                    }, '')
                                )
                            )
                        )
                    ),
                ),

                !filtered.length && m('blockquote', {
                    style: { marginBottom: '25rem', fontSize: '1.25em' }
                }, 'No Apps Found.')
            )
        )
    };
}