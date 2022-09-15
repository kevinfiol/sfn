import m from 'mithril';
import { query } from './util';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

const makeFetcher = (action, params, chain) => () => {
    const url = endpoint(action);

    return m.request({ url, params }).then((res) => {
        if (res.error) throw res.error;
        return res.data[0];
    }).then(d =>
        chain ? chain(d) : d
    );
};

export function queryProfiles(staged, steamids) {
    const initial = (staged && staged.length) ? staged : null;
    const fetcher = makeFetcher('getProfiles', { steamids },
        ({ profiles }) => profiles
    );
    return query(fetcher, { initial });
}

export function queryCommonApps(apps, steamids, oninit) {
    const initial = (apps && apps.length) ? apps : null;

    const fetcher = makeFetcher('getCommonApps', { steamids },
        ({ apps }) => {
            oninit(apps);
            return apps;
        }
    );

    return query(fetcher, { initial });
}

export function queryCategories(categories) {
    const initial = (categories && categories.length) ? categories : null;
    const fetcher = makeFetcher('getCategories', {}, Object.entries);
    return query(fetcher, { initial });
}

// function queryCommonApps(initial, steamids) {
    // const toFetch = !initial.length;

    // const { data, error } = query(
    //     () => Promise.all([
    //         m.request({ url: endpoint('getCategories') }),
    //         m.request({ url: endpoint('getCommonApps'), params: { steamids } })
    //     ]).then(([catsRes, appsRes]) => {
    //         let err;

    //         if (err = (catsRes.error || appsRes.error)) {
    //             throw err;
    //         }

    //         const common = appsRes.data[0];
    //         common.categories = catsRes.data[0];
    //         return common;
    //     }),
    //     !toFetch ? initial : null,
    //     toFetch
    // );

    // const loading = computed([data, error], (x, y) => !x && !y);
    // return { data, error, loading };
// }

export async function getFriends(steamid) {
    let [profiles, error] = [{}, ''];
    const url = endpoint('getFriends');

    try {
        const res = await m.request({ url, params: { steamid } });
        if (res.error) throw res.error;
        profiles = res.data[0];
    } catch (e) {
        console.error(e.message || e);
        error = 'Error: Unable to get friends.';
    }

    return [profiles, error];
}

export async function getProfiles(steamids) {
    let [profiles, error] = [[], ''];
    const url = endpoint('getProfiles');

    try {
        const res = await m.request({ url, params: { steamids } });
        if (res.error) throw res.error;
        profiles = res.data[0].profiles;
    } catch (e) {
        console.error(e.message || e);
        error = 'Error: Unable to get user profiles.';
    }

    return [profiles, error];
}

export async function getCommonApps(steamids) {
    let [common, error] = [{}, ''];
    const appsUrl = endpoint('getCommonApps');
    const categoriesUrl = endpoint('getCategories');

    try {
        const [appsRes, catsRes] = await Promise.all([
            m.request({ url: appsUrl, params: { steamids } }),
            m.request({ url: categoriesUrl })
        ]);

        let reqErr;
        if (reqErr = (appsRes.error || catsRes.error)) {
            throw reqErr;
        }

        common = appsRes.data[0];
        common.categories = catsRes.data[0];
    } catch (e) {
        console.error(e.message || e);
        error = 'Error: Unable to get user libraries & categories.'
    }

    return [common, error];
}