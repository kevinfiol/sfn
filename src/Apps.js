import m from 'mithril';
import { Spinner, Card } from './components';
import { queryProfiles, queryCommonApps } from './api';

export function Apps({ attrs: { state, actions, steamids } }) {
    let textInput = '';
    const profiles = queryProfiles(Object.values(state.staged), steamids);
    const apps = queryCommonApps(state.apps, steamids);

    apps.data.sub(console.log);

    // const categories = queryCategories(state.categoryMap);
    // const apps = queryApps(state.apps);

    return {
        view: () => m('div',
            profiles.loading.get() &&
                m(Spinner)
            ,

            profiles.error.get() &&
                m('div.error', 'Unable to get profiles.')
            ,

            profiles.data.get() && m('section',
                m('hr'),
                m('h2', 'Profiles'),
                m('div.grid.columns-200.gap-1',
                    profiles.data.get().map((profile) =>
                        m(Card, {
                            profile,
                            showHeader: true
                        })
                    )
                )
            )
        )
    };
}

// function queryCategories() {
//     const { data, error } = query(getCats);
//     const loading = computed([data, error], (x, y) =>
//         !x && !y
//     );

//     error.sub(console.log)

//     return [data, error, loading];
// }