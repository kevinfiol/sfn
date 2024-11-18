import { m } from "umai";
import { TextInput, UserCard } from "./components";
import { getFriends } from "./api";

export default function Search({ state, actions, router, steamids }) {
  let steamid = steamids || "";

  if (steamids && !state.user) {
    goToFriends();
  }

  async function goToFriends(ev) {
    if (!steamid) return;
    if (ev) ev.preventDefault();

    actions.setLoading(true);
    const { data, error } = await getFriends(steamid);
    actions.setLoading(false);

    if (error) {
      actions.setError("Unable to retrieve profiles. Is your profile private?");
    } else {
      actions.setProfiles(data);
      router.route("/" + steamid);
    }
  }

  async function compareLibraries(idString = "") {
    router.route("/" + idString);
  }

  return ({ state }) => (
    <div>
      <section>
        <form class="input-group" onsubmit={goToFriends}>
          <TextInput
            value={steamid}
            placeholder="enter steamid"
            onInput={(v) => (steamid = v)}
          />
          <button class="border border-left-0" disabled={!steamid}>
            submit
          </button>
        </form>
      </section>

      {state.error && (
        <section>
          <div class="error">{state.error}</div>
        </section>
      )}

      {state.user && (
        <section>
          <hr />
          <h2>User</h2>
          <UserCard profile={state.user} showHeader={true} />
        </section>
      )}

      {state.user && state.friends.length > 0 && (
        <section class="pb-7">
          <hr />
          <h2>Friends</h2>
          <div class="grid columns-200 gap-1">
            {state.friends.map((friend) => (
              <UserCard
                key={friend.steamid}
                profile={friend}
                isStaged={state.staged[friend.steamid]}
                onClick={() => actions.toggleStage(friend)}
              />
            ))}
          </div>
        </section>
      )}

      {state.stagedCount > 1 && (
        <div class="panel">
          <div>{state.stagedCount - 1 + " friends selected"}</div>

          <button onclick={() => compareLibraries(state.idString)}>
            Compare Libraries
          </button>
        </div>
      )}
    </div>
  );
}
