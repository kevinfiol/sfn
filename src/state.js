const State = () => ({
  loading: false,
  error: undefined,
  user: undefined,
  friends: [],
  staged: {},
  stagedCount: 0,
  idString: '',
  apps: [],
  categories: []
});

const Actions = (state, $) => ($ = {
  reset: () => {
    let tmp = State();

    for (let k in tmp) {
      state[k] = tmp[k];
    }
  },

  setError: (error) => {
    state.error = error;
  },

  setLoading: (loading) => {
    if (loading) state.error = undefined;
    state.loading = loading;
  },

  setProfiles: ({ user, friends }) => {
    // reset staged properties
    state.user = user;
    state.friends = friends || [];
    state.staged = {};
    state.stagedCount = 0;
    if (user) $.toggleStage(user);
  },

  setApps: (apps, categories) => {
    state.apps = apps;
    state.categories = categories;
  },

  toggleStage: (profile) => {
    if (state.staged[profile.steamid]) {
      state.stagedCount -= 1;
      delete state.staged[profile.steamid];
    } else {
      state.stagedCount += 1;
      state.staged[profile.steamid] = profile;
    }

    // create CSV of profile identifiers
    // e.g., `kebsteam,761237649,pizzuhbagel`
    state.idString = Object.values(state.staged)
      .map(profile => profile.identifier)
      .join(',');
  }
});

export { State, Actions };