import { m, redraw } from "umai";
import { UserCard, AppCard, TextInput, CheckBox } from "./components";
import { getProfiles, getCategories, getCommonApps } from "./api";

const MULTIPLAYER_CATEGORIES = ["1", "9", "20", "27", "36", "38"];

async function fetchPageData(steamids = "", stagedProfiles = {}) {
  let error = undefined;
  let data = {
    profiles: [],
    categories: [],
    apps: [],
  };

  const profileList = Object.values(stagedProfiles);
  const profileData =
    profileList.length > 0 ? { data: profileList } : undefined;

  try {
    const [profiles, categories, apps] = await Promise.all([
      profileData || getProfiles(steamids),
      getCategories(),
      getCommonApps(steamids),
    ]);

    const error = profiles.error || categories.error || apps.error;
    if (error) throw error;

    data = {
      profiles: profiles.data,
      categories: categories.data,
      apps: apps.data,
    };
  } catch (e) {
    console.error("Error fetching Apps page data: ", e);
    error = e instanceof Error ? "Unable to retrieve profile data" : e;
  }

  return { data, error };
}

export default function Apps({ state, actions, steamids }) {
  // on page change
  window.scroll(0, 0);

  let textInput = "";
  let checkedCategories = [];
  let filtered = [];
  let isExclusive = false;

  let profiles = [];
  let categories = [];
  let apps = [];

  actions.setLoading(true);
  fetchPageData(steamids, state.staged).then(({ data, error }) => {
    if (error) {
      actions.setError(error);
    } else {
      profiles = data.profiles;
      categories = data.categories;
      filtered = apps = data.apps;
    }

    actions.setLoading(false);
    redraw();
  });

  function categoryFilter(app) {
    if (!checkedCategories.length) return true;

    let include = isExclusive;

    for (const cat of checkedCategories) {
      if (!isExclusive) {
        if (app.categoryMap[cat]) return true;
      } else {
        include = include && app.categoryMap[cat];
      }
    }

    return include;
  }

  function textFilter(app) {
    const input = textInput.trim();
    if (!input) return true;
    return app.name.toLowerCase().indexOf(input.toLowerCase()) > -1;
  }

  function applyFilters() {
    filtered = apps.filter(categoryFilter).filter(textFilter);
  }

  return () => (
    <div>
      {state.error && <div class="error">{state.error}</div>}

      {!state.loading && !state.error && (
        <>
          <section>
            <hr />
            <h2>Profiles</h2>
            <div class="grid columns-200 gap-1">
              {profiles.map((profile) => (
                <UserCard profile={profile} showHeader={true} />
              ))}
            </div>
          </section>

          <section>
            <hr />
            <h2>Categories</h2>
            <div class="subsection gap-1 flex">
              <button
                onclick={() => {
                  checkedCategories = [...MULTIPLAYER_CATEGORIES];
                  applyFilters();
                }}
              >
                Check Multiplayer Categories
              </button>

              <button
                onclick={() => {
                  checkedCategories = [];
                  applyFilters();
                }}
              >
                Uncheck All
              </button>

              <CheckBox
                name="Exclusively Filter"
                value="exclusive"
                checked={isExclusive}
                onChange={(checked) => {
                  isExclusive = checked;
                  applyFilters();
                }}
              />
            </div>

            <div class="grid columns-250 gap-1">
              {categories.map(([value, name]) => (
                <CheckBox
                  name={name}
                  value={value}
                  checked={checkedCategories.includes(value)}
                  onChange={(checked) => {
                    if (checked) {
                      checkedCategories.push(value);
                    } else {
                      const idx = checkedCategories.indexOf(value);
                      if (~idx) checkedCategories.splice(idx, 1);
                    }

                    applyFilters();
                  }}
                />
              ))}
            </div>
          </section>

          <section>
            <hr />
            <h2>{`Apps (${filtered.length})`}</h2>
            <TextInput
              placeholder="filter by name"
              value={textInput}
              onInput={(v) => {
                textInput = v;
                applyFilters();
              }}
            />

            <div class="grid columns-200-fill gap-1" style="padding: 1rem 0;">
              {filtered.map((app) => (
                <AppCard {...app} />
              ))}
            </div>

            {!filtered.length && (
              <blockquote style="margin-bottom: 25rem; font-size: 1.25em;">
                No Apps Found.
              </blockquote>
            )}
          </section>
        </>
      )}
    </div>
  );
}
