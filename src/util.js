import { store, computed } from 'vyce';

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

export function queryStore(initial) {
    return {
        val: initial,
        err: undefined,
        set data(v) { this.val = v; console.log(v); },
        get data() { return this.val; },
        set error(e) { this.err = e },
        get error() { return this.err; },
        get loading() { return !this.val && !this.err; }
    };
}

export function query(fetcher, { initial = undefined } = {}) {
    const store = queryStore(initial);

    !initial && fetcher()
        .then(d => store.data = d)
        .catch(e => store.error = e);

    return store;
}



// const getPerson = async () => {
//   return m.request({ url: 'https://swapi.dev/api/people/1/' }).then(JSON.stringify);
// };

// const App = () => {
//   let [content, error] = persons();
  
//   return {
//     view: () =>
//       m('div',
//         'stuff',
//         !error() && !content() && m('p', 'loading...'),
//         error() && m('pre', 'an error occured'),
//         content() && m('pre', content())
//       )
//   };
// }

// m.mount(document.body, App);

// function persons() {
//   const { data, error } = streamResponse(getPerson);
//   return [data, error];
// }

// function streamResponse(fetcher) {
//   const data = stream();
//   const error = stream();
//   fetcher().then(data).catch(error);
//   return { data, error };
// }