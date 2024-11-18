import { m } from "umai";

export const TextInput = ({ placeholder, value, onInput }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value || ""}
    oninput={({ target }) => onInput(target.value)}
  />
);

export const Spinner = () => {
  let el;
  let timer = undefined;
  let step = 0;

  const MS = 100;
  const steps = ["|", "/", "-", "\\", "|", "/", "-", "\\"];
  const len = steps.length;

  const onMount = (node) => {
    el = node;
    timer = setInterval(() => {
      step += 1;
      if (step === len) step = 0;
      node.innerText = steps[step];
    }, MS);

    return () => {
      if (el) el.innerText = "";
      clearInterval(timer);
    };
  };

  return () => <div class="spinner" dom={onMount}></div>;
};

export const UserCard = ({ profile, onClick, isStaged, showHeader }) => (
  <article
    class={{
      card: true,
      "-user": true,
      "-staged": isStaged,
      clickable: profile.visible && onClick,
      "opacity-50": !profile.visible,
    }}
    onclick={profile.visible && onClick}
  >
    {showHeader && (
      <header>
        <a href={profile.profileurl}>{profile.profileurl}</a>
      </header>
    )}

    <div class="body">
      <img style="width: 40px" src={profile.avatar} />
      <span>{profile.personaname}</span>
      {isStaged && <span class="checkmark">✓</span>}
    </div>
  </article>
);

export const AppCard = ({
  key,
  name,
  platforms,
  steam_appid,
  header_image,
}) => (
  <article class="card -app">
    <div class="body" key={key}>
      <a
        class="-neutral"
        href={`https://store.steampowered.com/app/${steam_appid}`}
      >
        <img class="border" loading="lazy" src={header_image} />
      </a>

      <span>{name}</span>

      <small class="block">
        {/* makes a string like `windows / linux / mac` */}
        {Object.entries(platforms).reduce((str, platform) => {
          if (platform[1]) str += str ? " / " + platform[0] : platform[0];
          return str;
        }, "")}
      </small>
    </div>
  </article>
);

export const CheckBox = ({ name, value, checked, onChange }) => (
  <div class={{ checkbox: true, "-selected": checked }}>
    <label for={value}>
      <span class="name">{name}</span>
      <input
        type="checkbox"
        id={value}
        value={value}
        checked={checked}
        onchange={({ target }) => onChange(target.checked)}
      />
    </label>
  </div>
);
