import { m, mount, redraw } from 'umai';
import navaid from 'navaid';
import { State, Actions } from './state';
import { Spinner } from './components';

const SEARCH = import('./Search.js');
const APPS = import('./Apps.js');

let $page;

function run(thunk, props) {
  return Promise.resolve(thunk).then((mod) => {
    $page = () => m(mod.default || mod, props);
  }).then(redraw);
}

const App = ({ state }) => (
  m('div',
    state.loading &&
      m(Spinner)
    ,

    m('div.page', { class: { '-loading': state.loading } },
      m($page)
    )
  )
);

function mountApp(root) {
  const router = navaid();
  const state = State();
  const actions = Actions(state);
  const ctx = { state, actions, router };

  mount(root, () => m(App, ctx));

  router
    .on('/', () => {
      actions.reset();
      run(SEARCH, ctx);
    })
    .on('/:steamids', ({ steamids }) => {
      const component = steamids && steamids.indexOf(',') > -1
        ? APPS
        : SEARCH;

      run(component, { ...ctx, steamids });
    });

  router.listen();
}

mountApp(document.getElementById('app'));