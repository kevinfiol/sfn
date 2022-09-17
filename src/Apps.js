import m from 'mithril';
import { Spinner, Card, TextInput } from './components';
import { queryProfiles, queryCommonApps, queryCategories } from './api';
import { combine } from './util';

const MULTIPLAYER_CATEGORIES = [1, 9, 20, 27, 36, 38];

export function Apps({ attrs: { state, steamids } }) {
    // on page change
    window.scroll(0, 0);

    let textInput = '';
    let checkedCategories = [];
    let filtered = [];

    const profiles = queryProfiles(Object.values(state.staged), steamids);
    const categories = queryCategories(state.categories);
    const apps = queryCommonApps(state.apps, steamids);

    // initialize filtered to initial apps data
    apps.once((data) => filtered = data);

    const loading = combine('loading', [profiles, categories, apps]);
    const error = combine('error', [profiles, categories, apps]);

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
        view: () => m('div',
            loading() &&
                m(Spinner)
            ,

            error() &&
                m('div.error', 'Unable to retrieve common apps.')
            ,

            !loading() && !error() && [
                m('section',
                    m('hr'),
                    m('h2', 'Profiles'),
                    m('div.grid.columns-200.gap-1',
                        profiles.data().map((profile) =>
                            m(Card, {
                                profile,
                                showHeader: true
                            })
                        )
                    )
                ),

                m('section',
                    m('hr'),
                    m('h2', 'Categories'),
                    m('div.subsection.flex.gap-1',
                        m('button', {
                            onclick: () => {
                                checkedCategories = MULTIPLAYER_CATEGORIES;
                                applyFilter(apps.data(), categoryFilter);
                            }
                        }, 'Check Multiplayer Categories'),

                        m('button', {
                            onclick: () => {
                                checkedCategories = [];
                                applyFilter(apps.data(), categoryFilter);
                            }
                        }, 'Uncheck All')
                    ),
                    m('div.grid.columns-250.gap-1',
                        categories.data().map(([value, name]) => m('div.category', {
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
                                        applyFilter(apps.data(), categoryFilter);
                                    }
                                })
                            )
                        ))
                    )
                ),

                m('section',
                    m('hr'),
                    m('h2', `Apps (${filtered.length})`),
                    m(TextInput, {
                        placeholder: 'filter by name',
                        onInput: (v) => {
                            textInput = v;
                            applyFilter(apps.data(), textFilter);
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
            ]
        )
    };
}