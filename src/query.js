export function query(fetcher, { initial = null, skip = false } = {}) {
    let data = store(initial),
        error = store(),
        loading = store(false);

    function once(fn) {
        let unsub;
        unsub = data.sub((x) => {
            if (x) {
                fn(x);
                unsub && unsub();
                unsub = void 0;
            }
        });
    }

    function runFetcher(params = {}) {
        loading(true);
        return fetcher(params)
            .then(data)
            .catch(error)
            .finally(_ => {
                loading(false);
            });
    }

    let mutate = params => runFetcher(params);

    if (!skip) runFetcher();
    return { data, error, loading, once, mutate };
}

export function or(key, queries) {
    return combine(key, queries, stores =>
        stores.reduce((a, c) => a || c(), false)
    );
};

function combine(key, queries, fn) {
    const stores = queries.map(query => query[key]);
    const calc = _ => fn(stores);
    const combined = store(calc());

    stores.map(s => {
        s.sub(_ => {
            combined(calc());
        }, false);
    });

    return combined;
};

function store(initial) {
    let value = initial;
    let subs = [];

    let $ = (...args) => {
        if (!args.length) return value;
        value = args[0];
        for (let i = 0; i < subs.length; i++) subs[i](value);
    };

    $.sub = (fn, run = true) => {
        if (run) fn(value);
        subs.push(fn);

        // return unsub func
        return _ => {
          let idx = subs.indexOf(fn);
          if (~idx) subs.splice(idx, 1);
        };
    };

    return $;
}