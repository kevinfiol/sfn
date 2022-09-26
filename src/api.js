import m from 'mithril';
import { query } from './query';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

function fetcher(url, params = {}) {
    return m.request({ url: endpoint(url), params })
        .then((res) => {
            if (res.error) throw res.error;
            return res.data[0];
        });
}

export function queryProfiles(staged, steamids) {
    const initial = staged || [];

    return query('getProfiles', fetcher, {
        initial,
        skip: initial.length || staged == undefined,
        chain: (data) => data.profiles,
        params: { steamids }
    });
}

export function queryCommonApps(apps, steamids) {
    const initial = apps || [];

    return query('getCommonApps', fetcher, {
        initial,
        skip: initial.length || apps == undefined,
        chain: (data) => data.apps,
        params: { steamids }
    });
}

export function queryCategories(categories) {
    const initial = categories || [];

    return query('getCategories', fetcher, {
        initial,
        skip: initial.length || categories == undefined
    });
}

export function queryFriends() {
    return query('getFriends', fetcher, {
        initial: {},
        skip: true
    });
}