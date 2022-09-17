const State = () => ({
    friends: null,
    staged: {},
    stagedCount: 0,
    idString: '',
    apps: [],
    categories: []
});

const Actions = (state) => ($ = {
    setProfiles: ({ user }) => {
        // reset staged properties
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
        // e.g., `kebsteam,761237649,pizzuhbagel``
        state.idString = Object.values(state.staged)
            .map(profile => profile.identifier)
            .join(',');
    }
});

export { State, Actions };