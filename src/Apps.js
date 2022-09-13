import m from 'mithril';
import { Spinner, Card } from './components';
import { store, computed } from 'vyce';
import { query } from './util';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

export function Apps({ attrs: { state, actions, ids } }) {
    let textInput = '';
    const profiles = queryProfiles(Object.values(state.staged), ids);
    // const categories = queryCategories(state.categoryMap);
    // const apps = queryApps(state.apps);

    return {
        view: ({ attrs: { state } }) => m('div',
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

function queryProfiles(staged, ids) {
    const toFetch = !staged.length;

    const { data, error } = query(
        () => m.request({
            url: endpoint('getProfiles'),
            params: { steamids: ids }
        }).then(r => {
            if (r.error) throw r.error;
            return r.data[0].profiles;
        }),
        !toFetch ? staged : null,
        toFetch
    );

    const loading = computed([data, error], (x, y) => !x && !y);
    return { data, error, loading };
}

// function queryCategories() {
//     const { data, error } = query(getCats);
//     const loading = computed([data, error], (x, y) =>
//         !x && !y
//     );

//     error.sub(console.log)

//     return [data, error, loading];
// }