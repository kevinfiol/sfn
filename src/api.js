import m from 'mithril';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

export async function getFriends(steamid) {
    let [profiles, error] = [{}, ''];
    const url = endpoint('getFriends');

    try {
        const res = await m.request({ url, params: { steamid } });
        if (res.error) throw res.error;
        profiles = res.data[0];
    } catch (e) {
        console.error(e);
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
        console.error(e);
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
        console.error(e);
        error = 'Error: Unable to get user libraries & categories.'
    }

    return [common, error];
}