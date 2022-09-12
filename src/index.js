import m from 'mithril';
import { State, Actions } from './state';
import { Home } from './Home';
import { Apps } from './Apps';

function mount(root) {
    const state = State();
    const actions = Actions(state);

    m.route.prefix = '';
    m.route(root, '/', {
        '/': {
            render: () =>
                m(Home, { state, actions })
        },

        '/:ids': {
            render: ({ attrs: { ids } }) =>
                m(Apps, { state, actions, ids })
        }
    });
}

mount(document.getElementById('app'));