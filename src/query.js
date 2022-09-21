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

function Cache(max, ttl) {
    let items = {},
        size = 0,
        first = undefined,
        last = undefined;

    return $ = {
        has(key) {
            return key in items;
        },

        clear() {
            first = last = undefined;
            size = 0;
            items = {};
        },

        evict() {
            if (size > 0) {
                let item = last;
                delete items[item.key];
                size--;

                if (size === 0) first = last = undefined;
                else {
                    last = item.prev;
                    last.next = undefined;
                }
            }
        },
        
        delete(key) {
            let item;
            if (item = items[key]) {
                delete items[key];
                size--;

                if (item.next) item.next.prev = item.prev;
                if (item.prev) item.prev.next = item.next
                if (item === first) first = item.next;
                if (item === last) last = item.prev;
            }
        },

        get(key) {
            let item, value;

            if (item = items[key]) {
                if (ttl > 0 && item.expire <= new Date().getTime()) $.delete(key);
                else {
                  value = item.value;
                  $.set(key, value); // move item to front of list
                }
            }

            return value;
        },

        set(key, value) {
            let item = items[key];

            if (item) {
                if (item !== first) {
                    let n = item.next,
                        p = item.prev;

                    if (item === last) last = item.prev;

                    item.prev = undefined;
                    item.next = first;
                    first.prev = item;

                    if (p) p.next = n;
                    if (n) n.prev = p;
                }
            } else {
                if (size === max) $.evict();

                item = items[key] = {
                    expire: ttl > 0 ? new Date().getTime() + ttl : ttl,
                    key,
                    prev: undefined,
                    next: first,
                    value
                };

                if (++size === 1) last = item;
                else first.prev = item;
            }

            first = item;
        }
    };
};

