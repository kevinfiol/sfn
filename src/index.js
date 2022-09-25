import m from 'mithril';
import cls from 'classies';
import { State, Actions } from './state';
import { Spinner } from './components';
import { Home } from './Home';
import { Apps } from './Apps';

const Layout = () => ({
    view: ({ attrs: { state }, children }) =>
        m('div',
            state.loading &&
                m(Spinner)
            ,

            m('div.page', { className: cls({ '-loading': state.loading }) },
                children
            )
        )
});

function mount(root) {
    const state = State();
    const actions = Actions(state);

    m.route.prefix = '';
    m.route(root, '/', {
        '/': {
            render: () =>
                m(Layout, { state },
                    m(Home, { state, actions })
                )
        },

        '/:steamids': {
            render: ({ attrs: { steamids } }) =>
                m(Layout, { state },
                    m(Apps, { state, actions, steamids })
                )
        }
    });
}

mount(document.getElementById('app'));