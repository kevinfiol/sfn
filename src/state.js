const State = () => ({
    loading: false,
    error: '',
    user: null,
    friends: null,
    staged: {},
    stagedCount: 0,
    idString: '',
    appCount: null,
    apps: [],
    categoryMap: {}
});

const Actions = (state) => ($ = {
    setError: (error) => state.error = error,

    setLoading: (loading) => {
        if (loading) $.setError('');
        state.loading = loading;
    },

    setProfiles: ({ user, friends }) => {
        state.user = user || null;
        state.friends = friends || null;

        // reset staged properties
        state.staged = {};
        state.stagedCount = 0;
        if (user) $.toggleStage(user);
    },

    setApps: ({ count, apps, categories }) => {
        state.appCount = count || 0;
        state.apps = apps;
        state.categoryMap = categories;
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
        // e.g., `kebsteam,761237649,pizzuhbagel``
        state.idString = Object.values(state.staged)
            .map(profile => profile.identifier)
            .join(',');
    }
});

export { State, Actions };