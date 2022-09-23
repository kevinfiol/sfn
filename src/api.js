import m from 'mithril';
import { query } from './query';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

function makeFetcher(action, params, chain = (x) => x) {
    return (addParams) => {
        const url = endpoint(action);

        return m.request({
            url,
            params: { ...params, ...addParams }
        }).then((res) => {
            if (res.error) throw res.error;
            return res.data[0];
        }).then(chain);
    };
};

export function queryProfiles(staged, steamids) {
    const initial = staged || [];
    const skip = initial.length || staged == undefined;

    const fetcher = makeFetcher('getProfiles', { steamids },
        ({ profiles }) => profiles
    );

    return query(fetcher, { initial, skip });
}

export function queryCommonApps(apps, steamids) {
    const initial = apps || [];
    const skip = initial.length || apps == undefined;

    const fetcher = makeFetcher('getCommonApps', { steamids },
        ({ apps }) => apps
    );

    return query(fetcher, { initial, skip });
}

export function queryCategories(categories) {
    const initial = categories || [];
    const skip = initial.length || categories == undefined;

    const fetcher = makeFetcher('getCategories', {}, Object.entries);
    return query(fetcher, { initial, skip });
}

export function queryFriends() {
    const fetcher = makeFetcher('getFriends');
    return query(fetcher, { initial: {}, skip: true });
}