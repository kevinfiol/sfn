const State = () => ({
    loading: false,
    error: '',
    user: null,
    friends: null,
    staged: [],
    idString: '',
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
        if (user) $.toggleStage(user.steamid);
    },

    toggleStage: (steamid) => {
        if (state.staged.includes(steamid)) {
            state.staged = state.staged.filter(id => id != steamid);
        } else {
            state.staged.push(steamid);
        }

        state.idString = state.staged.join(',');
    }
});

export { State, Actions };