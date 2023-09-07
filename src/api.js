import { redraw } from 'umai';
// import { query } from './query';

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

function request(url, params = {}) {
  let query = '';

  for (let k in params) {
    if (!query) query = '?';
    query += `${k}=${params[k]}`;
  }

  redraw();
  return fetch(endpoint(url) + query)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) throw res.error;
      return res.data[0];
    })
    .finally(redraw);
}

// function fetcher(url, params = {}) {
//   const queryString = Object.entries(params).reduce((a, [k, v]) => {
//     if (!a) a += '?';
//     a += `${k}=${v}`;
//     return a;
//   }, '');

//   return fetch(endpoint(url) + queryString)
//     .then((res) => {
//       return res.json();
//     })
//     .then((res) => {
//       if (res.error) throw res.error;
//       return res.data[0];
//     })
//     .catch((e) => {
//       // throw so query can save error to error store
//       throw e;
//     });
// }

// export function queryProfiles(staged, steamids) {
//   const initial = staged || [];

//   return query('getProfiles', fetcher, {
//     initial,
//     skip: initial.length || staged == undefined,
//     chain: (data) => data.profiles,
//     end: redraw,
//     params: { steamids }
//   });
// }

// export function queryCommonApps(apps, steamids) {
//   const initial = apps || [];

//   return query('getCommonApps', fetcher, {
//     initial,
//     skip: initial.length || apps == undefined,
//     chain: (data) => data.apps,
//     end: redraw,
//     params: { steamids }
//   });
// }

// export function queryCategories(categories) {
//   const initial = categories || [];

//   return query('getCategories', fetcher, {
//     initial,
//     skip: initial.length || categories == undefined,
//     end: redraw,
//   });
// }

// export function queryFriends() {
//   return query('getFriends', fetcher, {
//     initial: {},
//     skip: true,
//     end: redraw,
//   });
// }

export async function getCategories() {
  let data = [], error = undefined;

  try {
    data = await request('getCategories');
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { data, error };
}

export async function getCommonApps(steamids = '') {
  let data = [], error = undefined;

  try {
    let res = await request('getCommonApps', { steamids });
    if (res.apps) data = res.apps;
    throw Error('Response did not contain apps');
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { data, error };
}

export async function getFriends(steamid = '') {
  let data = [], error = undefined;

  try {
    data = await request('getFriends', { steamid });
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { data, error };
}

// export const radio = (defaults = {}) => {
//   let state = {}, values = {};

//   for (let k in defaults) {
//     values[k] = defaults[k];
//     Object.defineProperty(state, k, {
//       enumerable: true,
//       get: _ => values[k],
//       set: value => {
//         if (value === values[k]) return;
//         for (let _k in defaults) values[_k] = defaults[_k];
//         values[k] = value;
//       }
//     });
//   }

//   return Object.seal(state);
// };