import { m, app, redraw } from 'closures';
import navaid from 'navaid';
import cls from 'classies';
import { State, Actions } from './state';
import { Spinner } from './components';
import { Home } from './Home';

const ROUTE = {
    BASE: '/',
    LIBRARY: '/:steamids'
};

const App = ({ state, actions, router }) => (
    m('div',
        state.loading &&
            m(Spinner)
        ,

        m('div.page', { class: cls({ '-loading': state.loading }) },
            state.route.path === ROUTE.BASE &&
                m(Home, { state, actions, router })
            ,

            state.route.path === ROUTE.LIBRARY &&
                m('div',
                    m('a', { href: '/' }, 'back hdfome')
                )
            ,
        )
    )
);

function mount(root) {
    const state = State({ route: { path: ROUTE.BASE, params: {} } });
    const actions = Actions(state);

    const router = navaid();

    router.on(ROUTE.BASE, () => {
        actions.setRoute(ROUTE.BASE);
        redraw();
    }).on(ROUTE.LIBRARY, ({ steamids }) => {
        actions.setRoute(ROUTE.LIBRARY, { steamids });
        redraw();
    });

    router.listen();
    app(m(App, { state, actions, router }), root);

    // window.servbot.save(() => {
    //     return state;
    // });

    // window.servbot.onload(data => {
    //     // do something with it
    // })
}

mount(document.getElementById('app'));