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

export function query(fetcher, { initial = undefined } = {}) {
    const data = store(initial);
    const error = store();
    const loading = computed([data, error], (d, e) => !d && !e);
    !initial && fetcher().then(data.set).catch(error.set);
    return { data, error, loading };
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