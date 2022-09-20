export function query(fetcher, { initial = null, skip = false } = {}) {
    const data = store(initial);
    const error = store();
    const loading = store(false);

    function once(fn) {
        let unsub;
        unsub = data.sub((x) => {
            if (x) {
                fn(x);
                if (unsub) {
                    unsub();
                    unsub = undefined;
                }
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

    const mutate = (params) => runFetcher(params);

    const props = {
        data,
        error,
        loading,
        once,
        mutate
    };

    // initial fetch
    if (!skip) runFetcher();
    return props;
}

export function combine(key, queries) {
    const stores = queries.map(query => query[key]);

    const calc = () => stores.reduce((a, c) => {
        return a || c();
    }, false);

    const combined = store(calc());

    stores.map(s => {
        s.sub(_ => {
            combined(calc());
        }, false);
    });

    return combined;
};

export function store(initial) {
    let value = initial;
    let subs = [];

    let $ = function (x) {
        if (!arguments.length) return value;
        value = x;
        subs.map(fn => fn(x));
    }

    $.sub = (fn, run = true) => {
        if (run) fn(value);
        subs.push(fn);
        return _ => subs = subs.filter(x => x != fn);
    };

    return $;
}

export function SpinnerEl(element, ms = 100) {
    let el = element;
    let step = 0;
    let timer;

    const steps = {
        0: '|',
        1: '/',
        2: '-',
        3: '\\',
        4: '|',
        5: '/',
        6: '-',
        7: '\\'
    };

    return {
        start() {
            timer = setInterval(() => {
                if (step == 8) step = 0;
                el.innerText = steps[step];
                step += 1;
            }, ms);
        },

        remove() {
            el.innerText = '';
            clearInterval(timer);
        }
    };
}