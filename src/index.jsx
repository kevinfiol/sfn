import { m, mount, redraw } from "umai";
import navaid from "navaid";
import { State, Actions } from "./state";
import { Spinner } from "./components";

const SEARCH = import("./Search.jsx");
const APPS = import("./Apps.jsx");

let $page;

function run(thunk, props) {
  return Promise.resolve(thunk)
    .then((mod) => {
      $page = () => m(mod.default || mod, props);
    })
    .then(redraw);
}

const App = ({ state }) => (
  <div>
    {state.loading && <Spinner />}

    <div class={{ page: true, "-loading": state.loading }}>
      <$page />
    </div>
  </div>
);

function mountApp(root) {
  const router = navaid();
  const state = State();
  const actions = Actions(state);
  const ctx = { state, actions, router };

  mount(root, () => <App {...ctx} />);

  router
    .on("/", () => {
      actions.reset();
      run(SEARCH, ctx);
    })
    .on("/:steamids", ({ steamids }) => {
      const component = steamids && steamids.indexOf(",") > -1 ? APPS : SEARCH;

      run(component, { ...ctx, steamids });
    });

  router.listen();
}

mountApp(document.getElementById("app"));
