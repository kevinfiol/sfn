import m from 'mithril';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

export async function getProfiles(steamid) {
    let [profiles, error] = [{}, ''];
    const url = endpoint('getProfiles');

    try {
        const res = await m.request({ url, params: { steamid } });
        if (res.error) throw res.error;
        profiles = res.data[0];
    } catch(e) {
        console.error(e);
        error = 'Unable to getProfiles.';
    }

    return [profiles, error];
}