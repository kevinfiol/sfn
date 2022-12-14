let NIL = void 0,
    noop = _ => {},
    defaultChain = x => x;

export function query(
    key = '',
    fetcher,
    {
        initial = NIL,
        skip = false,
        params = {},
        chain = defaultChain,
        end = noop
    } = {}
) {
    let data = store(initial),
        error = store(),
        loading = store(false);

    function once(fn) {
        let unsub;
        unsub = data.sub((x) => {
            if (x) {
                fn(x);
                unsub && unsub();
                unsub = NIL;
            }
        });
    }

    function runFetcher(params = {}, callback = defaultChain) {
        loading(true);
        error(NIL);
        return fetcher(key, params)
            // transform data before saving in store
            .then(chain)
            // save data to store
            .then(x => {
                data(x);
                return x;
            })
            // callback chain with new data
            .then(x => {
                try { return callback(x); }
                catch (e) { throw e; }
            })
            // save error to store
            .catch(error)
            // clean up and call end task if exists
            .finally(_ => {
                loading(false);
                requestAnimationFrame(end);
            });
    }

    let mutate = (params, callback) =>
        runFetcher(params, callback);

    if (!skip) runFetcher(params);
    return { data, error, loading, once, mutate };
}

export function or(...stores) {
    return combine(stores, xs =>
        xs.reduce((a, c) => a || c(), false)
    );
};

function combine(stores, fn) {
    let calc = _ => fn(stores);
    let combined = store(calc());

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