import { redraw } from "umai";

const API_URL = process.env.API_URL;
const endpoint = (action) => `${API_URL}/${action}`;

function request(url, params = {}) {
  let query = "";

  for (let k in params) {
    if (!query) query = "?";
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

export async function getCategories() {
  let data = [],
    error = undefined;

  try {
    data = await request("getCategories");
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { data, error };
}

export async function getCommonApps(steamids = "") {
  let data = [],
    error = undefined;

  try {
    const res = await request("getCommonApps", { steamids });
    if (res.apps) data = res.apps;
    else throw Error("Response did not contain apps");
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { data, error };
}

export async function getProfiles(steamids = "") {
  let data = [],
    error = undefined;

  try {
    const res = await request("getProfiles", { steamids });
    if (res.profiles) data = res.profiles;
    else throw Error("Response did not contain profile data");
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { data, error };
}

export async function getFriends(steamid = "") {
  let data = [],
    error = undefined;

  try {
    data = await request("getFriends", { steamid });
  } catch (e) {
    console.error(e);
    error = e;
  }

  return { data, error };
}
