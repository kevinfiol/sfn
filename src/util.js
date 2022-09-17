import { store, computed } from 'vyce';

export function query(fetcher, { initial = null, skip = false } = {}) {
    const data = store(initial);
    const error = store();
    const loading = store(false);

    // convenience method to initialize local variables in functions
    const once = (f) => {
        let unsub;
        unsub = data.sub(x => {
            if (x) {
                f(x);
                if (unsub) unsub();
            }
        });
    };

    const runFetcher = (params = {}) => {
        loading(true);
        return fetcher(params)
            .then(data)
            .catch(error)
            .finally(_ => loading(false));
    };

    const mutate = async (params) => runFetcher(params);

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
    return computed(queries.map(query => query[key]), (...stores) => {
        return stores.reduce((a, c) => a || c, false);
    });
};

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