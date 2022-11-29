import { m, app, redraw } from 'closures';
import navaid from 'navaid';
import { State, Actions } from './state';
import { Spinner } from './components';

const HOME = { path: '/', cmp: import('./Home.js') };
const APPS = { path: '/:steamids', cmp: import('./Apps.js') };

let $page;

function run(thunk, props) {
    return Promise.resolve(thunk).then((mod) => {
        $page = m(mod.default || mod, props);
    }).then(redraw);
}

const App = ({ state }) => (
    m('div',
        state.loading &&
            m(Spinner)
        ,

        m('div.page', { class: { '-loading': state.loading } },
            $page
        )
    )
);

function mount(root) {
    const router = navaid();
    const state = State();
    const actions = Actions(state);

    const ctx = { state, actions, router };

    app(m(App, ctx), root);

    router
        .on(HOME.path, () => {
            actions.reset();
            run(HOME.cmp, ctx);
        })
        .on(APPS.path, (params) => {
            run(APPS.cmp, { ...ctx, ...params })
        });

    router.listen();
}

mount(document.getElementById('app'));