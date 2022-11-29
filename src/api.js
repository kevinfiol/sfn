import { redraw } from 'closures';
import { query } from './query';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

function fetcher(url, params = {}) {
    const queryString = Object.entries(params).reduce((a, [k, v]) => {
        if (!a) a += '?';
        a += `${k}=${v}`;
        return a;
    }, '');

    return fetch(endpoint(url) + queryString)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            if (res.error) throw res.error;
            return res.data[0];
        })
        .catch((e) => {
            console.error(e);
            return {};
        });
}

export function queryProfiles(staged, steamids) {
    const initial = staged || [];

    return query('getProfiles', fetcher, {
        initial,
        skip: initial.length || staged == undefined,
        chain: (data) => data.profiles,
        end: redraw,
        params: { steamids }
    });
}

export function queryCommonApps(apps, steamids) {
    const initial = apps || [];

    return query('getCommonApps', fetcher, {
        initial,
        skip: initial.length || apps == undefined,
        chain: (data) => data.apps,
        end: redraw,
        params: { steamids }
    });
}

export function queryCategories(categories) {
    const initial = categories || [];

    return query('getCategories', fetcher, {
        initial,
        skip: initial.length || categories == undefined,
        end: redraw,
    });
}

export function queryFriends() {
    return query('getFriends', fetcher, {
        initial: {},
        skip: true,
        end: redraw,
    });
}